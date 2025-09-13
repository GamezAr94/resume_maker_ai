import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');

    const finalRedirectPath =
        searchParams.get('redirect_to') || searchParams.get('next') || '/';

    if (code) {
        const supabase = createClient();
        const { error } = await (
            await supabase
        ).auth.exchangeCodeForSession(code);

        if (!error) {
            // Use the corrected redirect path
            return NextResponse.redirect(`${origin}${finalRedirectPath}`);
        }
    }

    // Redirect to an error page if something goes wrong
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
