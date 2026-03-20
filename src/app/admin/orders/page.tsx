import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import OrderList from "@/components/admin/OrderList";

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
            user: {
                select: {
                    name: true,
                    email: true
                }
            },
            items: {
                include: {
                    product: {
                        select: {
                            name: true
                        }
                    }
                }
            }
        }
    });

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

                <OrderList initialOrders={orders} />
            </div>
        </div>
    );
}
