'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageSquare, X, Send, Minus, LayoutDashboard, Maximize2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useChatStore from '@/lib/store/chat';
import MessageBubble from './MessageBubble';
import { useSocket } from '@/lib/socket';

interface Message {
    id: string;
    message: string;
    senderId: string;
    isAdmin: boolean;
    createdAt: string;
    metadata?: any;
}

export default function ChatWidget() {
    const { data: session } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const chatStore = useChatStore();
    const { socket, isConnected, connect } = useSocket();

    // Local state for chat content
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatId, setChatId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial fetch of chat data
    const fetchChat = async () => {
        try {
            const res = await fetch('/api/chat/my');
            if (res.ok) {
                const data = await res.json();
                if (data) {
                    setChatId(data.id);
                    setMessages(data.messages || []);
                }
            }
        } catch (error) {
            console.error("Failed to fetch chat");
        }
    };

    // Connect socket and fetch chat when widget opens
    useEffect(() => {
        if (session?.user.role !== 'ADMIN' && chatStore.isOpen) {
            connect(); // Initialize socket connection
            if (!chatId) {
                fetchChat();
            }
        }
    }, [chatStore.isOpen, session, connect]);

    // Socket.io real-time listeners
    useEffect(() => {
        if (!socket || !chatId || !isConnected) return;

        // Join the chat room
        socket.emit('join-chat', chatId);

        // Listen for new messages
        const handleNewMessage = (message: Message) => {
            setMessages((prev) => {
                // Prevent duplicates
                if (prev.some(m => m.id === message.id)) {
                    return prev;
                }
                return [...prev, message];
            });
        };

        socket.on('new-message', handleNewMessage);

        // Cleanup
        return () => {
            socket.off('new-message', handleNewMessage);
            socket.emit('leave-chat', chatId);
        };
    }, [socket, chatId, isConnected]);

    // Handle Prefilled Message and Shared Content
    useEffect(() => {
        if (chatStore.isOpen && chatStore.prefilledMessage) {
            setNewMessage(chatStore.prefilledMessage);
        }
    }, [chatStore.isOpen, chatStore.prefilledMessage]);

    // Auto-send shared product/order
    useEffect(() => {
        if (chatStore.isOpen && (chatStore.sharedProduct || chatStore.sharedOrder)) {
            handleSendSharedContent();
        }
    }, [chatStore.isOpen, chatStore.sharedProduct, chatStore.sharedOrder]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (chatStore.isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, chatStore.isOpen]);

    const handleSendSharedContent = async () => {
        const metadata = chatStore.sharedProduct
            ? { type: 'product', ...chatStore.sharedProduct }
            : chatStore.sharedOrder
                ? { type: 'order', ...chatStore.sharedOrder }
                : null;

        if (!metadata) return;

        const message = chatStore.prefilledMessage || '';

        try {
            const res = await fetch('/api/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    chatId,
                    metadata
                })
            });

            if (res.ok) {
                const savedMsg = await res.json();
                // Add message only if it doesn't exist (prevent duplicates from socket)
                setMessages(prev => {
                    if (prev.some(m => m.id === savedMsg.id)) {
                        return prev;
                    }
                    return [...prev, savedMsg];
                });
                if (!chatId) setChatId(savedMsg.chatId);
                chatStore.clearShared();
                setNewMessage('');
            } else {
                toast.error("Failed to send");
            }
        } catch {
            toast.error("Error sending message");
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const tempMsg = newMessage;
        setNewMessage('');

        try {
            const res = await fetch('/api/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: tempMsg,
                    chatId: chatId // Optional, api finds active chat
                })
            });

            if (res.ok) {
                const savedMsg = await res.json();
                // Add message only if it doesn't exist (prevent duplicates from socket)
                setMessages(prev => {
                    if (prev.some(m => m.id === savedMsg.id)) {
                        return prev;
                    }
                    return [...prev, savedMsg];
                });
                if (!chatId) setChatId(savedMsg.chatId); // First message sets ID
            } else {
                toast.error("Failed to send");
                setNewMessage(tempMsg);
            }
        } catch {
            toast.error("Error sending message");
            setNewMessage(tempMsg);
        }
    };

    // Render logic
    if (!session || pathname === '/chat') return null;

    // Admin View: Simple button to go to Dashboard
    if (session.user.role === 'ADMIN') {
        return (
            <div className="fixed bottom-6 right-6 z-50 group">
                <button
                    onClick={() => router.push('/admin/chats')}
                    className="bg-zinc-800 text-white p-4 rounded-full shadow-lg hover:bg-zinc-700 hover:scale-110 transition-all duration-300 flex items-center gap-2"
                    title="Go to Chat Management"
                >
                    <MessageSquare size={24} />
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-sm font-medium">
                        Manage Chats
                    </span>
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Toggle Button */}
            {!chatStore.isOpen && (
                <button
                    onClick={() => chatStore.onOpen()}
                    className="bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 hover:scale-110 transition-all duration-300 animate-bounce-subtle"
                >
                    <MessageSquare size={24} />
                </button>
            )}

            {/* Chat Window */}
            {chatStore.isOpen && (
                <div className="bg-white dark:bg-zinc-900 w-80 sm:w-96 rounded-2xl shadow-2xl border border-secondary-200 dark:border-zinc-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 h-[500px]">
                    {/* Header */}
                    <div className="bg-primary-600 p-4 flex justify-between items-center text-white">
                        <div>
                            <h3 className="font-bold">Chat with Us</h3>
                            <p className="text-xs text-primary-100">Usually replies in minutes</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => router.push('/chat')}
                                className="hover:bg-primary-700 p-1 rounded transition"
                                title="Open full screen"
                            >
                                <Maximize2 size={16} />
                            </button>
                            <button onClick={() => chatStore.onClose()} className="hover:bg-primary-700 p-1 rounded transition">
                                <Minus size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50 dark:bg-black">
                        {messages.length === 0 ? (
                            <div className="text-center text-sm text-secondary-500 mt-10">
                                <p>👋 Hi! How can we help you today?</p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <MessageBubble
                                    key={msg.id}
                                    message={msg.message}
                                    isAdmin={msg.isAdmin}
                                    metadata={msg.metadata}
                                    createdAt={msg.createdAt}
                                />
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 bg-white dark:bg-zinc-900 border-t border-secondary-200 dark:border-zinc-800">
                        <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 border border-secondary-300 dark:border-zinc-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-transparent text-foreground dark:text-white"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition disabled:opacity-50"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
