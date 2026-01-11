import prisma from "@/lib/prisma";
import ProductCard from "@/components/ui/ProductCard";
import { ProductType } from "@prisma/client";

// Opt out of caching for now to see new products immediately
export const dynamic = 'force-dynamic';

export default async function RetailShop() {
    const products = await prisma.product.findMany({
        where: {
            OR: [
                { type: ProductType.RETAIL },
                { type: ProductType.BOTH }
            ]
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="bg-background min-h-screen transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-10">
                    <h1 className="text-4xl font-bold mb-2 text-foreground">Retail Shop</h1>
                    <p className="text-secondary-600 dark:text-secondary-400">Browse our curated collection of premium home accessories.</p>
                </div>

                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">🛍️</span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">No products found</h3>
                        <p className="text-secondary-500 dark:text-secondary-400">Check back later for new arrivals.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product.id} data={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
