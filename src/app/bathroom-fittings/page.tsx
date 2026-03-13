import prisma from "@/lib/prisma";
import BathroomShowcase from "@/components/bathroom/BathroomShowcase";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Luxury Bathroom Fittings | Dhanuka Enterprises',
    description: 'Explore our premium collection of modern bathroom fittings, showers, and accessories.',
};

export const dynamic = 'force-dynamic';

export default async function BathroomFittingsPage() {
    const products = await prisma.product.findMany({
        where: {
            type: 'BATHROOM'
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Derive categories dynamically from the products to ensure relevance
    const uniqueCategories = Array.from(new Set(products.map(p => p.category))).sort();
    const categories = uniqueCategories.map(cat => ({
        id: cat,
        name: cat
    }));

    // Pass as simple objects
    const serializedProducts = products.map(p => ({
        ...p,
        price: Number(p.price),
        variants: p.variants as any
    }));

    return (
        <BathroomShowcase
            products={serializedProducts}
            categories={categories}
        />
    );
}
