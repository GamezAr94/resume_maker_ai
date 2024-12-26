import { signUpAction } from "@/app/actions";
import Link from "next/link";
import ActionMsg from "../message";

export default function Login() {
    return (
        <>
            <ActionMsg />
            <form>
                <h1>Sign up</h1>
                <p>
                    Already have an account?{" "}
                    <Link href="/sign-in">Sign un</Link>
                </p>
                <div>
                    <p>Label for email</p>
                    <input type="email" name="email" />
                    <p>Label for pass</p>
                    <input type="password" name="password" />
                    <button type="submit" formAction={signUpAction}>
                        Submit
                    </button>
                </div>
            </form>
        </>
    );
}
