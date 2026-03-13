'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Send, User, MessageSquare, Clock, Search, MoreVertical, Phone, Mail, ShoppingBag, Paperclip } from 'lucide-react';
import { toast } from 'react-hot-toast';
import MessageBubble from '@/components/chat/MessageBubble';
import Link from 'next/link';
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

interface ChatPreview {
    id: string;
    status: string;
    updatedAt: string;
    orderId?: string; // Added orderId support
    customer: {
        name: string;
        email: string;
        phone?: string;
    } | null;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    messages: Message[];
}

export default function AdminChatPage() {
    const { data: session } = useSession();
    const { socket, isConnected } = useSocket();
    const [chats, setChats] = useState<ChatPreview[]>([]);
    const [filteredChats, setFilteredChats] = useState<ChatPreview[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch Chats List once on mount
    useEffect(() => {
        const fetchChats = async () => {
            try {
                const res = await fetch('/api/admin/chats');
                if (res.ok) {
                    const data = await res.json();
                    setChats(data);
                }
            } catch (error) {
                console.error("Failed to fetch chats");
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, []);

    // Filter Chats
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredChats(chats);
        } else {
            const lowerQuery = searchQuery.toLowerCase();
            setFilteredChats(chats.filter(chat => {
                const name = chat.customer?.name || chat.guestName || 'Guest';
                return name.toLowerCase().includes(lowerQuery);
            }));
        }
    }, [searchQuery, chats]);

    // Fetch Messages for Selected Chat once
    useEffect(() => {
        if (!selectedChatId) return;

        const fetchMessages = async () => {
            try {
                const res = await fetch(`/api/admin/chats/${selectedChatId}`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data.messages);
                }
            } catch (error) {
                console.error("Failed to fetch messages");
            }
        };

        fetchMessages();
    }, [selectedChatId]);

    // Socket.io: Join admin room and listen for chat updates
    useEffect(() => {
        if (!socket || !isConnected) return;

        // Join admin room to get notifications
        socket.emit('join-admin');

        // Listen for chat updates (new messages from customers)
        const handleChatUpdated = ({ chatId, message }: { chatId: string; message: Message }) => {
            // Update chat list with latest message
            setChats((prev) => {
                return prev.map(chat => {
                    if (chat.id === chatId) {
                        return {
                            ...chat,
                            messages: [message],
                            updatedAt: message.createdAt
                        };
                    }
                    return chat;
                }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            });

            // If this is the selected chat, add message
            if (chatId === selectedChatId) {
                setMessages((prev) => {
                    if (prev.some(m => m.id === message.id)) {
                        return prev;
                    }
                    return [...prev, message];
                });
            }
        };

        socket.on('chat-updated', handleChatUpdated);

        return () => {
            socket.off('chat-updated', handleChatUpdated);
        };
    }, [socket, isConnected, selectedChatId]);

    // Socket.io: Listen to selected chat room
    useEffect(() => {
        if (!socket || !selectedChatId || !isConnected) return;

        // Join the specific chat room
        socket.emit('join-chat', selectedChatId);

        // Listen for new messages in this chat
        const handleNewMessage = (message: Message) => {
            setMessages((prev) => {
                if (prev.some(m => m.id === message.id)) {
                    return prev;
                }
                return [...prev, message];
            });
        };

        socket.on('new-message', handleNewMessage);

        return () => {
            socket.off('new-message', handleNewMessage);
            socket.emit('leave-chat', selectedChatId);
        };
    }, [socket, selectedChatId, isConnected]);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, selectedChatId]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedChatId) return;

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
                    chatId: selectedChatId,
                    message: '',
                    attachments: [url]
                })
            });

            if (res.ok) {
                const updatedMsg = await res.json();
                // Add message only if it doesn't exist (prevent duplicates from socket)
                setMessages(prev => {
                    if (prev.some(m => m.id === updatedMsg.id)) {
                        return prev;
                    }
                    return [...prev, updatedMsg];
                });
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
        if (!newMessage.trim() || !selectedChatId) return;

        const tempMsg = newMessage;
        setNewMessage('');

        try {
            const res = await fetch('/api/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatId: selectedChatId,
                    message: tempMsg
                })
            });

            if (res.ok) {
                const updatedMsg = await res.json();
                // Add message only if it doesn't exist (prevent duplicates from socket)
                setMessages(prev => {
                    if (prev.some(m => m.id === updatedMsg.id)) {
                        return prev;
                    }
                    return [...prev, updatedMsg];
                });
            } else {
                toast.error("Failed to send");
                setNewMessage(tempMsg);
            }
        } catch {
            toast.error("Error sending message");
            setNewMessage(tempMsg);
        }
    };

    const selectedChat = chats.find(c => c.id === selectedChatId);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        return isToday ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString();
    };

    return (
        <div className="flex h-[calc(100vh-64px)] bg-background dark:bg-black overflow-hidden relative">
            {/* Ambient Background for Depth */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-zinc-900/20 to-transparent pointer-events-none hidden dark:block"></div>

            {/* Sidebar List */}
            <div className={`w-full md:w-96 border-r border-secondary-200 dark:border-white/10 bg-white dark:bg-zinc-950 flex flex-col z-10 md:relative absolute h-full transition-transform duration-300 transform md:translate-x-0 ${selectedChatId ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-secondary-200 dark:border-white/10 dark:bg-zinc-900/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-black text-xl text-foreground dark:text-white tracking-tight">Messages</h2>
                        <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold px-2 py-1 rounded-full">
                            {chats.length}
                        </span>
                    </div>
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-secondary-50 dark:bg-zinc-900 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary-500 transition-all dark:text-white placeholder:text-secondary-400"
                        />
                    </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-secondary-500">Loading...</div>
                    ) : filteredChats.length === 0 ? (
                        <div className="p-8 text-center text-secondary-500 flex flex-col items-center">
                            <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                            <p>No conversations found</p>
                        </div>
                    ) : (
                        filteredChats.map(chat => {
                            const name = chat.customer?.name || chat.guestName || 'Guest User';
                            const isActive = selectedChatId === chat.id;
                            return (
                                <div
                                    key={chat.id}
                                    onClick={() => setSelectedChatId(chat.id)}
                                    className={`group p-4 border-b border-secondary-100 dark:border-white/5 cursor-pointer transition-all duration-200 hover:bg-secondary-50 dark:hover:bg-zinc-900/50 ${isActive ? 'bg-primary-50 dark:bg-white/5 border-l-4 border-l-primary-500' : 'border-l-4 border-l-transparent'}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${isActive ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : 'bg-secondary-200 dark:bg-zinc-800 text-secondary-600 dark:text-zinc-400'}`}>
                                            {getInitials(name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className={`font-semibold text-sm truncate ${isActive ? 'text-primary-900 dark:text-white' : 'text-foreground dark:text-zinc-200'}`}>
                                                    {name}
                                                </h3>
                                                <span className={`text-[10px] ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-secondary-400 dark:text-zinc-500'}`}>
                                                    {chat.updatedAt ? formatTime(chat.updatedAt) : ''}
                                                </span>
                                            </div>
                                            <p className={`text-xs truncate ${isActive ? 'text-primary-700 dark:text-zinc-300' : 'text-secondary-500 dark:text-zinc-500 group-hover:dark:text-zinc-400'}`}>
                                                {chat.messages[0]?.message || ((chat.messages[0]?.attachments?.length ?? 0) > 0 ? '📷 Image' : 'No messages yet')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col bg-secondary-50/50 dark:bg-black z-0 transition-all duration-300 ${!selectedChatId ? 'hidden md:flex' : 'flex'}`}>
                {selectedChatId ? (
                    <>
                        {/* Header */}
                        <div className="h-[88px] px-6 border-b border-secondary-200 dark:border-white/10 bg-white dark:bg-zinc-950 flex justify-between items-center shadow-sm relative z-20">
                            <div className="flex items-center gap-4">
                                {/* Mobile Back Button */}
                                <button
                                    onClick={() => setSelectedChatId(null)}
                                    className="md:hidden p-2 -ml-2 text-secondary-500 hover:text-foreground"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                </button>

                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/20">
                                    {getInitials(selectedChat?.customer?.name || selectedChat?.guestName || 'G')}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-foreground dark:text-white flex items-center gap-2">
                                        {selectedChat?.customer?.name || selectedChat?.guestName || 'Guest'}
                                        {selectedChat?.orderId && (
                                            <Link href={`/admin/orders/${selectedChat.orderId}`}>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-secondary-100 dark:bg-zinc-800 text-secondary-800 dark:text-secondary-200 hover:bg-secondary-200 dark:hover:bg-zinc-700 transition-colors">
                                                    Order Related
                                                </span>
                                            </Link>
                                        )}
                                    </h3>
                                    <p className="text-xs text-secondary-500 dark:text-zinc-400 flex items-center gap-2">
                                        {selectedChat?.customer?.email || selectedChat?.guestEmail || 'No email'}
                                        {selectedChat?.status === 'ACTIVE' && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-secondary-300 dark:bg-zinc-600"></span>
                                                <span className="text-green-600 dark:text-green-400 font-medium">Active Now</span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                {selectedChat?.orderId ? (
                                    <Link href={`/admin/orders/${selectedChat.orderId}`} className="hidden sm:flex items-center gap-2 px-3 py-2 bg-secondary-100 dark:bg-zinc-900 rounded-lg text-xs font-medium text-secondary-700 dark:text-zinc-300 hover:bg-secondary-200 dark:hover:bg-zinc-800 transition-colors">
                                        <ShoppingBag className="w-4 h-4" />
                                        View Order
                                    </Link>
                                ) : (
                                    <button className="hidden sm:flex items-center gap-2 px-3 py-2 bg-secondary-100 dark:bg-zinc-900 rounded-lg text-xs font-medium text-secondary-700 dark:text-zinc-300 hover:bg-secondary-200 dark:hover:bg-zinc-800 transition-colors">
                                        <ShoppingBag className="w-4 h-4" />
                                        Create Order
                                    </button>
                                )}
                                <button className="p-2 text-secondary-400 hover:text-foreground dark:hover:text-white transition-colors">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-secondary-50 dark:bg-black scroll-smooth">
                            {messages.map((msg, idx) => (
                                <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`max-w-[70%] group relative ${msg.isAdmin ? 'items-end' : 'items-start'} flex flex-col`}>
                                        <MessageBubble
                                            message={msg.message}
                                            isAdmin={msg.isAdmin}
                                            metadata={msg.metadata}
                                            createdAt={msg.createdAt}
                                            viewerIsAdmin={true}
                                            attachments={msg.attachments}
                                        />
                                        <span className={`text-[10px] mt-1 text-secondary-400 opacity-0 group-hover:opacity-100 transition-opacity px-1`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-secondary-200 dark:border-white/10 bg-white dark:bg-zinc-950">
                            <form onSubmit={handleSendMessage} className="flex gap-4 items-end max-w-4xl mx-auto">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                />
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="w-full pl-5 pr-12 py-3 bg-secondary-50 dark:bg-zinc-900 border border-transparent dark:border-white/5 focus:border-primary-500 focus:bg-white dark:focus:bg-zinc-900 rounded-2xl focus:ring-4 focus:ring-primary-500/10 transition-all dark:text-white placeholder:text-secondary-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-secondary-400 hover:text-primary-500 transition-colors"
                                    >
                                        <Paperclip className="w-5 h-5" />
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-primary-600 text-white p-3 rounded-xl hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-y-0"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-secondary-400 bg-secondary-50/50 dark:bg-black/50">
                        <div className="w-24 h-24 bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center shadow-sm mb-6 animate-pulse">
                            <MessageSquare className="w-10 h-10 text-primary-500/50" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground dark:text-white mb-2">Admin Messaging</h3>
                        <p className="max-w-xs text-center text-secondary-500 dark:text-zinc-500">
                            Select a conversation from the sidebar to chat with customers or resolve inquiries.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
