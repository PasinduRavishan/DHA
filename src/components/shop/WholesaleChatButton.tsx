'use client';

import useChatStore from '@/lib/store/chat';
import { MessageSquare } from 'lucide-react';

export default function WholesaleChatButton() {
    const { onOpen } = useChatStore();
    return (
        <button
            onClick={() => onOpen("Hi, I would like to place a wholesale order for...")}
            className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-all hover:scale-105"
        >
            <MessageSquare className="mr-2" size={20} />
            Place Order via Chat
        </button>
    );
}
