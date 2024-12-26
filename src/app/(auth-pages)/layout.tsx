import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
    // This code redirect to the dashboard if it is authenticated
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (user) {
        return redirect("/dashboard");
    }
    return <div>{children}</div>;
}
