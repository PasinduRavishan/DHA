'use client';

import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { io as ClientIO, Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    connect: () => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    connect: () => { }
});

export const useSocket = () => {
    return useContext(SocketContext);
};

// Global socket instance
let globalSocket: Socket | null = null;
let isInitializing = false;

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    const connect = useCallback(() => {
        // If already connected or initializing, don't create new connection
        if (globalSocket?.connected || isInitializing) {
            if (globalSocket) {
                setSocket(globalSocket);
                setIsConnected(globalSocket.connected);
            }
            return;
        }

        isInitializing = true;
        console.log('🆕 Initializing socket connection...');

        const socketInstance = ClientIO(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', {
            path: '/api/socket/io',
            addTrailingSlash: false,
            reconnection: true,
            reconnectionDelay: 2000,
            reconnectionDelayMax: 10000,
            reconnectionAttempts: 10,
            transports: ['polling', 'websocket'], // Start with polling, then upgrade
            upgrade: true,
            rememberUpgrade: false,
            timeout: 30000,
            autoConnect: true,
            forceNew: false,
        });

        socketInstance.on('connect', () => {
            console.log('✅ Socket connected:', socketInstance.id);
            setIsConnected(true);
            isInitializing = false;
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('❌ Socket disconnected. Reason:', reason);
            setIsConnected(false);
        });

        socketInstance.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error.message);
            setIsConnected(false);
            isInitializing = false;
        });

        globalSocket = socketInstance;
        setSocket(socketInstance);
    }, []);

    // Cleanup on window unload
    useEffect(() => {
        const handleUnload = () => {
            if (globalSocket) {
                console.log('🚪 Window closing, disconnecting socket...');
                globalSocket.disconnect();
                globalSocket = null;
            }
        };

        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected, connect }}>
            {children}
        </SocketContext.Provider>
    );
};
