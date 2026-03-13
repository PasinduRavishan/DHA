import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import Link from 'next/link';
import { redirect, notFound } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/utils";
import { ArrowLeft, Package, Clock, CheckCircle, Ban, HelpCircle, ShoppingBag } from 'lucide-react';
import Image from 'next/image';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function OrderDetailsPage({ params }: PageProps) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/signin");
    }

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

    if (!order) {
        notFound();
    }

    // Security check: Customer can only see their own orders
    // Admin can see all (if we reuse this page, but simpler to keep admin separate or conditional here)
    if (session.user.role !== "ADMIN" && order.userId !== session.user.id) {
        redirect("/orders"); // Or 403
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock className="w-5 h-5 text-amber-500" />;
            case 'PROCESSING': return <Package className="w-5 h-5 text-blue-500" />;
            case 'READY': return <CheckCircle className="w-5 h-5 text-purple-500" />;
            case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'CANCELLED': return <Ban className="w-5 h-5 text-red-500" />;
            default: return <Clock className="w-5 h-5" />;
        }
    };

    return (
        <div className="bg-background dark:bg-black min-h-screen transition-colors duration-300 pb-20">
            {/* Ambient Effect */}
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-secondary-100/50 dark:from-zinc-900/30 to-transparent pointer-events-none"></div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">

                <Link href="/orders" className="inline-flex items-center gap-2 text-secondary-500 hover:text-foreground dark:text-zinc-400 dark:hover:text-white transition-colors mb-6 text-sm font-medium">
                    <ArrowLeft size={16} /> Back to Orders
                </Link>

                <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-secondary-200 dark:border-zinc-800 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 md:p-8 bg-secondary-50/50 dark:bg-zinc-900/50 border-b border-secondary-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-foreground dark:text-white">Order #{order.orderNumber.slice(-8).toUpperCase()}</h1>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-white dark:bg-black border-secondary-200 dark:border-zinc-700">
                                    {getStatusIcon(order.status)}
                                    {order.status}
                                </span>
                            </div>
                            <p className="text-secondary-500 dark:text-zinc-400 text-sm">
                                Placed on {formatDate(order.createdAt)}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="inline-flex items-center gap-2 px-4 py-2 border border-secondary-300 dark:border-zinc-700 rounded-lg text-sm font-medium hover:bg-white dark:hover:bg-zinc-900 transition-colors">
                                <HelpCircle size={16} /> Support
                            </button>
                            {/* Potential "Cancel" or "Reorder" buttons */}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-12">

                        {/* Order Items */}
                        <div className="md:col-span-2 space-y-8">
                            <h3 className="text-lg font-bold text-foreground dark:text-white mb-4 flex items-center gap-2">
                                <ShoppingBag size={20} /> Order Items
                            </h3>
                            <div className="space-y-6">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="relative w-20 h-20 rounded-lg border border-secondary-200 dark:border-zinc-800 overflow-hidden bg-secondary-100 dark:bg-black flex-shrink-0">
                                            <Image
                                                src={item.product.images[0] || '/images/placeholder.png'}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold text-foreground dark:text-white">{item.product.name}</h4>
                                                    <p className="text-sm text-secondary-500 dark:text-zinc-500">{item.product.category}</p>
                                                    {/* Variants */}
                                                    {item.variants && (
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {Object.entries(item.variants as Record<string, string>).map(([key, value]) => (
                                                                <span key={key} className="text-xs px-2 py-1 bg-secondary-100 dark:bg-zinc-900 rounded text-secondary-600 dark:text-zinc-400">
                                                                    {key}: {value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="font-medium text-foreground dark:text-white">
                                                    {formatPrice(item.price)}
                                                </p>
                                            </div>
                                            <div className="mt-2 text-sm text-secondary-500 dark:text-zinc-500">
                                                Qty: {item.quantity}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary & Customer Info */}
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-lg font-bold text-foreground dark:text-white mb-4">Customer Details</h3>
                                <div className="p-4 bg-secondary-50 dark:bg-zinc-900/50 rounded-xl border border-secondary-100 dark:border-zinc-800 text-sm space-y-2 text-secondary-600 dark:text-zinc-400">
                                    <p><span className="font-semibold text-foreground dark:text-zinc-300">Name:</span> {order.guestName || session.user.name}</p>
                                    <p><span className="font-semibold text-foreground dark:text-zinc-300">Email:</span> {order.guestEmail || session.user.email}</p>
                                    <p><span className="font-semibold text-foreground dark:text-zinc-300">Phone:</span> {order.guestPhone || session.user.phone || 'N/A'}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-foreground dark:text-white mb-4">Order Summary</h3>
                                <div className="space-y-3 pb-4 border-b border-secondary-200 dark:border-zinc-800 text-sm text-secondary-600 dark:text-zinc-400">
                                    <div className="flex justify-between">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(order.totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Shipping</span>
                                        <span className="text-green-600 dark:text-green-400">Free</span>
                                    </div>
                                </div>
                                <div className="flex justify-between pt-4 font-bold text-lg text-foreground dark:text-white">
                                    <span>Total</span>
                                    <span>{formatPrice(order.totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
