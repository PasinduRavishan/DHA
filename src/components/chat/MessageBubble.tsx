import Image from 'next/image';
import { Package, ShoppingBag, ExternalLink } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

interface SharedProductData {
    type: 'product';
    id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
}

interface SharedOrderData {
    type: 'order';
    id: string;
    orderNumber: string;
    totalAmount: number;
    itemCount: number;
    status: string;
    items?: Array<{
        name: string;
        quantity: number;
        price: number;
        image: string;
        variants?: Record<string, string>;
    }>;
}

interface MessageBubbleProps {
    message: string;
    isAdmin: boolean;
    metadata?: SharedProductData | SharedOrderData | null;
    createdAt: string;
    viewerIsAdmin?: boolean; // Who is viewing the chat
    attachments?: string[];
}

export default function MessageBubble({ message, isAdmin, metadata, createdAt, viewerIsAdmin = false, attachments = [] }: MessageBubbleProps) {
    // Determine if this message is from "me" (the viewer)
    // If viewer is admin: their messages (isAdmin=true) should be on right
    // If viewer is customer: their messages (isAdmin=false) should be on right
    const isMyMessage = viewerIsAdmin ? isAdmin : !isAdmin;

    const bubbleClass = isMyMessage
        ? 'bg-primary-600 text-white ml-auto'
        : 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white';

    return (
        <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[75%] ${isMyMessage ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                {/* Shared Product Card */}
                {metadata && metadata.type === 'product' && (
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg p-3 shadow-sm max-w-xs">
                        <div className="flex gap-3 items-start">
                            <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-zinc-800">
                                <Image
                                    src={metadata.image}
                                    alt={metadata.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                    {metadata.name}
                                </h4>
                                {metadata.category && (
                                    <p className="text-xs text-gray-500 dark:text-zinc-400">{metadata.category}</p>
                                )}
                                <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mt-1">
                                    {formatPrice(metadata.price)}
                                </p>
                            </div>
                        </div>
                        <Link
                            href={`/products/${metadata.id}`}
                            className="mt-2 flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
                            target="_blank"
                        >
                            <ExternalLink size={12} /> View Product
                        </Link>
                    </div>
                )}

                {/* Shared Order Card */}
                {metadata && metadata.type === 'order' && (
                    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-sm max-w-md">
                        {/* Order Header */}
                        <div className="p-4 border-b border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                                    <Package className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                                        Order #{metadata.orderNumber.slice(-8).toUpperCase()}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400 mt-1">
                                        <ShoppingBag size={12} />
                                        <span>{metadata.itemCount} {metadata.itemCount === 1 ? 'item' : 'items'}</span>
                                        <span>•</span>
                                        <span className="font-semibold text-primary-600 dark:text-primary-400">
                                            {formatPrice(metadata.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${metadata.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                    metadata.status === 'PROCESSING' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                        metadata.status === 'CANCELLED' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                                            'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                    }`}>
                                    {metadata.status}
                                </span>
                            </div>
                        </div>

                        {/* Order Items */}
                        {metadata.items && metadata.items.length > 0 && (
                            <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                                {metadata.items.map((item: any, index: number) => (
                                    <div key={index} className="flex gap-3 items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                        <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                                            <Image
                                                src={item.image || '/images/placeholder.png'}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h5 className="font-medium text-xs text-gray-900 dark:text-white truncate">
                                                {item.name}
                                            </h5>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
                                                <span>Qty: {item.quantity}</span>
                                                {item.variants && Object.keys(item.variants).length > 0 && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="truncate">
                                                            {Object.entries(item.variants).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="text-xs font-semibold text-gray-900 dark:text-white">
                                                {formatPrice(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Order Footer */}
                        <div className="p-3 border-t border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50">
                            <Link
                                href={`/orders/${metadata.id}`}
                                className="flex items-center justify-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                                target="_blank"
                            >
                                <ExternalLink size={14} /> View Full Order Details
                            </Link>
                        </div>
                    </div>
                )}

                {/* Attachments */}
                {attachments && attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-1">
                        {attachments.map((url: string, index: number) => (
                            <div key={index} className="relative w-48 h-48 rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700 bg-black/5 dark:bg-white/5">
                                <Image
                                    src={url}
                                    alt="Attachment"
                                    fill
                                    className="object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                                    onClick={() => window.open(url, '_blank')}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Text Message */}
                {message && (
                    <div className={`rounded-2xl px-4 py-2.5 ${bubbleClass}`}>
                        <p className="text-sm whitespace-pre-wrap break-words">{message}</p>
                    </div>
                )}

                {/* Timestamp */}
                <span className="text-xs text-gray-400 dark:text-zinc-500 px-2">
                    {new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
}
