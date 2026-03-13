import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Package } from "lucide-react";
import ProductList from "@/components/admin/ProductList";

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "ADMIN") {
        redirect("/auth/signin");
    }

    const [products, categories] = await Promise.all([
        prisma.product.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        }),
        prisma.category.findMany({
            orderBy: { name: 'asc' }
        })
    ]);

    // Simple serialization for props
    const serializedProducts = products.map(p => ({
        ...p,
        price: Number(p.price)
    }));

    return (
        <div className="bg-background dark:bg-black min-h-screen transition-colors duration-300 relative">
            {/* Ambient Top Shadow/Gradient */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-zinc-900/50 via-zinc-900/10 to-transparent pointer-events-none hidden dark:block"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-500 rounded-lg">
                                <Package className="h-6 w-6" />
                            </div>
                            <h1 className="text-3xl font-black text-foreground dark:text-white tracking-tight">Products Listing</h1>
                        </div>
                        <p className="text-secondary-500 dark:text-zinc-400 font-medium">Manage and monitor your store inventory</p>
                    </div>

                    <Link
                        href="/admin/products/add"
                        className="group relative overflow-hidden bg-primary-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-1 transition-all active:scale-95"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <Plus className="h-5 w-5" />
                            Add New Product
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </Link>
                </div>

                <ProductList initialProducts={serializedProducts} categories={categories} />
            </div>
        </div>
    );
}
