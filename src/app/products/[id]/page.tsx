import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/shop/ProductGallery";
import ProductInfo from "@/components/shop/ProductInfo";

interface ProductPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: {
            id: id
        }
    });

    if (!product) {
        notFound();
    }

    return (
        <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 lg:items-start">
                    <ProductGallery images={product.images} />
                    <ProductInfo data={product} />
                </div>
            </div>
        </div>
    );
}
