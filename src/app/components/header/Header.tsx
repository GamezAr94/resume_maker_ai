'use client';

import { Button, Menu, useMantineColorScheme } from '@mantine/core';
import styles from './header.module.css';
import { signOutAction } from '@/app/actions';

export default function Header() {
    const { setColorScheme, colorScheme } = useMantineColorScheme();
    function toggleTheme() {
        setColorScheme(colorScheme == 'light' ? 'dark' : 'light');
    }
    return (
        <header className={styles.header_container}>
            <div className={styles.logo_area}>
                Logo<p>App Name</p>
            </div>
            <div className={styles.menu_section}>
                <div>T 1</div>
                <Menu position="bottom-end" offset={0}>
                    <Menu.Target>
                        <p>Menu</p>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item>Home</Menu.Item>
                        <Menu.Item>Buy Tokens</Menu.Item>
                        <Menu.Item>Info</Menu.Item>
                        <Menu.Item onClick={toggleTheme}>
                            {colorScheme == 'light' ? 'Dark' : 'Light'} Mode
                        </Menu.Item>
                        <form
                            className={styles.logout_form}
                            action={signOutAction}
                        >
                            <Button
                                variant="filled"
                                size="xs"
                                color="red.5"
                                type="submit"
                            >
                                Logout
                            </Button>
                        </form>
                    </Menu.Dropdown>
                </Menu>
            </div>
        </header>
    );
}
