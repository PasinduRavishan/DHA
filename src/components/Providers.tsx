'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from 'next-themes';
import CartDrawer from './shop/CartDrawer';
import ChatWidget from './chat/ChatWidget';
import { SocketProvider } from '@/lib/socket';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                <SocketProvider>
                    {children}
                    <Toaster position="bottom-right" />
                    <CartDrawer />
                    <ChatWidget />
                </SocketProvider>
            </ThemeProvider>
        </SessionProvider>
    );
}
