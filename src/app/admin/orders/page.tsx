import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import {
    Package,
    Calendar,
    User,
    CreditCard,
    MoreHorizontal,
    Circle,
    CheckCircle2,
    Clock,
    XCircle,
    Truck,
    Search
} from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "ADMIN") {
        redirect("/auth/signin");
    }

    const orders = await prisma.order.findMany({
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            user: true,
            items: {
                include: {
                    product: true
                }
            }
        }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-400/10 border-yellow-200 dark:border-yellow-400/20';
            case 'PROCESSING': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-400/10 border-blue-200 dark:border-blue-400/20';
            case 'READY': return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-400/10 border-purple-200 dark:border-purple-400/20';
            case 'COMPLETED': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-400/10 border-green-200 dark:border-green-400/20';
            case 'CANCELLED': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-400/10 border-red-200 dark:border-red-400/20';
            default: return 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock className="w-3 h-3 mr-1" />;
            case 'PROCESSING': return <Package className="w-3 h-3 mr-1" />;
            case 'READY': return <CheckCircle2 className="w-3 h-3 mr-1" />;
            case 'COMPLETED': return <CheckCircle2 className="w-3 h-3 mr-1" />;
            case 'CANCELLED': return <XCircle className="w-3 h-3 mr-1" />;
            default: return <Circle className="w-3 h-3 mr-1" />;
        }
    };

    return (
        <div className="bg-background dark:bg-black min-h-screen transition-colors duration-300 relative">
            {/* Ambient Top Shadow/Gradient */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-zinc-900/50 via-zinc-900/10 to-transparent pointer-events-none hidden dark:block"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground dark:text-white">Orders</h1>
                        <p className="text-secondary-500 dark:text-zinc-400 mt-1">Manage and track customer orders</p>
                    </div>
                </div>

                {/* Orders List / Table */}
                <div className="space-y-6">
                    {orders.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-xl border border-secondary-200 dark:border-zinc-800 border-dashed">
                            <Package className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground dark:text-white">No orders yet</h3>
                            <p className="text-secondary-500 dark:text-zinc-500">Orders will appear here once customers start purchasing.</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-secondary-200 dark:border-zinc-800 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-secondary-200 dark:border-zinc-800 bg-secondary-50 dark:bg-zinc-950/50">
                                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-zinc-500">Order ID</th>
                                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-zinc-500">Customer</th>
                                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-zinc-500">Items</th>
                                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-zinc-500">Date</th>
                                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-zinc-500">Total</th>
                                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-zinc-500">Status</th>
                                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-secondary-500 dark:text-zinc-500 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-secondary-100 dark:divide-zinc-800">
                                        {orders.map((order) => (
                                            <tr key={order.id} className="group hover:bg-secondary-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <span className="font-mono text-xs text-primary-600 dark:text-primary-400 font-medium bg-primary-50 dark:bg-primary-500/10 px-2 py-1 rounded">
                                                        #{order.orderNumber.slice(-6).toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-secondary-100 dark:bg-zinc-800 flex items-center justify-center text-secondary-500 dark:text-zinc-400">
                                                            <User className="w-4 h-4" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground dark:text-white">
                                                                {order.user?.name || order.guestName || "Guest"}
                                                            </p>
                                                            <p className="text-xs text-secondary-500 dark:text-zinc-500">
                                                                {order.user?.email || order.guestEmail || "No email"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="text-sm text-foreground dark:text-zinc-300">
                                                        {order.items.length} items
                                                    </div>
                                                    <p className="text-xs text-secondary-500 dark:text-zinc-500 truncate max-w-[150px]">
                                                        {order.items.map(i => i.product.name).join(", ")}
                                                    </p>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-secondary-600 dark:text-zinc-400">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-sm font-bold text-foreground dark:text-white">
                                                        {formatPrice(order.totalAmount)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                                        {getStatusIcon(order.status)}
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <Link
                                                        href={`/admin/orders/${order.id}`}
                                                        className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                                                    >
                                                        View Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
