export default function ShowUserDataSection({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            {children || (
                <p>
                    No records found. Please, add your information to generate a
                    new resume
                </p>
            )}
        </div>
    );
}
