import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect, notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowLeft,
    Package,
    User,
    Mail,
    Phone,
    MapPin,
    Clock,
    CheckCircle2,
    XCircle,
    Calendar
} from "lucide-react";
import OrderStatusSelect from "./OrderStatusSelect"; // We will create this

export const dynamic = 'force-dynamic';

export default async function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "ADMIN") {
        redirect("/auth/signin");
    }

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            user: true,
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

    // Helper for Total Items
    const totalItems = order.items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="bg-background dark:bg-black min-h-screen transition-colors duration-300 pb-20">
            {/* Background Element */}
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-zinc-900/50 to-transparent pointer-events-none hidden dark:block"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                {/* Back Button */}
                <Link href="/admin/orders" className="inline-flex items-center text-secondary-500 hover:text-foreground dark:text-zinc-400 dark:hover:text-white mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Orders
                </Link>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-foreground dark:text-white">Order #{order.orderNumber.slice(-6).toUpperCase()}</h1>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-secondary-500 dark:text-zinc-400">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(order.createdAt).toLocaleString()}
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                {totalItems} Items
                            </div>
                        </div>
                    </div>

                    {/* Status Actions */}
                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-secondary-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
                        <span className="text-sm font-medium text-secondary-600 dark:text-zinc-300">Status:</span>
                        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-secondary-200 dark:border-zinc-800 overflow-hidden">
                            <div className="p-6 border-b border-secondary-200 dark:border-zinc-800">
                                <h2 className="text-lg font-bold text-foreground dark:text-white">Order Items</h2>
                            </div>
                            <div className="divide-y divide-secondary-200 dark:divide-zinc-800">
                                {order.items.map((item) => (
                                    <div key={item.id} className="p-6 flex items-start gap-4 hover:bg-secondary-50 dark:hover:bg-zinc-800/20 transition-colors">
                                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-secondary-200 dark:border-zinc-800 bg-secondary-100 dark:bg-zinc-950 flex-shrink-0">
                                            {item.product.images?.[0] ? (
                                                <Image
                                                    src={item.product.images[0]}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-zinc-500">
                                                    <Package className="w-8 h-8" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-foreground dark:text-white truncate">{item.product.name}</h3>
                                            <p className="text-sm text-secondary-500 dark:text-zinc-400 mb-2">{item.product.category}</p>
                                            {/* Variant rendering if exists - placeholder logic */}
                                            {item.variants && (
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {Object.entries(item.variants as Record<string, any>).map(([key, value]) => (
                                                        <span key={key} className="text-xs px-2 py-1 rounded bg-secondary-100 dark:bg-zinc-800 text-secondary-600 dark:text-zinc-300">
                                                            {key}: {value}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg text-foreground dark:text-white">{formatPrice(item.price)}</p>
                                            <p className="text-sm text-secondary-500 dark:text-zinc-400">Qty: {item.quantity}</p>
                                            <p className="text-sm font-medium text-primary-600 dark:text-primary-500 mt-1">
                                                {formatPrice(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-6 bg-secondary-50 dark:bg-zinc-950/50 flex justify-between items-center">
                                <span className="font-medium text-secondary-600 dark:text-zinc-400">Subtotal</span>
                                <span className="font-bold text-xl text-foreground dark:text-white">{formatPrice(order.totalAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Customer & Summary */}
                    <div className="space-y-6">
                        {/* Customer Details */}
                        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-secondary-200 dark:border-zinc-800 overflow-hidden">
                            <div className="p-6 border-b border-secondary-200 dark:border-zinc-800">
                                <h2 className="text-lg font-bold text-foreground dark:text-white">Customer Details</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-secondary-100 dark:bg-zinc-800 flex items-center justify-center text-secondary-500 dark:text-zinc-400 flex-shrink-0">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground dark:text-white">
                                            {order.user?.name || order.guestName || "Guest User"}
                                        </p>
                                        <p className="text-xs text-secondary-500 dark:text-zinc-400">Customer</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-secondary-100 dark:bg-zinc-800 flex items-center justify-center text-secondary-500 dark:text-zinc-400 flex-shrink-0">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0 overflow-hidden text-clip">
                                        <p className="text-sm font-medium text-foreground dark:text-white break-words">
                                            {order.user?.email || order.guestEmail || "No email provided"}
                                        </p>
                                        <p className="text-xs text-secondary-500 dark:text-zinc-400">Email Address</p>
                                    </div>
                                </div>

                                {order.guestPhone && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-secondary-100 dark:bg-zinc-800 flex items-center justify-center text-secondary-500 dark:text-zinc-400 flex-shrink-0">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground dark:text-white">
                                                {order.guestPhone}
                                            </p>
                                            <p className="text-xs text-secondary-500 dark:text-zinc-400">Phone Number</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Notes Card */}
                        {order.notes && (
                            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-secondary-200 dark:border-zinc-800 overflow-hidden">
                                <div className="p-6 border-b border-secondary-200 dark:border-zinc-800">
                                    <h2 className="text-lg font-bold text-foreground dark:text-white">Order Notes</h2>
                                </div>
                                <div className="p-6">
                                    <p className="text-sm text-secondary-600 dark:text-zinc-300 italic">
                                        "{order.notes}"
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
