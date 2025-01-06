'use client';

import { signOutAction } from '@/app/actions';
import { Button, useMantineColorScheme } from '@mantine/core';

export default function Header() {
    const { setColorScheme, clearColorScheme } = useMantineColorScheme();
    return (
        <header>
            <div>
                Logo<p>App Name</p>
            </div>
            <div>
                <div>Tokens #</div>
                <div>Hamburger menu</div>
                <form action={signOutAction}>
                    <button type="submit">Logout</button>
                </form>
                <Button
                    styles={{ root: { height: 69 } }}
                    onClick={() => setColorScheme('light')}
                >
                    light
                </Button>
                <Button onClick={() => setColorScheme('dark')}>dark</Button>
            </div>
        </header>
    );
}
