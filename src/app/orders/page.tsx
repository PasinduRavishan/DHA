import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import Link from 'next/link';
import { redirect } from "next/navigation";
import { Package } from 'lucide-react';
import UserOrderList from '@/components/orders/UserOrderList';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/signin");
    }

    const orders = await prisma.order.findMany({
        where: {
            userId: session.user.id
        },
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            items: {
                take: 3,
                include: {
                    product: {
                        select: {
                            name: true,
                            images: true
                        }
                    }
                }
            }
        }
    });

    return (
        <div className="bg-background dark:bg-black min-h-screen transition-colors duration-300 relative pb-20">
            {/* Ambient Effect */}
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-secondary-100/50 dark:from-zinc-900/30 to-transparent pointer-events-none"></div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold mb-2 text-foreground dark:text-white">My Orders</h1>
                    <p className="text-secondary-600 dark:text-zinc-400">Track and manage your recent purchases</p>
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-secondary-200 dark:border-zinc-800 shadow-sm">
                        <div className="w-16 h-16 bg-secondary-100 dark:bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-secondary-400" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground dark:text-white mb-2">No orders yet</h3>
                        <p className="text-secondary-500 dark:text-zinc-400 mb-6">Start shopping to fill your history!</p>
                        <Link href="/retail" className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <UserOrderList initialOrders={orders} />
                )}
            </div>
        </div>
    );
}
