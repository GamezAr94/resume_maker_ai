import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
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

    // Check if the event is valid
    if (!event || !event.type) {
        return new Response('Webhook Error: Invalid event', { status: 400 });
    }

    console.log(`Received event: ${event.type}`);
    switch (event.type) {
        case 'checkout.session.completed':
            try {
                const session = event.data.object as Stripe.Checkout.Session;

                // Final validation before calling the handler
                if (
                    !session.metadata ||
                    !session.metadata.userId ||
                    !session.customer
                ) {
                    console.error('Invalid session data:', session);
                    throw new Error(
                        ' Webhook Error: missing metadata or customer ID',
                    );
                }
                await handleCheckoutSessionCompleted(session, supabaseAdmin);
            } catch (error) {
                const errorMessage =
                    typeof error === 'object' &&
                    error !== null &&
                    'message' in error
                        ? (error as { message: string }).message
                        : String(error);
                console.error(
                    `Failed to handle checkout session: ${errorMessage}`,
                );
                return new Response(
                    `Failed to handle checkout session: ${errorMessage}`,
                    { status: 500 },
                );
            }
            break;
        case 'customer.subscription.updated':
            try {
                await handleSubscriptionUpdated(
                    event.data.object as Stripe.Subscription,
                    supabaseAdmin,
                );
            } catch (error) {
                const errorMessage =
                    typeof error === 'object' &&
                    error !== null &&
                    'message' in error
                        ? (error as { message: string }).message
                        : String(error);
                console.error(
                    `Failed to handle subscription update: ${errorMessage}`,
                );
                return new Response(
                    `Failed to handle subscription update: ${errorMessage}`,
                    { status: 500 },
                );
            }
            break;
        case 'customer.subscription.deleted':
            try {
                await handleSubscriptionCanceled(
                    event.data.object as Stripe.Subscription,
                    supabaseAdmin,
                );
            } catch (error) {
                const errorMessage =
                    typeof error === 'object' &&
                    error !== null &&
                    'message' in error
                        ? (error as { message: string }).message
                        : String(error);
                console.error(
                    `Failed to handle subscription cancellation: ${errorMessage}`,
                );
                return new Response(
                    `Failed to handle subscription cancellation: ${errorMessage}`,
                    { status: 500 },
                );
            }
            break;
        case 'invoice.payment_succeeded':
            // Call the function to handle invoice payment succeeded
            try {
                await handleInvoicePaymentSucceeded(
                    event.data.object as Stripe.Invoice,
                    supabaseAdmin,
                );
            } catch (error) {
                const errorMessage =
                    typeof error === 'object' &&
                    error !== null &&
                    'message' in error
                        ? (error as { message: string }).message
                        : String(error);
                console.error(
                    `Failed to handle invoice payment succeeded: ${errorMessage}`,
                );
                return new Response(
                    `Failed to handle invoice payment succeeded: ${errorMessage}`,
                    { status: 500 },
                );
            }
            break;
        case 'invoice.payment_failed':
            // TODO : Handle failed invoice payments if needed
            // Handle failed invoice payments if needed
            console.log('Invoice payment failed:', event.data.object);
            break;
        default:
            console.warn(`Unhandled event type: ${event.type}`);
            return new Response(`Unhandled event type: ${event.type}`, {
                status: 400,
            });
    }

    return new Response(null, { status: 200 });
}

// This function handles subscription cancellations
// It updates the user's tier to 'free' when their subscription is canceled.
// It takes the subscription object and the Supabase client as parameters.
// It returns a Response indicating success or failure.
async function handleSubscriptionCanceled(
    subscription: Stripe.Subscription,
    supabaseAdmin: SupabaseClient,
) {
    const stripeCustomerId = subscription.customer as string;
    console.log(`Subscription canceled for customer: ${stripeCustomerId}`);

    // Find the user with that Stripe customer ID and update their tier to 'free'
    const { error } = await supabaseAdmin
        .from('user')
        .update({ subscription_tier: 'free' })
        .eq('stripe_customer_id', stripeCustomerId);

    // If there's an error, throw it so the calling function can catch it
    if (error) {
        throw new Error(
            `Failed to update user tier for customer ${stripeCustomerId}: ${error.message}`,
        );
    }

    console.log(`Successfully set user ${stripeCustomerId} to 'free' tier.`);
}

async function handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session,
    supabaseAdmin: SupabaseClient,
) {
    const userId = session.metadata?.userId;
    if (!userId) {
        throw new Error('User ID not found in session metadata.');
    }

    // --- Handle a new SUBSCRIPTION purchase ---
    if (session.mode === 'subscription') {
        const newTier = session.metadata?.newTier as 'monthly' | 'yearly';
        if (!newTier) {
            throw new Error('Subscription tier not found in session metadata.');
        }

        const planDetails = Object.values(TOKEN_COSTS.TOKEN_PLANS).find(
            (p) => p.tierIdentifier === newTier,
        );

        if (!planDetails) {
            throw new Error(`Plan details not found for tier: ${newTier}`);
        }

        // Update the user's subscription tier in your DB
        const { error } = await supabaseAdmin
            .from('user')
            .update({ subscription_tier: newTier })
            .eq('supabase_id', userId);

        if (error) throw error; // Let the caller catch the DB error

        // Add the initial tokens for the new plan
        await supabaseAdmin.rpc('increment_tokens', {
            user_id_input: userId,
            token_amount: planDetails.tokens,
        });

        console.log(
            `Provisioned subscription for user ${userId} with tier ${newTier}.`,
        );

        // --- Handle a one-time TOKEN PACK purchase ---
    } else if (session.mode === 'payment') {
        const productId = session.metadata?.productId;
        if (!productId) {
            throw new Error('Product ID not found in session metadata.');
        }

        const pack = Object.values(TOKEN_COSTS.TOKEN_PACKAGES).find(
            (p) => p.id === productId,
        );

        if (!pack) {
            throw new Error(
                `Token pack details not found for ID: ${productId}`,
            );
        }

        // Add the purchased tokens to the user's balance
        await supabaseAdmin.rpc('increment_tokens', {
            user_id_input: userId,
            token_amount: pack.tokens,
        });

        console.log(`Provisioned token pack for user ${userId}.`);
    }
}

// This function handles invoice payment succeeded events
// It grants tokens to the user for their subscription renewal.
// It takes the invoice object and the Supabase client as parameters.
// It returns a Response indicating success or failure.
async function handleInvoicePaymentSucceeded(
    invoice: Stripe.Invoice,
    supabaseAdmin: SupabaseClient,
) {
    // This check is crucial. It ensures we only grant tokens for recurring subscription payments,
    // not for other things like the initial subscription creation or other one-off invoices.
    if (
        invoice.billing_reason !== 'subscription_cycle' &&
        invoice.billing_reason !== 'subscription_update'
    ) {
        console.log(
            `Skipping invoice ${invoice.id}: Not a subscription renewal.`,
        );
        return;
    }

    const stripeCustomerId = invoice.customer as string;
    if (!stripeCustomerId) {
        throw new Error('Customer ID not found in invoice.');
    }

    // The invoice contains the line items for the purchase.
    // For a simple subscription, there will be one line item.
    const lineItem = invoice.lines.data[0];
    const priceId = lineItem?.pricing?.price_details?.price;

    if (!priceId) {
        throw new Error('Price ID not found in invoice line items.');
    }

    // Find the plan details based on the Price ID to know how many tokens to grant.
    const planDetails = Object.values(TOKEN_COSTS.TOKEN_PLANS).find(
        (p) => p.id === priceId,
    );

    if (!planDetails) {
        throw new Error(`Plan details not found for Price ID: ${priceId}`);
    }

    // Find the user by their Stripe customer ID
    const { data: user, error: userError } = await supabaseAdmin
        .from('user')
        .select('supabase_id')
        .eq('stripe_customer_id', stripeCustomerId)
        .single();

    if (userError || !user) {
        throw new Error(
            `User not found for Stripe customer ID: ${stripeCustomerId}`,
        );
    }

    // Grant the tokens for the new billing cycle
    await supabaseAdmin.rpc('increment_tokens', {
        user_id_input: user.supabase_id,
        token_amount: planDetails.tokens,
    });

    console.log(`Provisioned renewal tokens for user ${user.supabase_id}.`);
}

// This function handles subscription updates
// It updates the user's subscription tier in your database when their subscription is updated.
// It takes the subscription object and the Supabase client as parameters.
// It returns a Response indicating success or failure.
// It also updates the user's tier based on the new Price ID.
// This is crucial to ensure the user's tier is always in sync with their subscription.
// It returns a Response indicating success or failure.
async function handleSubscriptionUpdated(
    subscription: Stripe.Subscription,
    supabaseAdmin: SupabaseClient,
) {
    const stripeCustomerId = subscription.customer as string;

    // Get the new Price ID from the subscription's line items
    const newPriceId = subscription.items.data[0]?.price.id;
    if (!newPriceId) {
        throw new Error('New Price ID not found in subscription update.');
    }

    // Find the corresponding plan in your config to get the tier identifier ('monthly' or 'yearly')
    const planDetails = Object.values(TOKEN_COSTS.TOKEN_PLANS).find(
        (p) => p.id === newPriceId,
    );

    if (!planDetails) {
        throw new Error(
            `Plan details not found for updated Price ID: ${newPriceId}`,
        );
    }

    const newTier = planDetails.tierIdentifier;

    // Update the user's subscription_tier in your database
    const { error } = await supabaseAdmin
        .from('user')
        .update({ subscription_tier: newTier })
        .eq('stripe_customer_id', stripeCustomerId);

    if (error) {
        throw new Error(
            `Failed to update subscription tier for customer ${stripeCustomerId}: ${error.message}`,
        );
    }

    console.log(
        `Successfully updated user ${stripeCustomerId} to new tier: ${newTier}.`,
    );
}
