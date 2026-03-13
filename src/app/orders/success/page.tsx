import Link from "next/link";
import { CheckCircle, Package, Clock, ShoppingBag, ArrowRight, Printer, Home } from "lucide-react";
import prisma from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function OrderSuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ id: string }>;
}) {
    const { id } = await searchParams;

    if (!id) return notFound();

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            items: {
                include: {
                    product: true
                }
            }
        }
    });

    if (!order) return notFound();

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen py-12 px-4 transition-colors duration-300">
            <div className="max-w-3xl mx-auto">

                {/* Success Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden mb-8 animate-in slide-in-from-bottom-5 duration-700">
                    <div className="bg-green-600 p-8 text-center text-white">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
                        <p className="text-green-100">
                            Thank you for your purchase. Your order #{order.orderNumber.slice(-8).toUpperCase()} has been placed.
                        </p>
                    </div>

                    <div className="p-8">
                        {/* Order Meta */}
                        <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-500 dark:text-zinc-400 border-b border-gray-100 dark:border-zinc-800 pb-6 mb-6 gap-4">
                            <div>
                                <p className="mb-1">Order Number</p>
                                <p className="font-semibold text-gray-900 dark:text-white">#{order.orderNumber}</p>
                            </div>
                            <div>
                                <p className="mb-1">Date</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{formatDate(order.createdAt)}</p>
                            </div>
                            <div>
                                <p className="mb-1">Total Amount</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{formatPrice(order.totalAmount)}</p>
                            </div>
                            <div>
                                <p className="mb-1">Payment Method</p>
                                <p className="font-semibold text-gray-900 dark:text-white">Cash On Delivery</p>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="space-y-6 mb-8">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <ShoppingBag size={18} /> Order Details
                            </h3>
                            {order.items.map((item) => (
                                <div key={item.id} className="flex gap-4 items-center">
                                    <div className="relative w-16 h-16 rounded-md bg-gray-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0 border border-gray-200 dark:border-zinc-700">
                                        <Image
                                            src={item.product.images[0] || '/images/placeholder.png'}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 dark:text-white truncate">{item.product.name}</h4>
                                        <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-zinc-500 mt-1">
                                            <span>Qty: {item.quantity}</span>
                                            {item.variants && Object.entries(item.variants as Record<string, string>).map(([k, v]) => (
                                                <span key={k} className="px-1.5 py-0.5 bg-gray-100 dark:bg-zinc-800 rounded">{k}: {v}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right font-medium text-gray-900 dark:text-white">
                                        {formatPrice(item.price * item.quantity)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="bg-gray-50 dark:bg-black/50 rounded-lg p-6 space-y-3">
                            <div className="flex justify-between text-sm text-gray-600 dark:text-zinc-400">
                                <span>Subtotal</span>
                                <span>{formatPrice(order.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 dark:text-zinc-400">
                                <span>Shipping</span>
                                <span className="text-green-600 dark:text-green-400 font-medium">Free</span>
                            </div>
                            <div className="pt-3 border-t border-gray-200 dark:border-zinc-800 flex justify-between text-lg font-bold text-gray-900 dark:text-white">
                                <span>Total</span>
                                <span>{formatPrice(order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/"
                        className="px-8 py-3 bg-white dark:bg-zinc-900 text-gray-900 dark:text-white rounded-full font-medium shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-800 flex items-center justify-center gap-2 transition-all border border-gray-200 dark:border-zinc-800"
                    >
                        <Home size={18} /> Return Home
                    </Link>
                    <Link
                        href="/orders"
                        className="px-8 py-3 bg-primary-600 text-white rounded-full font-medium shadow-lg hover:bg-primary-700 hover:shadow-primary-600/30 flex items-center justify-center gap-2 transition-all"
                    >
                        View All Orders <ArrowRight size={18} />
                    </Link>
                </div>

            </div>
        </div>
    );
}
