import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { Package, ShoppingCart, MessageSquare, TrendingUp } from 'lucide-react';

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
        wholesaleProducts
    ] = await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.chat.count({ where: { status: 'ACTIVE' } }),
        prisma.product.count({ where: { type: 'RETAIL' } }),
        prisma.product.count({ where: { type: 'WHOLESALE' } })
    ]);

    return (
        <div className="bg-background min-h-screen transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                        <p className="text-secondary-500 dark:text-secondary-400">Overview of your store performance</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-secondary-500 dark:text-secondary-400">Welcome,</p>
                        <p className="font-semibold text-foreground">{session.user.name}</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white dark:bg-secondary-900 p-6 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-800 flex items-center justify-between hover:border-primary-500/50 transition-colors">
                        <div>
                            <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400 mb-1">Total Orders</p>
                            <p className="text-3xl font-bold text-foreground">{ordersCount}</p>
                        </div>
                        <div className="p-3 bg-secondary-100 dark:bg-secondary-800 rounded-lg text-primary-600 dark:text-primary-400">
                            <ShoppingCart className="h-6 w-6" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-secondary-900 p-6 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-800 flex items-center justify-between hover:border-primary-500/50 transition-colors">
                        <div>
                            <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400 mb-1">Active Chats</p>
                            <p className="text-3xl font-bold text-foreground">{chatsCount}</p>
                        </div>
                        <div className="p-3 bg-secondary-100 dark:bg-secondary-800 rounded-lg text-primary-600 dark:text-primary-400">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-secondary-900 p-6 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-800 flex items-center justify-between hover:border-primary-500/50 transition-colors">
                        <div>
                            <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400 mb-1">Total Products</p>
                            <p className="text-3xl font-bold text-foreground">{productsCount}</p>
                        </div>
                        <div className="p-3 bg-secondary-100 dark:bg-secondary-800 rounded-lg text-primary-600 dark:text-primary-400">
                            <Package className="h-6 w-6" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-secondary-900 p-6 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-800 flex items-center justify-between hover:border-primary-500/50 transition-colors">
                        <div>
                            <p className="text-sm font-medium text-secondary-500 dark:text-secondary-400 mb-1">Inventory Value</p>
                            <p className="text-3xl font-bold text-foreground">₹--</p>
                        </div>
                        <div className="p-3 bg-secondary-100 dark:bg-secondary-800 rounded-lg text-primary-600 dark:text-primary-400">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-800 p-6">
                        <h2 className="text-lg font-bold text-foreground mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-3 gap-4">
                            <Link href="/admin/products/add" className="flex flex-col items-center justify-center p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors group border border-transparent hover:border-primary-500/30">
                                <Package className="h-8 w-8 text-primary-600 dark:text-primary-400 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-foreground">Add Product</span>
                            </Link>
                            <Link href="/admin/products" className="flex flex-col items-center justify-center p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors group border border-transparent hover:border-primary-500/30">
                                <Package className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-foreground">View Products</span>
                            </Link>
                            <Link href="/admin/orders" className="flex flex-col items-center justify-center p-4 bg-secondary-50 dark:bg-secondary-800 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors group border border-transparent hover:border-primary-500/30">
                                <ShoppingCart className="h-8 w-8 text-secondary-600 dark:text-secondary-400 mb-2 group-hover:scale-110 transition-transform" />
                                <span className="text-sm font-medium text-foreground">View Orders</span>
                            </Link>
                        </div>
                    </div>

                    {/* Product Distribution */}
                    <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-800 p-6">
                        <h2 className="text-lg font-bold text-foreground mb-4">Product Overview</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                                <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Retail Products</span>
                                <span className="text-lg font-bold text-foreground">{retailProducts}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                                <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Wholesale Products</span>
                                <span className="text-lg font-bold text-foreground">{wholesaleProducts}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg">
                                <span className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Dual (Both)</span>
                                <span className="text-lg font-bold text-foreground">
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
