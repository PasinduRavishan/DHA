import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { Package, ShoppingCart, MessageSquare, TrendingUp, Waves, Receipt, FileText } from 'lucide-react';

import Image from 'next/image';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "ADMIN") {
        redirect("/auth/signin");
    }

    // Fetch real stats
    const [
        productsCount,
        ordersCount,
        chatsCount,
        retailProducts,
        wholesaleProducts,
        quotationsCount
    ] = await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.chat.count({ where: { status: 'ACTIVE' } }),
        prisma.product.count({ where: { type: 'RETAIL' } }),
        prisma.product.count({ where: { type: 'WHOLESALE' } }),
        prisma.quotation.count()
    ]);

    return (
        <div className="bg-background dark:bg-black min-h-screen transition-colors duration-300 relative">
            {/* Background Image */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <Image
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop"
                    alt="Admin Background"
                    fill
                    className="object-cover opacity-[0.15] dark:opacity-[0.15] grayscale"
                    priority
                    unoptimized
                />
            </div>
            {/* Ambient Top Shadow/Gradient */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-zinc-900/50 via-zinc-900/10 to-transparent pointer-events-none hidden dark:block z-0"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground dark:text-white">Dashboard</h1>
                        <p className="text-secondary-500 dark:text-zinc-400">Overview of your store performance</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-secondary-500 dark:text-zinc-400">Welcome,</p>
                        <p className="font-semibold text-foreground dark:text-white">{session.user.name}</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="group bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-secondary-200 dark:border-zinc-800 flex items-center justify-between hover:border-primary-500/50 hover:shadow-lg transition-all relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <p className="text-sm font-medium text-secondary-500 dark:text-zinc-400 mb-1">Total Orders</p>
                            <p className="text-3xl font-bold text-foreground dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-500 transition-colors">{ordersCount}</p>
                        </div>
                        <div className="relative z-10 p-3 bg-secondary-100 dark:bg-black rounded-lg text-primary-600 dark:text-primary-500 group-hover:scale-110 transition-transform shadow-inner dark:shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                            <ShoppingCart className="h-6 w-6" />
                        </div>
                    </div>

                    <Link href="/admin/chats" className="group bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-secondary-200 dark:border-zinc-800 flex items-center justify-between hover:border-primary-500/50 hover:shadow-lg transition-all relative overflow-hidden cursor-pointer">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <p className="text-sm font-medium text-secondary-500 dark:text-zinc-400 mb-1">Active Chats</p>
                            <p className="text-3xl font-bold text-foreground dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-500 transition-colors">{chatsCount}</p>
                        </div>
                        <div className="relative z-10 p-3 bg-secondary-100 dark:bg-black rounded-lg text-primary-600 dark:text-primary-500 group-hover:scale-110 transition-transform shadow-inner dark:shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                    </Link>

                    <div className="group bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-secondary-200 dark:border-zinc-800 flex items-center justify-between hover:border-primary-500/50 hover:shadow-lg transition-all relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <p className="text-sm font-medium text-secondary-500 dark:text-zinc-400 mb-1">Total Products</p>
                            <p className="text-3xl font-bold text-foreground dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-500 transition-colors">{productsCount}</p>
                        </div>
                        <div className="relative z-10 p-3 bg-secondary-100 dark:bg-black rounded-lg text-primary-600 dark:text-primary-500 group-hover:scale-110 transition-transform shadow-inner dark:shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                            <Package className="h-6 w-6" />
                        </div>
                    </div>

                    <Link href="/admin/quotations" className="group bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-sm border border-secondary-200 dark:border-zinc-800 flex items-center justify-between hover:border-primary-500/50 hover:shadow-lg transition-all relative overflow-hidden cursor-pointer">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <p className="text-sm font-medium text-secondary-500 dark:text-zinc-400 mb-1">Quotations</p>
                            <p className="text-3xl font-bold text-foreground dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-500 transition-colors">{quotationsCount}</p>
                        </div>
                        <div className="relative z-10 p-3 bg-secondary-100 dark:bg-black rounded-lg text-primary-600 dark:text-primary-500 group-hover:scale-110 transition-transform shadow-inner dark:shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                            <FileText className="h-6 w-6" />
                        </div>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-zinc-800 p-8 relative overflow-hidden h-full">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-xl font-bold text-foreground dark:text-white">Quick Actions</h2>
                                <p className="text-sm text-secondary-500 dark:text-zinc-400">Common management tasks</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link href="/admin/chats" className="flex items-center p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-all group scale-100 active:scale-95">
                                <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg shadow-sm text-amber-600 dark:text-amber-500 mr-4 group-hover:scale-110 transition-transform">
                                    <MessageSquare className="h-6 w-6" />
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-amber-900 dark:text-amber-400">Manage Chats</span>
                                    <span className="text-xs text-amber-700/70 dark:text-amber-400/60">Response to customers</span>
                                </div>
                            </Link>

                            <Link href="/admin/products/add" className="flex items-center p-4 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/20 transition-all group scale-100 active:scale-95">
                                <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg shadow-sm text-primary-600 dark:text-primary-500 mr-4 group-hover:scale-110 transition-transform">
                                    <Package className="h-6 w-6" />
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-primary-900 dark:text-primary-400">Add Product</span>
                                    <span className="text-xs text-primary-700/70 dark:text-primary-400/60">Create new listings</span>
                                </div>
                            </Link>

                            <Link href="/admin/products" className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/20 transition-all group scale-100 active:scale-95">
                                <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg shadow-sm text-purple-600 dark:text-purple-400 mr-4 group-hover:scale-110 transition-transform">
                                    <Package className="h-6 w-6" />
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-purple-900 dark:text-purple-400">Inventory</span>
                                    <span className="text-xs text-purple-700/70 dark:text-purple-400/60">Manage all products</span>
                                </div>
                            </Link>

                            <Link href="/admin/orders" className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all group scale-100 active:scale-95">
                                <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg shadow-sm text-blue-600 dark:text-blue-400 mr-4 group-hover:scale-110 transition-transform">
                                    <ShoppingCart className="h-6 w-6" />
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-blue-900 dark:text-blue-400">View Orders</span>
                                    <span className="text-xs text-blue-700/70 dark:text-blue-400/60">Track sales performance</span>
                                </div>
                            </Link>

                            <Link href="/admin/pos" className="flex items-center p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-all group scale-100 active:scale-95">
                                <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg shadow-sm text-emerald-600 dark:text-emerald-400 mr-4 group-hover:scale-110 transition-transform">
                                    <Receipt className="h-6 w-6" />
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-emerald-900 dark:text-emerald-400">Create Quotation</span>
                                    <span className="text-xs text-emerald-700/70 dark:text-emerald-400/60">POS - Create bills & quotes</span>
                                </div>
                            </Link>

                            <Link href="/admin/quotations" className="flex items-center p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-all group scale-100 active:scale-95">
                                <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg shadow-sm text-amber-600 dark:text-amber-400 mr-4 group-hover:scale-110 transition-transform">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-amber-900 dark:text-amber-400">View Quotations</span>
                                    <span className="text-xs text-amber-700/70 dark:text-amber-400/60">Manage all quotes</span>
                                </div>
                            </Link>

                            <Link href="/admin/bathroom-fittings/add" className="flex items-center p-4 bg-teal-50 dark:bg-teal-900/10 rounded-xl border border-teal-100 dark:border-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/20 transition-all group scale-100 active:scale-95">
                                <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg shadow-sm text-teal-600 dark:text-teal-400 mr-4 group-hover:scale-110 transition-transform">
                                    <Waves className="h-6 w-6" />
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-teal-900 dark:text-teal-400">Add Bathroom Item</span>
                                    <span className="text-xs text-teal-700/70 dark:text-teal-400/60">New fitting listing</span>
                                </div>
                            </Link>

                            <Link href="/admin/carousel" className="flex items-center p-4 bg-pink-50 dark:bg-pink-900/10 rounded-xl border border-pink-100 dark:border-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/20 transition-all group scale-100 active:scale-95">
                                <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg shadow-sm text-pink-600 dark:text-pink-400 mr-4 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="h-6 w-6" />
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-pink-900 dark:text-pink-400">Manage Carousel</span>
                                    <span className="text-xs text-pink-700/70 dark:text-pink-400/60">Edit hero slides</span>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Product Distribution */}
                    <div className="group bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-secondary-200 dark:border-zinc-800 p-6 relative overflow-hidden hover:border-primary-500/30 transition-all">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                        <h2 className="text-lg font-bold text-foreground dark:text-white mb-4 relative z-10">Product Overview</h2>
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center p-3 bg-secondary-50 dark:bg-black rounded-lg border border-transparent hover:border-primary-500/20 transition-colors">
                                <span className="text-sm font-medium text-secondary-600 dark:text-zinc-400">Retail Products</span>
                                <span className="text-lg font-bold text-foreground dark:text-white">{retailProducts}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-secondary-50 dark:bg-black rounded-lg border border-transparent hover:border-primary-500/20 transition-colors">
                                <span className="text-sm font-medium text-secondary-600 dark:text-zinc-400">Wholesale Products</span>
                                <span className="text-lg font-bold text-foreground dark:text-white">{wholesaleProducts}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-secondary-50 dark:bg-black rounded-lg border border-transparent hover:border-primary-500/20 transition-colors">
                                <span className="text-sm font-medium text-secondary-600 dark:text-zinc-400">Dual (Both)</span>
                                <span className="text-lg font-bold text-foreground dark:text-white">
                                    {productsCount - (retailProducts + wholesaleProducts)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
