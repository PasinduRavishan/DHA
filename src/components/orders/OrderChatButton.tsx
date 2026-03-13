'use client';

import { MessageCircle } from 'lucide-react';
import useChatStore from '@/lib/store/chat';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface OrderChatButtonProps {
    order: {
        id: string;
        orderNumber: string;
        totalAmount: number;
        status: string;
        _count?: {
            items: number;
        };
    };
}

export default function OrderChatButton({ order }: OrderChatButtonProps) {
    const chatStore = useChatStore();
    const [loading, setLoading] = useState(false);

    const handleClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setLoading(true);

        try {
            // Fetch full order details with items
            const res = await fetch(`/api/orders/${order.id}`);
            if (!res.ok) {
                throw new Error('Failed to fetch order details');
            }

            const fullOrder = await res.json();

            // Map items to the format needed for chat
            const items = fullOrder.items?.map((item: any) => ({
                name: item.product.name,
                quantity: item.quantity,
                price: item.price,
                image: item.product.images?.[0] || '/images/placeholder.png',
                variants: item.variants
            })) || [];

            chatStore.shareOrder({
                id: order.id,
                orderNumber: order.orderNumber,
                totalAmount: order.totalAmount,
                itemCount: order._count?.items || items.length,
                status: order.status,
                items
            });
        } catch (error) {
            console.error('Error fetching order:', error);
            toast.error('Failed to load order details');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            title="Ask about this order in chat"
        >
            <MessageCircle size={16} />
            {loading ? 'Loading...' : 'Ask in Chat'}
        </button>
    );
}
