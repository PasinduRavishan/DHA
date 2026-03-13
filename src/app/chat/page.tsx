'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Send, User, Paperclip } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useChatStore from '@/lib/store/chat';
import MessageBubble from '@/components/chat/MessageBubble';
import { useSocket } from '@/lib/socket';

interface Message {
    id: string;
    message: string;
    senderId: string;
    isAdmin: boolean;
    createdAt: string;
    metadata?: any;
    attachments?: string[];
}

export default function ChatPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const chatStore = useChatStore();
    const { socket, isConnected } = useSocket();

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatId, setChatId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(true);

    // Redirect if not logged in
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin?callbackUrl=/chat');
        }
    }, [status, router]);

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
        } finally {
            setLoading(false);
        }
    };

    // Fetch chat once on mount
    useEffect(() => {
        if (status === 'authenticated') {
            fetchChat();
        }
    }, [status]);

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

    // Handle Prefilled Message from Store if redirected
    useEffect(() => {
        if (status === 'authenticated' && chatStore.prefilledMessage) {
            setNewMessage(chatStore.prefilledMessage);
        }
    }, [status, chatStore.prefilledMessage]);

    // Auto-send shared product/order
    useEffect(() => {
        if (status === 'authenticated' && (chatStore.sharedProduct || chatStore.sharedOrder)) {
            handleSendSharedContent();
        }
    }, [status, chatStore.sharedProduct, chatStore.sharedOrder]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            toast.loading("Uploading...");
            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!uploadRes.ok) throw new Error("Upload failed");

            const { url } = await uploadRes.json();
            toast.dismiss();

            // Send message with attachment immediately
            const res = await fetch('/api/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatId: chatId, // Can be null, backend handles it for customer
                    message: '',
                    attachments: [url]
                })
            });

            if (res.ok) {
                const updatedMsg = await res.json();
                setMessages(prev => [...prev, updatedMsg]);
                if (!chatId) setChatId(updatedMsg.chatId);
            }
        } catch (error) {
            toast.dismiss();
            toast.error("Failed to upload attachment");
        }

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
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
                    chatId: chatId
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
            } else {
                toast.error("Failed to send");
                setNewMessage(tempMsg);
            }
        } catch {
            toast.error("Error sending message");
            setNewMessage(tempMsg);
        }
    };

    if (status === 'loading' || loading) {
        return <div className="min-h-screen pt-24 text-center">Loading chat...</div>;
    }

    if (!session) return null; // Redirect handled

    return (
        <div className="bg-background dark:bg-black min-h-screen pt-20 pb-10 transition-colors duration-300">
            {/* Ambient Effect */}
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-primary-100/20 dark:from-zinc-900/40 to-transparent pointer-events-none"></div>

            <div className="max-w-4xl mx-auto px-4 h-[calc(100vh-140px)]">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-secondary-200 dark:border-zinc-800 h-full flex flex-col overflow-hidden relative z-10">

                    {/* Header */}
                    <div className="p-4 md:p-6 border-b border-secondary-200 dark:border-zinc-800 bg-secondary-50 dark:bg-zinc-950 flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-foreground dark:text-white">Customer Support</h1>
                            <p className="text-sm text-secondary-500 dark:text-zinc-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Online & Ready to help
                            </p>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 bg-secondary-50/50 dark:bg-black">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-secondary-500 space-y-4 opacity-70">
                                <div className="w-16 h-16 rounded-full bg-secondary-100 dark:bg-zinc-800 flex items-center justify-center">
                                    <User className="w-8 h-8 text-secondary-400" />
                                </div>
                                <div>
                                    <p className="text-lg font-medium">Start a conversation</p>
                                    <p className="text-sm">We are here to assist you with your orders and inquiries.</p>
                                </div>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <MessageBubble
                                    key={msg.id}
                                    message={msg.message}
                                    isAdmin={msg.isAdmin}
                                    metadata={msg.metadata}
                                    createdAt={msg.createdAt}
                                    attachments={msg.attachments}
                                />
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 md:p-6 bg-white dark:bg-zinc-900 border-t border-secondary-200 dark:border-zinc-800">
                        <form onSubmit={handleSendMessage} className="flex gap-4">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                className="hidden"
                                accept="image/*"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-3 rounded-full hover:bg-secondary-100 dark:hover:bg-zinc-800 text-secondary-500 dark:text-zinc-400 transition-colors"
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message here..."
                                className="flex-1 bg-secondary-50 dark:bg-zinc-950 border border-secondary-200 dark:border-zinc-800 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="bg-primary-600 text-white p-3 md:px-6 rounded-full hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-primary-500/25 flex items-center justify-center"
                            >
                                <Send className="w-5 h-5" />
                                <span className="hidden md:inline-block ml-2 font-medium">Send</span>
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
