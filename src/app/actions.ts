'use server';

import { encodedRedirect } from '@/utils/utils';
import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const signUpAction = async (formData: FormData) => {
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();
    const firstName = formData.get('first_name')?.toString();
    const lastName = formData.get('last_name')?.toString();
    const confirmPassword = formData.get('confirm_password')?.toString();
    const supabase = await createClient();
    const origin = (await headers()).get('origin');

    // validate email
    if (!email || !password) {
        return encodedRedirect(
            'error',
            '/sign-up',
            'Email and password are required',
        );
    }

    // validate password length
    if (password.length < 8) {
        return encodedRedirect(
            'error',
            '/sign-up',
            'Password must be at least 8 characters long.',
        );
    }

    // validate confirm password
    if (password !== confirmPassword) {
        return encodedRedirect(
            'error',
            '/sign-up',
            'Passwords do not match. Please try again.',
        );
    }

    // validate the password requirements
    // NOTE: this controls the server side validation of the password
    //       the client side validation is done in the sign-up form component
    const passwordRequirements = [
        { re: /[0-9]/, label: 'Password must include at least one number.' },
        {
            re: /[a-z]/,
            label: 'Password must include at least one lowercase letter.',
        },
        {
            re: /[A-Z]/,
            label: 'Password must include at least one uppercase letter.',
        },
        /*
        {
            re: /[$&+,:;=?@#|'<>.^*()%!-]/,
            label: 'Password must include at least one special symbol.',
        },
        */
    ];

    for (const requirement of passwordRequirements) {
        if (!password || !requirement.re.test(password)) {
            return encodedRedirect('error', '/sign-up', requirement.label);
        }
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
            },
            emailRedirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        console.error(error.code + ' ' + error.message);
        return encodedRedirect('error', '/sign-up', error.message);
    } else {
        return encodedRedirect(
            'success',
            '/sign-up',
            'Thanks for signing up! Please check your email for a verification link.',
        );
    }
};

export const signInAction = async (formData: FormData) => {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const rememberMe = formData.get('rememberMe') === 'on';

    const supabase = await createClient();

    const {
        data: { session },
        error,
    } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return encodedRedirect('error', '/sign-in', error.message);
    }

    if (rememberMe && session) {
        // With the session, we can now set a long-lived cookie
        await supabase.auth.setSession({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
        });
    }

    return redirect('/');
};

export const forgotPasswordAction = async (formData: FormData) => {
    const email = formData.get('email')?.toString();
    const supabase = await createClient();
    const origin = (await headers()).get('origin');
    const callbackUrl = formData.get('callbackUrl')?.toString();

    if (!email) {
        return encodedRedirect(
            'error',
            '/forgot-password',
            'Email is required',
        );
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?redirect_to=/reset-password`,
    });

    if (error) {
        console.error(error.message);
        return encodedRedirect(
            'error',
            '/forgot-password',
            'Could not reset password',
        );
    }

    if (callbackUrl) {
        return redirect(callbackUrl);
    }

    return encodedRedirect(
        'success',
        '/forgot-password',
        'Check your email for a link to reset your password.',
    );
};

export const resetPasswordAction = async (formData: FormData) => {
    const supabase = await createClient();

    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!password || !confirmPassword) {
        return encodedRedirect(
            'error',
            '/reset-password',
            'Password and confirm password are required',
        );
    }

    if (password !== confirmPassword) {
        return encodedRedirect(
            'error',
            '/reset-password',
            'Passwords do not match',
        );
    }

    const { error } = await supabase.auth.updateUser({
        password: password,
    });

    if (error) {
        return encodedRedirect(
            'error',
            '/reset-password',
            'Password update failed',
        );
    }

    return encodedRedirect('success', '/reset-password', 'Password updated');
};

export const signOutAction = async () => {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect('/sign-in');
};
