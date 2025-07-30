import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const supabase = await createClient();
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    // 1. Get the user from Supabase
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json(
            { error: 'Not authenticated' },
            { status: 401 },
        );
    }

    // 2. Get the user's Stripe Customer ID from your database
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

    // 3. Define the return URL (where users go after they're done)
    const { origin } = new URL(req.url);
    const returnUrl = `${origin}`; // Or any other page you want

    // 4. Create a new Portal Session
    try {
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: userData.stripe_customer_id,
            return_url: returnUrl,
        });

        return NextResponse.json({ url: portalSession.url });
    } catch (err) {
        console.error('Error creating portal session:', err);
        return NextResponse.json(
            { error: { message: (err as Error).message } },
            { status: 500 },
        );
    }
}
