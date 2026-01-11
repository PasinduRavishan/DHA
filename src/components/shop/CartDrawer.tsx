'use client';

import useCart from '@/lib/store/cart';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CartDrawer() {
    const cart = useCart();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    if (!cart.isOpen) return null;

    const total = cart.items.reduce((total, item) => {
        return total + Number(item.price) * item.quantity;
    }, 0);

    const onCheckout = () => {
        cart.onClose();
        router.push('/checkout');
    };

    return (
        <div className="relative z-50">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 transition-opacity"
                onClick={cart.onClose}
            />

            {/* Slide-over panel */}
            <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300 transform translate-x-0">
                <div className="flex items-center justify-between px-4 py-6 sm:px-6 border-b">
                    <h2 className="text-lg font-medium text-gray-900">Shopping Cart ({cart.items.length})</h2>
                    <button onClick={cart.onClose} className="p-2 -m-2 text-gray-400 hover:text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                    {cart.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <p>Your cart is empty.</p>
                            <button onClick={cart.onClose} className="mt-4 text-primary-600 font-medium hover:underline">
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {cart.items.map((item, index) => (
                                <li key={item.uniqueId || index} className="flex py-6">
                                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                        <Image
                                            src={item.image || '/images/placeholder.png'}
                                            alt={item.name}
                                            fill
                                            className="object-cover object-center"
                                        />
                                    </div>
                                    <div className="ml-4 flex flex-1 flex-col">
                                        <div>
                                            <div className="flex justify-between text-base font-medium text-gray-900">
                                                <h3 className="line-clamp-1">{item.name}</h3>
                                                <p className="ml-4">{formatPrice(Number(item.price) * item.quantity)}</p>
                                            </div>
                                            {/* Variants Display */}
                                            {item.selectedVariants && (
                                                <div className="mt-1 text-sm text-gray-500">
                                                    {Object.entries(item.selectedVariants).map(([key, val]) => (
                                                        <span key={key} className="mr-2 px-1.5 py-0.5 bg-gray-100 rounded text-xs">{val}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-1 items-end justify-between text-sm">
                                            <div className="flex items-center gap-2 border rounded-md">
                                                <button
                                                    onClick={() => cart.updateQuantity(item.uniqueId, item.quantity - 1)}
                                                    className="p-1 hover:bg-gray-100"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-4 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => cart.updateQuantity(item.uniqueId, item.quantity + 1)}
                                                    className="p-1 hover:bg-gray-100"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => cart.removeItem(item.uniqueId)}
                                                className="font-medium text-red-600 hover:text-red-500 flex items-center gap-1"
                                            >
                                                <Trash2 size={16} />
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {cart.items.length > 0 && (
                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                            <p>Total</p>
                            <p>{formatPrice(total)}</p>
                        </div>
                        <button
                            onClick={onCheckout}
                            className="flex w-full items-center justify-center rounded-md border border-transparent bg-primary-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-700"
                        >
                            Checkout
                        </button>
                        <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                            <p>
                                or{' '}
                                <button
                                    type="button"
                                    className="font-medium text-primary-600 hover:text-primary-500"
                                    onClick={cart.onClose}
                                >
                                    Continue Shopping
                                    <span aria-hidden="true"> &rarr;</span>
                                </button>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
