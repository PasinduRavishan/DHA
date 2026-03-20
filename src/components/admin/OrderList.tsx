'use client';

import { useState, useMemo } from 'react';
import { 
    Package, 
    Calendar, 
    User, 
    Circle, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    Search,
    Filter,
    X
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

interface OrderItem {
    product: {
        name: string;
    };
}

interface Order {
    id: string;
    orderNumber: string;
    createdAt: Date;
    totalAmount: number;
    status: string;
    guestName: string | null;
    guestEmail: string | null;
    user: {
        name: string | null;
        email: string | null;
    } | null;
    items: OrderItem[];
}

interface OrderListProps {
    initialOrders: Order[];
}

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

export default function OrderList({ initialOrders }: OrderListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const filteredOrders = useMemo(() => {
        return initialOrders.filter(order => {
            const customerName = order.user?.name || order.guestName || "Guest";
            const customerEmail = order.user?.email || order.guestEmail || "";
            const orderNumber = order.orderNumber.toLowerCase();
            const query = searchQuery.toLowerCase();
            
            const matchesSearch = 
                customerName.toLowerCase().includes(query) || 
                customerEmail.toLowerCase().includes(query) ||
                orderNumber.includes(query) ||
                order.items.some(item => item.product.name.toLowerCase().includes(query));
                
            const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [initialOrders, searchQuery, statusFilter]);

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-secondary-200 dark:border-zinc-800">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by order ID, customer, or product name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-10 py-3 bg-secondary-50 dark:bg-black border border-secondary-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-foreground"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    
                    <div className="relative group min-w-[200px]">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-secondary-50 dark:bg-black border border-secondary-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none transition-all text-foreground cursor-pointer"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="READY">Ready</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
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
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center">
                                        <Package className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-foreground dark:text-white">No orders found</h3>
                                        <p className="text-secondary-500 dark:text-zinc-500">Try adjusting your search or filters.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
