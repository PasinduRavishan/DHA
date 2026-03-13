import prisma from "@/lib/prisma";
import WholesaleShowcase from "@/components/shop/WholesaleShowcase";
import { ProductType } from "@prisma/client";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wholesale Solutions | Dhanuka Enterprises',
  description: 'Bulk solutions for contractors, interior designers, and hardware retailers.',
};

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

  // Fetch carousel slides with fallback for missing table
  let carouselSlides = [];
  try {
    carouselSlides = await prisma.carouselSlide.findMany({
      where: {
        pageType: 'WHOLESALE',
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
        title: 'Bulk Orders Made Simple',
        subtitle: 'Wholesale Solutions',
        description: 'Premium pricing for contractors, interior designers, and hardware retailers. Direct access to our sales team.',
        imageUrl: 'https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=2070&auto=format&fit=crop'
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
    <WholesaleShowcase
      products={serializedProducts}
      categories={categories}
      carouselSlides={carouselSlides}
    />
  );
}
