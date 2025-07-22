import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { TOKEN_COSTS } from '@/app/config/costs.config';

// Use the admin client for server-to-server operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
        return new Response(`Webhook Error: ${(err as Error).message}`, {
            status: 400,
        });
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        // Retrieve the session again from the API, but expand the customer object
        const session = await stripe.checkout.sessions.retrieve(
            event.data.object.id,
            { expand: ['customer'] }, // This forces Stripe to include the full customer object
        );

        const userId = session?.metadata?.userId;

        if (!userId) {
            return new Response('Webhook Error: Missing metadata', {
                status: 400,
            });
        }
        try {
            // --- NEW "FIND OR CREATE CUSTOMER" LOGIC ---
            let stripeCustomerId: string;

            // If the session already has a customer ID, use it.
            if (session.customer) {
                stripeCustomerId = session.customer as string;
            } else {
                // The customer is new. Find them by email or create them.
                const customerEmail = session.customer_details?.email;
                if (!customerEmail) {
                    throw new Error('Customer email not found in session.');
                }

                const existingCustomers = await stripe.customers.list({
                    email: customerEmail,
                    limit: 1,
                });

                if (existingCustomers.data.length > 0) {
                    // Customer found, use their ID
                    stripeCustomerId = existingCustomers.data[0].id;
                } else {
                    // Customer not found, create a new one
                    const newCustomer = await stripe.customers.create({
                        email: customerEmail,
                        name: session.customer_details?.name || undefined,
                    });
                    stripeCustomerId = newCustomer.id;
                }
            }

            // 1. Save the Stripe Customer ID if it's the user's first time.
            await supabaseAdmin
                .from('user')
                .update({ stripe_customer_id: stripeCustomerId })
                .eq('supabase_id', userId)
                .is('stripe_customer_id', null);

            // 2. Handle provisioning based on what was purchased.
            if (session.mode === 'subscription') {
                if (!session.metadata || !session.metadata.newTier) {
                    console.error(
                        'Webhook Error: Missing metadata for newTier',
                    );
                    return new Response(
                        'Webhook Error: Missing metadata for newTier',
                        {
                            status: 400,
                        },
                    );
                }
                const newTier = session.metadata.newTier as
                    | 'monthly'
                    | 'yearly';
                const planDetails = Object.values(TOKEN_COSTS.TOKEN_PLANS).find(
                    (p) => p.tierIdentifier === newTier,
                );

                if (planDetails) {
                    // Update the user's subscription tier
                    await supabaseAdmin
                        .from('user')
                        .update({ subscription_tier: newTier })
                        .eq('supabase_id', userId);

                    // Add the initial tokens for the plan
                    const tokensForPlan =
                        newTier === 'monthly'
                            ? TOKEN_COSTS.TOKEN_PLANS.MONTHLY.tokens
                            : TOKEN_COSTS.TOKEN_PLANS.YEARLY.tokens;
                    await supabaseAdmin.rpc('increment_tokens', {
                        user_id_input: userId,
                        token_amount: tokensForPlan,
                    });
                }
            } else if (session.mode === 'payment') {
                if (!session.metadata || !session.metadata.productId) {
                    console.error(
                        'Webhook Error: Missing metadata for productId',
                    );
                    return new Response(
                        'Webhook Error: Missing metadata for productId',
                        {
                            status: 400,
                        },
                    );
                }
                const productId = session.metadata.productId;
                const pack = Object.values(TOKEN_COSTS.TOKEN_PACKAGES).find(
                    (p) => p.id === productId,
                );

                if (pack) {
                    // Add the purchased tokens to the user's balance
                    await supabaseAdmin.rpc('increment_tokens', {
                        user_id_input: userId,
                        token_amount: pack.tokens,
                    });
                }
            }
        } catch (dbError) {
            console.error('Database update failed:', dbError);
            return new Response('Webhook Error: Database update failed', {
                status: 500,
            });
        }
    }

    return new Response(null, { status: 200 });
}
