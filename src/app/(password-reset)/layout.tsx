export default async function PasswordResetLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // If they are logged in (via the recovery link), show the page.
    return <>{children}</>;
}
