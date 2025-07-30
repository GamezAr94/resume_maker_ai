import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const supabase = await createClient();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
            { error: 'Not authenticated' },
            { status: 401 },
        );
    }

    const { data: userData, error: userError } = await supabase
        .from('user')
        .select('stripe_customer_id')
        .eq('supabase_id', user.id)
        .single();

    if (userError || !userData?.stripe_customer_id) {
        return NextResponse.json(
            { error: 'Stripe customer not found.' },
            { status: 404 },
        );
    }

    const { origin } = new URL(req.url);
    const returnUrl = `${origin}`; // Your settings page

    let flowType: string | undefined;
    try {
        // Try to parse the body, but don't fail if it's empty
        const body = await req.json();
        flowType = body.flowType;
    } catch (e) {}

    const portalConfig: Stripe.BillingPortal.SessionCreateParams = {
        customer: userData.stripe_customer_id,
        return_url: returnUrl,
    };

    // If the client specifically requests the 'subscription_update' flow...
    if (flowType === 'subscription_update') {
        const subscriptions = await stripe.subscriptions.list({
            customer: userData.stripe_customer_id,
            status: 'active',
            limit: 1,
        });

        if (subscriptions.data.length === 0) {
            return NextResponse.json(
                { error: 'No active subscription to update.' },
                { status: 404 },
            );
        }

        // Add the flow_data to the portal configuration
        portalConfig.flow_data = {
            type: 'subscription_update',
            subscription_update: {
                subscription: subscriptions.data[0].id,
            },
        };
    }

    try {
        const portalSession = await stripe.billingPortal.sessions.create(
            portalConfig,
        );
        return NextResponse.json({ url: portalSession.url });
    } catch (err) {
        console.error('Error creating portal session:', err);
        return NextResponse.json(
            { error: { message: (err as Error).message } },
            { status: 500 },
        );
    }
}
