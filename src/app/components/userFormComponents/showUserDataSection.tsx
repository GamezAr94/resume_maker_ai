export default function ShowUserDataSection({
    children,
    isPersonal,
}: Readonly<{
    children: React.ReactNode;
    isPersonal?: boolean;
}>) {
    return (
        <div>
            {isPersonal ? (
                <p>Information Section</p>
            ) : (
                <>
                    <p>Existing Records</p>
                    {children || (
                        <p>
                            You dont have any record. Please, add some
                            information so that you can generate a new resume
                        </p>
                    )}
                </>
            )}
            {children}
        </div>
    );
}
