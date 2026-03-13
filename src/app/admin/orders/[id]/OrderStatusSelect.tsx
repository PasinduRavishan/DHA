'use client';

import { useState, useTransition } from 'react';
import { updateOrderStatus } from '../actions';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface OrderStatusSelectProps {
    orderId: string;
    currentStatus: string;
}

export default function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
    const [status, setStatus] = useState(currentStatus);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        setStatus(newStatus);

        startTransition(async () => {
            const result = await updateOrderStatus(orderId, newStatus);
            if (!result.success) {
                // Revert if failed (simple implementation)
                setStatus(currentStatus);
                alert("Failed to update status"); // Simple feedback
            } else {
                router.refresh();
            }
        });
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'PENDING': return 'text-yellow-600 dark:text-yellow-400';
            case 'PROCESSING': return 'text-blue-600 dark:text-blue-400';
            case 'READY': return 'text-purple-600 dark:text-purple-400';
            case 'COMPLETED': return 'text-green-600 dark:text-green-400';
            case 'CANCELLED': return 'text-red-600 dark:text-red-400';
            default: return 'text-zinc-600 dark:text-zinc-400';
        }
    };

    return (
        <div className="relative">
            <select
                value={status}
                onChange={handleStatusChange}
                disabled={isPending}
                className={`
                    appearance-none bg-transparent border-none pr-8 py-1 font-bold cursor-pointer focus:ring-0 focus:outline-none 
                    ${getStatusColor(status)}
                    disabled:opacity-50
                `}
            >
                <option value="PENDING">PENDING</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="READY">READY</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
            </select>

            {/* Status Indicator Icon / Spinner */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                )}
            </div>
        </div>
    );
}
