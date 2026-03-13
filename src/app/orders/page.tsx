import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import Link from 'next/link';
import { redirect } from "next/navigation";
import { formatPrice, formatDate } from "@/lib/utils";
import { ArrowRight, Package, Truck, CheckCircle, Clock, Ban } from 'lucide-react';
import Image from 'next/image';
import OrderChatButton from '@/components/orders/OrderChatButton';

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
                    product: true
                }
            },
            _count: {
                select: { items: true }
            }
        }
    });

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
            case 'PROCESSING': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'READY': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            case 'COMPLETED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
        }
    };

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
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <Link
                                href={`/orders/${order.id}`}
                                key={order.id}
                                className="block bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-secondary-200 dark:border-zinc-800 overflow-hidden hover:shadow-md hover:border-primary-500/30 transition-all group"
                            >
                                <div className="p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border border-transparent ${getStatusColor(order.status)}`}>
                                                    {getStatusIcon(order.status)}
                                                    {order.status}
                                                </span>
                                                <span className="text-sm text-secondary-500 dark:text-zinc-500">#{order.orderNumber.slice(-8).toUpperCase()}</span>
                                            </div>
                                            <p className="text-xs text-secondary-400">Placed on {formatDate(order.createdAt)}</p>
                                        </div>
                                        <div className="text-left sm:text-right flex flex-col gap-2">
                                            <div>
                                                <p className="text-sm text-secondary-500 dark:text-zinc-400 mb-1">Total Amount</p>
                                                <p className="text-xl font-bold text-foreground dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-500 transition-colors">
                                                    {formatPrice(order.totalAmount)}
                                                </p>
                                            </div>
                                            <OrderChatButton order={order} />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 pt-4 border-t border-secondary-100 dark:border-zinc-800">
                                        <div className="flex -space-x-4 overflow-hidden py-1 pl-1">
                                            {order.items.map((item, i) => (
                                                <div key={item.id} className="relative w-12 h-12 rounded-lg border-2 border-white dark:border-zinc-900 overflow-hidden shadow-sm bg-secondary-100 dark:bg-black">
                                                    <Image
                                                        src={item.product.images[0] || '/images/placeholder.png'}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ))}
                                            {/* We only fetch 3, but if order has more, we could show +N if we fetched count. For now simpler is fine. */}
                                        </div>
                                        <div className="ml-auto text-sm text-primary-600 dark:text-primary-500 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                            View Details <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
