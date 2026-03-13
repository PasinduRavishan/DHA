'use client';

import { useState } from 'react';
import { ShoppingCart, MessageSquare, AlertCircle } from 'lucide-react';
import useCart from '@/lib/store/cart';
import { formatPrice } from '@/lib/utils';
import useChatStore from '@/lib/store/chat';
import { ProductType } from '@prisma/client';

interface ProductInfoProps {
    data: any;
}

export default function ProductInfo({ data }: ProductInfoProps) {
    const cart = useCart();
    const chatStore = useChatStore();
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

    const variants = data.variants as Record<string, string[]> | null;
    const hasVariants = variants && Object.keys(variants).length > 0;

    // Check if all variants are selected
    const isComplete = !hasVariants || Object.keys(variants!).every(key => selectedVariants[key]);

    const onAddToCart = () => {
        if (!isComplete) {
            return; // Button should be disabled anyway
        }

        // Generate a unique ID based on selection
        // e.g. "prod_123-Size:M-Color:Red"
        const variantKey = hasVariants
            ? Object.entries(selectedVariants).sort().map(([k, v]) => `${k}:${v}`).join('-')
            : 'standard';

        cart.addItem({
            id: data.id,
            uniqueId: `${data.id}-${variantKey}`,
            name: data.name,
            price: data.price,
            image: data.images?.[0] || '',
            quantity: 1,
            maxStock: data.stock,
            selectedVariants: hasVariants ? selectedVariants : undefined
        });
    };

    const onChatOrder = () => {
        chatStore.shareProduct({
            id: data.id,
            name: data.name,
            price: Number(data.price),
            image: data.images?.[0] || '/images/placeholder.png',
            category: data.category
        }, `Hi, I'm interested in ordering this product.`);
    };

    return (
        <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">{data.name}</h1>
                <div className="mt-3 flex items-end justify-between">
                    <p className="text-2xl font-bold tracking-tight text-gray-900">
                        {formatPrice(data.price)}
                    </p>
                    <div className="flex flex-col items-end">
                        <span className={`text-sm ${data.stock > 0 ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}`}>
                            {data.stock > 0 ? `${data.stock} in Stock` : 'Out of Stock'}
                        </span>
                        <span className="text-xs text-gray-500">{data.category}</span>
                    </div>
                </div>
            </div>

            <div className="border-t border-b border-gray-200 py-6">
                <p className="text-base text-gray-700 whitespace-pre-wrap">{data.description}</p>
            </div>

            {hasVariants && (
                <div className="py-6 space-y-5">
                    {Object.entries(variants!).map(([key, values]) => (
                        <div key={key}>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">{key}</h3>
                            <div className="flex flex-wrap gap-2">
                                {values.map((value) => {
                                    const isSelected = selectedVariants[key] === value;
                                    return (
                                        <button
                                            key={value}
                                            onClick={() => setSelectedVariants(prev => ({ ...prev, [key]: value }))}
                                            className={`
                                        px-4 py-2 rounded-full text-sm font-medium border transition-all
                                        ${isSelected
                                                    ? 'bg-black text-white border-black ring-2 ring-black ring-offset-2'
                                                    : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'
                                                }
                                    `}
                                        >
                                            {value}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!isComplete && hasVariants && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-md mb-4 text-sm mt-4">
                    <AlertCircle size={16} />
                    Please select {Object.keys(variants!).find(k => !selectedVariants[k])} to continue
                </div>
            )}

            <div className="mt-8 flex gap-4">
                {(data.type === 'RETAIL' || data.type === 'BOTH') && (
                    <button
                        onClick={onAddToCart}
                        disabled={!isComplete || data.stock === 0}
                        className="flex-1 bg-primary-600 text-white px-6 py-4 rounded-full font-bold text-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-colors shadow-lg hover:shadow-xl"
                    >
                        <ShoppingCart />
                        Add to Cart
                    </button>
                )}

                {(data.type === 'WHOLESALE' || data.type === 'BOTH') && (
                    <button
                        onClick={onChatOrder}
                        className="flex-1 bg-green-600 text-white px-6 py-4 rounded-full font-bold text-lg hover:bg-green-700 flex items-center justify-center gap-3 transition-colors shadow-lg hover:shadow-xl"
                    >
                        <MessageSquare />
                        Chat to Order
                    </button>
                )}
            </div>
        </div>
    );
}
