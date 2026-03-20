const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    // Initialize Socket.io with proper configuration
    const io = new Server(httpServer, {
        path: '/api/socket/io',
        addTrailingSlash: false,
        cors: {
            origin: '*', // Allow all origins in development
            methods: ['GET', 'POST'],
            credentials: true
        },
        transports: ['websocket', 'polling'],
        allowEIO3: true,
        pingTimeout: 60000,
        pingInterval: 25000,
        upgradeTimeout: 30000,
        maxHttpBufferSize: 1e8,
        allowUpgrades: true
    });

    // Store io instance globally
    global.io = io;

    io.on('connection', (socket) => {
        console.log('✅ Client connected:', socket.id);

        // Join a specific chat room
        socket.on('join-chat', (chatId) => {
            socket.join(`chat:${chatId}`);
            console.log(`📨 Socket ${socket.id} joined chat:${chatId}`);
        });

        // Leave a chat room
        socket.on('leave-chat', (chatId) => {
            socket.leave(`chat:${chatId}`);
            console.log(`👋 Socket ${socket.id} left chat:${chatId}`);
        });

        // Admin joins all chats room
        socket.on('join-admin', () => {
            socket.join('admin-room');
            console.log(`👨‍💼 Admin socket ${socket.id} joined admin-room`);
        });

        // Typing indicators
        socket.on('typing', ({ chatId, isTyping }) => {
            socket.to(`chat:${chatId}`).emit('user-typing', { isTyping });
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ Client disconnected:', socket.id, 'Reason:', reason);
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });
    });

    httpServer
        .once('error', (err) => {
            console.error(err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`🚀 Server ready on http://${hostname}:${port}`);
            console.log(`🔌 Socket.io ready on ws://${hostname}:${port}/api/socket/io`);
        });
});
