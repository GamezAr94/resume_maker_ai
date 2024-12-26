import { signInAction } from "@/app/actions";
import Link from "next/link";
import ActionMsg from "../message";

export default function Login() {
    return (
        <>
            <ActionMsg />
            <form>
                <h1>Sign up</h1>
                <p>
                    Don&apos;t have an account?{" "}
                    <Link href="/sign-up">Sign up</Link>
                </p>
                <div>
                    <p>Label for email</p>
                    <input type="email" name="email" />
                    <p>Label for pass</p>
                    <Link href="/forgot-password">Forgot Password</Link>
                    <input type="password" name="password" />
                    <button type="submit" formAction={signInAction}>
                        Submit
                    </button>
                </div>
            </form>
        </>
    );
}
