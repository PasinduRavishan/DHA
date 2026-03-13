import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

let io: SocketIOServer | null = null;

export async function GET(req: NextRequest) {
    if (!io) {
        // @ts-ignore - Next.js socket handling
        const httpServer: NetServer = (req as any).socket.server;

        io = new SocketIOServer(httpServer, {
            path: '/api/socket/io',
            addTrailingSlash: false,
            cors: {
                origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
                methods: ['GET', 'POST'],
                credentials: true
            }
        });

        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            // Join a specific chat room
            socket.on('join-chat', (chatId: string) => {
                socket.join(`chat:${chatId}`);
                console.log(`Socket ${socket.id} joined chat:${chatId}`);
            });

            // Leave a chat room
            socket.on('leave-chat', (chatId: string) => {
                socket.leave(`chat:${chatId}`);
                console.log(`Socket ${socket.id} left chat:${chatId}`);
            });

            // Admin joins all chats room (for notifications)
            socket.on('join-admin', () => {
                socket.join('admin-room');
                console.log(`Admin socket ${socket.id} joined admin-room`);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
            });
        });

        console.log('Socket.io server initialized');
    }

    return new Response('Socket.io server is running', { status: 200 });
}

// Export the io instance for use in other API routes
export function getIO(): SocketIOServer | null {
    return io;
}
