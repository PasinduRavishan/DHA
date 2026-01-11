'use client';

import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';
// import useCart from '@/lib/store/cart'; 

interface ProductCardProps {
    data: any; // Type this properly later
}

const ProductCard: React.FC<ProductCardProps> = ({ data }) => {
    // const cart = useCart();

    const onAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // cart.addItem(data);
    };

    return (
        <div className="bg-white dark:bg-black group cursor-pointer rounded-xl border border-secondary-200 dark:border-secondary-800 p-3 space-y-4 hover:shadow-lg hover-glow transition-all duration-300 relative overflow-hidden">
            {/* Subtle Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            {/* Images */}
            <div className="aspect-square rounded-xl bg-secondary-100 dark:bg-secondary-900 relative overflow-hidden border border-transparent dark:border-secondary-800">
                <Image
                    src={data.images?.[0] || '/images/placeholder.png'}
                    alt={data.name}
                    fill
                    className="aspect-square object-cover rounded-md group-hover:scale-110 transition-transform duration-500"
                />
                <div className="opacity-0 group-hover:opacity-100 transition absolute w-full px-6 bottom-5 z-10">
                    <div className="flex gap-x-6 justify-center">
                        <button
                            onClick={onAddToCart}
                            className="bg-white dark:bg-black p-3 rounded-full flex items-center justify-center text-secondary-900 dark:text-white shadow-md hover:scale-110 transition hover:bg-primary-600 dark:hover:bg-primary-600 hover:text-white dark:hover:text-white border border-secondary-100 dark:border-secondary-700"
                        >
                            <ShoppingCart size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="relative z-10">
                <p className="font-semibold text-lg truncate text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{data.name}</p>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">{data.category}</p>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between relative z-10">
                <div className="font-bold text-lg text-primary-600 dark:text-primary-500 dark:text-glow">
                    {formatPrice(Number(data.price))}
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
