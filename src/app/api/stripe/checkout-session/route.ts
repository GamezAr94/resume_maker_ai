'use server';

import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { TOKEN_COSTS } from '@/app/config/costs.config';
import {
    TokenPack,
    SubscriptionPlan,
    SubscriptionTier,
} from '@/utils/interfaces';
import { User } from '@supabase/auth-js';

export async function POST(req: Request) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return new Response(
            JSON.stringify({ error: { message: 'Not authenticated' } }),
            { status: 401 },
        );
    }

    const { productId } = await req.json(); // Get priceId from the frontend request

    // Find the corresponding token pack from your server-side config.
    // This prevents the client from sending an arbitrary price.
    const tokenPacks = [
        TOKEN_COSTS.TOKEN_PACKAGES.BASIC,
        TOKEN_COSTS.TOKEN_PACKAGES.PREMIUM,
        TOKEN_COSTS.TOKEN_PACKAGES.ULTIMATE,
    ];
    const pack = tokenPacks.find((p) => p.id === productId);

    // TODO if no pack is found means that the productId is invalid but maybe we have a valid plan
    const tokenPlan = [
        TOKEN_COSTS.TOKEN_PLANS.MONTHLY,
        TOKEN_COSTS.TOKEN_PLANS.YEARLY,
    ];
    const plan = tokenPlan.find((p) => p.id === productId);

    if (!pack && !plan) {
        return new Response(
            JSON.stringify({ error: { message: 'Invalid product ID' } }),
            {
                status: 404,
            },
        );
    }

    // Securely fetch the user's subscription tier from your database.
    // This is a crucial step. The client cannot be trusted to provide its own tier.
    const { data: subscription_tier, error: profileError } = await supabase
        .from('user')
        .select('subscription_tier') // and 'subscription_tier' with your column name
        .eq('supabase_id', user.id)
        .single();

    if (profileError || !subscription_tier) {
        return new Response(
            JSON.stringify({
                error: { message: 'Could not find user profile.' },
            }),
            {
                status: 500,
            },
        );
    }

    // Calculate the final price on the server.
    //const userTier = profile.subscription_tier as 'free' | 'monthly' | 'yearly';
    /*
    const userProfile = {
        subscription_tier:
            subscription_tier.subscription_tier as SubscriptionTier, // 'free', 'monthly', or 'yearly'
        stripe_customer_id: subscription_tier.stripe_customer_id || null, // e.g., 'cus_xxxxxxxxxxxx' or null if they've never paid
    };
    */
    const userTier = subscription_tier.subscription_tier as SubscriptionTier; // 'free', 'monthly', or 'yearly'

    //const userTier = userProfile.subscription_tier; // Replace with actual logic to get user's subscription tier
    //const stripeCustomerId = userProfile.stripe_customer_id;

    if (plan) {
        return createSubscriptionPlan(user, plan);
    }

    if (pack) {
        // If it's a token pack, we proceed with one-time payment
        return createTokenPack(user, pack, userTier);
    }

    // This return is just for safety, it shouldn't be reached.
    return new Response(
        JSON.stringify({
            error: { message: 'Product could not be processed.' },
        }),
        { status: 500 },
    );
}

// This function creates a Stripe Checkout Session for a subscription plan
async function createSubscriptionPlan(user: User, plan: SubscriptionPlan) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2024-06-20' as any, // Use a stable version
    });

    const origin = (await headers()).get('origin');

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            // 👇 THIS IS THE KEY PART
            // You provide the real Stripe Price ID directly.
            // This ID comes from your config: plan.id
            line_items: [
                {
                    price: plan.id,
                    quantity: 1,
                },
            ],
            // Use 'subscription' mode for recurring payments
            mode: 'subscription',
            customer_email: user.email, // Pre-fill the email field in the checkout
            // If the user already exists in Stripe, link this new subscription to them
            // This prevents creating duplicate customers in Stripe.
            //customer: stripeCustomerId || undefined,
            //success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            success_url: `${origin}`,
            cancel_url: `${origin}`,
            metadata: {
                userId: user.id, // Your internal user ID
                planId: plan.id, // The Stripe Price ID
                newTier: plan.tierIdentifier, // e.g., 'monthly' or 'yearly'
            },
        });

        return new Response(JSON.stringify({ sessionId: session.id }), {
            status: 200,
        });
    } catch (err) {
        return new Response(
            JSON.stringify({ error: { message: (err as Error).message } }),
            { status: 500 },
        );
    }
}

// This function creates a Stripe Checkout Session for a one-time token pack purchase
async function createTokenPack(
    user: User,
    pack: TokenPack,
    userTier: SubscriptionTier = 'free',
) {
    const discount = TOKEN_COSTS.DISCOUNTED_PACKAGES[userTier] || 0;
    const finalPrice = pack.price * (1 - discount);
    const finalPriceInCents = Math.round(finalPrice * 100); // Stripe needs the price in cents

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2024-06-20' as any,
    });

    const origin = (await headers()).get('origin');

    try {
        const session = await stripe.checkout.sessions.create({
            customer_email: user.email, // Pre-fill the email field in the checkout
            payment_method_types: ['card'],
            line_items: [
                {
                    // Use price_data to create a price on the fly.
                    price_data: {
                        currency: 'cad',
                        product_data: {
                            name: `${pack.tokens.toLocaleString()} Tokens`,
                            description: `One-time purchase for your account.`,
                        },
                        unit_amount: finalPriceInCents,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment', // Use 'subscription' for recurring plans
            //customer: stripeCustomerId || undefined, // Link to existing Stripe customer if available
            //success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            success_url: `${origin}`,
            cancel_url: `${origin}`,
            metadata: {
                userId: user.id, // Pass the user ID to the webhook
                productId: pack.id, // Store which product was purchased
            },
        });

        return new Response(JSON.stringify({ sessionId: session.id }), {
            status: 200,
        });
    } catch (err) {
        return new Response(
            JSON.stringify({ error: { message: (err as Error).message } }),
            { status: 500 },
        );
    }
}
