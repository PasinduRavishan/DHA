import prisma from "@/lib/prisma";
import RetailShowcase from "@/components/shop/RetailShowcase";
import { ProductType } from "@prisma/client";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Retail Shop | Dhanuka Enterprises',
    description: 'Browse our curated collection of premium home accessories and architectural hardware.',
};

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

    // Fetch carousel slides with fallback for missing table
    let carouselSlides = [];
    try {
        carouselSlides = await prisma.carouselSlide.findMany({
            where: {
                pageType: 'RETAIL',
                isActive: true
            },
            orderBy: {
                order: 'asc'
            }
        });
    } catch (error) {
        // Fallback to default slides if table doesn't exist yet
        console.log('Carousel table not found, using default slides');
        carouselSlides = [
            {
                id: 'default-1',
                title: 'Elevate Your Living Spaces',
                subtitle: 'Retail Collection',
                description: 'Premium furniture fittings, architectural hardware, and power tools for homeowners and professionals.',
                imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop'
            }
        ];
    }

    // Derive categories dynamically from the products
    const uniqueCategories = Array.from(new Set(products.map(p => p.category))).sort();
    const categories = uniqueCategories.map(cat => ({
        id: cat,
        name: cat
    }));

    // Serialize products for client component
    const serializedProducts = products.map(p => ({
        ...p,
        price: Number(p.price),
        variants: p.variants as any
    }));

    return (
        <RetailShowcase
            products={serializedProducts}
            categories={categories}
            carouselSlides={carouselSlides}
        />
    );
}
