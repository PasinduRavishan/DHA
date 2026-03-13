import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export const initSocketIO = (httpServer: any) => {
    if (io) {
        return io;
    }

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
        console.log('✅ Client connected:', socket.id);

        // Join a specific chat room
        socket.on('join-chat', (chatId: string) => {
            socket.join(`chat:${chatId}`);
            console.log(`📨 Socket ${socket.id} joined chat:${chatId}`);
        });

        // Leave a chat room
        socket.on('leave-chat', (chatId: string) => {
            socket.leave(`chat:${chatId}`);
            console.log(`👋 Socket ${socket.id} left chat:${chatId}`);
        });

        // Admin joins all chats room (for notifications)
        socket.on('join-admin', () => {
            socket.join('admin-room');
            console.log(`👨‍💼 Admin socket ${socket.id} joined admin-room`);
        });

        // Typing indicators
        socket.on('typing', ({ chatId, isTyping }: { chatId: string; isTyping: boolean }) => {
            socket.to(`chat:${chatId}`).emit('user-typing', { isTyping });
        });

        socket.on('disconnect', () => {
            console.log('❌ Client disconnected:', socket.id);
        });
    });

    console.log('🚀 Socket.io server initialized');
    return io;
};

export const getIO = (): SocketIOServer | null => {
    return io;
};

// Emit a new message to a specific chat room
export const emitNewMessage = (chatId: string, message: any) => {
    if (io) {
        io.to(`chat:${chatId}`).emit('new-message', message);
        // Also notify admin room
        io.to('admin-room').emit('chat-updated', { chatId, message });
    }
};

// Emit chat status update
export const emitChatStatusUpdate = (chatId: string, status: string) => {
    if (io) {
        io.to(`chat:${chatId}`).emit('chat-status-changed', { status });
        io.to('admin-room').emit('chat-status-changed', { chatId, status });
    }
};
