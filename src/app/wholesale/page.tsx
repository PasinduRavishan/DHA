import prisma from "@/lib/prisma";
import ProductCard from "@/components/ui/ProductCard";
import { ProductType } from "@prisma/client";

export const dynamic = 'force-dynamic';

export default async function WholesaleShop() {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { type: ProductType.WHOLESALE },
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
          <h1 className="text-4xl font-bold mb-2 text-foreground">Wholesale Shop</h1>
          <p className="text-secondary-600 dark:text-secondary-400">Bulk solutions for contractors and businesses.</p>
        </div>

        <div className="bg-secondary-900 dark:bg-black border-l-4 border-primary-500 rounded-r-lg p-6 mb-12 shadow-md">
          <h2 className="text-xl font-bold text-white mb-3">Wholesale Benefits</h2>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-300 text-sm">
            <li className="flex items-center gap-2 accent-orange-500">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0"></span>
              <span>Bulk pricing discounts available upon request</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0"></span>
              <span>Direct chat with sales team for custom orders</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0"></span>
              <span>Priority shipping for bulk orders</span>
            </li>
          </ul>
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">No wholesale products listed yet.</h3>
            <p className="text-secondary-500 dark:text-secondary-400">Please check back later or contact us directly.</p>
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
