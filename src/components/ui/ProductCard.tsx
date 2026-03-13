'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import useChatStore from '@/lib/store/chat';
import useCart from '@/lib/store/cart';

interface ProductCardProps {
    data: any; // Type this properly later
}

const ProductCard: React.FC<ProductCardProps> = ({ data }) => {
    const cart = useCart();
    const chatStore = useChatStore();

    const onAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        cart.addItem({
            id: data.id,
            uniqueId: `${data.id}-standard`, // Default for quick add
            name: data.name,
            price: Number(data.price),
            image: data.images?.[0] || '/images/placeholder.png',
            quantity: 1,
            maxStock: data.stock || 100, // Fallback if stock is missing
        });
    };

    const onAskInChat = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        chatStore.shareProduct({
            id: data.id,
            name: data.name,
            price: Number(data.price),
            image: data.images?.[0] || '/images/placeholder.png',
            category: data.category
        });
    };

    return (
        <Link
            href={`/products/${data.id}`}
            className="block bg-white dark:bg-zinc-950 group cursor-pointer rounded-xl border border-secondary-200 dark:border-white/10 p-3 space-y-4 hover:shadow-lg transition-all duration-300 relative overflow-hidden ring-1 ring-transparent dark:hover:ring-primary-500/50 hover:-translate-y-1"
        >
            {/* Dark Mode: Shining Line Effect at Bottom */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

            {/* Subtle Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            {/* Images */}
            <div className="aspect-square rounded-xl bg-secondary-100 dark:bg-zinc-950 relative overflow-hidden border border-transparent dark:border-zinc-800 group-hover:border-primary-500/20 transition-colors">
                <Image
                    src={data.images?.[0] || '/images/placeholder.png'}
                    alt={data.name}
                    fill
                    className="aspect-square object-cover rounded-md group-hover:scale-110 transition-transform duration-500"
                />
                <div className="opacity-0 group-hover:opacity-100 transition absolute w-full px-6 bottom-5 z-10">
                    <div className="flex gap-x-3 justify-center">
                        <div
                            role="button"
                            onClick={onAskInChat}
                            className="bg-white dark:bg-zinc-950 p-3 rounded-full flex items-center justify-center text-secondary-900 dark:text-white shadow-md hover:scale-110 transition hover:bg-green-600 dark:hover:bg-green-600 hover:text-white dark:hover:text-white border border-secondary-100 dark:border-zinc-700 cursor-pointer"
                            title="Ask in Chat"
                        >
                            <MessageCircle size={20} />
                        </div>
                        <div
                            role="button"
                            onClick={onAddToCart}
                            className="bg-white dark:bg-zinc-950 p-3 rounded-full flex items-center justify-center text-secondary-900 dark:text-white shadow-md hover:scale-110 transition hover:bg-primary-600 dark:hover:bg-primary-600 hover:text-white dark:hover:text-white border border-secondary-100 dark:border-zinc-700 cursor-pointer"
                        >
                            <ShoppingCart size={20} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="relative z-10">
                <p className="font-semibold text-lg truncate text-foreground dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-500 transition-colors">{data.name}</p>
                <p className="text-sm text-secondary-500 dark:text-zinc-300">{data.category}</p>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between relative z-10">
                <div className="font-bold text-lg text-primary-600 dark:text-primary-400 group-hover:text-glow transition-all">
                    {formatPrice(Number(data.price))}
                </div>
            </div>
        </Link>
    );
}

export default ProductCard;
