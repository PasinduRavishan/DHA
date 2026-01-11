import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Image from 'next/image';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ProductActions from "@/components/admin/ProductActions";
import { formatPrice } from "@/lib/utils";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface ProductPageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        redirect("/auth/signin");
    }

    const { id } = await params;

    const product = await prisma.product.findUnique({
        where: {
            id: id
        }
    });

    if (!product) {
        notFound();
    }

    // Cast variants to proper type for display
    const variants = product.variants as Record<string, string[]> | null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-6">
                <Link href="/admin/products" className="text-gray-500 hover:text-gray-900 flex items-center gap-2 mb-4">
                    <ArrowLeft size={16} /> Back to Products
                </Link>
                <div className="flex justify-between items-start">
                    <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                    <ProductActions productId={product.id} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Images */}
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                    <div className="aspect-square relative rounded-md overflow-hidden bg-gray-100 mb-4">
                        {product.images[0] ? (
                            <Image
                                src={product.images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                        )}
                    </div>
                    {/* Thumbnail Grid */}
                    {product.images.length > 1 && (
                        <div className="grid grid-cols-4 gap-4">
                            {product.images.map((img, i) => (
                                <div key={i} className="aspect-square relative rounded-md overflow-hidden bg-gray-50 border border-gray-200">
                                    <Image src={img} alt="Thumbnail" fill className="object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm space-y-4">
                        <div className="flex justify-between border-b pb-4">
                            <span className="text-gray-500">Price</span>
                            <span className="font-bold text-xl">{formatPrice(product.price)}</span>
                        </div>
                        <div className="flex justify-between border-b pb-4">
                            <span className="text-gray-500">Stock</span>
                            <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {product.stock} units
                            </span>
                        </div>
                        <div className="flex justify-between border-b pb-4">
                            <span className="text-gray-500">Category</span>
                            <span className="font-medium">{product.category}</span>
                        </div>
                        <div className="flex justify-between border-b pb-4">
                            <span className="text-gray-500">Type</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {product.type}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Description</h3>
                        <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {product.description}
                        </p>
                    </div>

                    {/* Variants Display */}
                    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Technical Specifications / Variants</h3>
                        {variants && Object.keys(variants).length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                                <tbody className="divide-y divide-gray-200">
                                    {Object.entries(variants).map(([key, values]) => (
                                        <tr key={key}>
                                            <td className="py-3 text-sm font-medium text-gray-500 w-1/3">{key}</td>
                                            <td className="py-3 text-sm text-gray-900">
                                                {(values as string[]).join(', ')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-sm text-gray-400 italic">No variants defined.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
