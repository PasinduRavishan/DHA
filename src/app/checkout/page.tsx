'use client';

import { useState, useEffect } from 'react';
import useCart from '@/lib/store/cart';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

export default function CheckoutPage() {
    const cart = useCart();
    const { data: session } = useSession();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(false);

    const [guestInfo, setGuestInfo] = useState({
        name: '',
        email: '',
        phone: '',
        address: '' // Optional for now as per minimal requirement, but good to have
    });

    useEffect(() => {
        setMounted(true);
        if (session?.user) {
            setGuestInfo(prev => ({
                ...prev,
                name: session.user?.name || '',
                email: session.user?.email || '',
            }));
        }
    }, [session]);

    if (!mounted) return null;

    if (cart.items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
                <Link href="/retail" className="text-primary-600 hover:underline">
                    Go shopping
                </Link>
            </div>
        );
    }

    const total = cart.items.reduce((total, item) => total + Number(item.price) * item.quantity, 0);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart.items,
                    guestInfo: session ? null : guestInfo
                })
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to place order");
            }

            const order = await res.json();
            cart.removeAll();
            toast.success("Order placed successfully!");
            // Redirect to a success page or orders page
            // For now, redirect to home with a success query param or similar
            router.push('/orders/success?id=' + order.id);

        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <h2 className="text-xl font-medium mb-4">Customer Details</h2>
                        {session ? (
                            <div className="bg-blue-50 p-4 rounded-md text-blue-800 mb-4">
                                Logged in as <strong>{session.user?.name}</strong> ({session.user?.email})
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 mb-4">You are checking out as a guest.</p>
                        )}

                        <form id="checkout-form" onSubmit={onSubmit} className="space-y-4">
                            {!session && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                        <input
                                            required
                                            type="text"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 border px-3 py-2"
                                            value={guestInfo.name}
                                            onChange={e => setGuestInfo({ ...guestInfo, name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 border px-3 py-2"
                                            value={guestInfo.email}
                                            onChange={e => setGuestInfo({ ...guestInfo, email: e.target.value })}
                                        />
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    required
                                    type="tel"
                                    placeholder="+94 ..."
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 border px-3 py-2"
                                    value={guestInfo.phone}
                                    onChange={e => setGuestInfo({ ...guestInfo, phone: e.target.value })}
                                />
                            </div>
                        </form>
                    </div>
                </div>

                <div className="mt-10 lg:mt-0 bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                    <ul className="divide-y divide-gray-200 mb-6">
                        {cart.items.map((item) => (
                            <li key={item.uniqueId} className="flex py-4">
                                <div className="flex-1">
                                    <div className="flex justify-between font-medium">
                                        <h3>{item.name}</h3>
                                        <p>{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                                    {item.selectedVariants && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {Object.values(item.selectedVariants).join(', ')}
                                        </p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="border-t border-gray-200 pt-4 flex justify-between items-center mb-6">
                        <span className="text-base font-medium text-gray-900">Total</span>
                        <span className="text-xl font-bold text-gray-900">{formatPrice(total)}</span>
                    </div>

                    <button
                        type="submit"
                        form="checkout-form"
                        disabled={loading}
                        className="w-full bg-primary-600 text-white py-3 rounded-md font-bold hover:bg-primary-700 disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Processing...' : 'Place Order'}
                    </button>
                </div>
            </div>
        </div>
    );
}
