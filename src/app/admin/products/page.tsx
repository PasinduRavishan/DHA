import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

export default async function ProductsPage() {
    const session = await getServerSession(authOptions);

    if (session?.user?.role !== "ADMIN") {
        redirect("/auth/signin");
    }

    const products = await prisma.product.findMany({
        orderBy: {
            createdAt: 'desc'
        }
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Products</h1>
                <Link
                    href="/admin/products/add"
                    className="bg-primary-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary-700 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    Add Product
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-100">
                <ul className="divide-y divide-gray-200">
                    {products.length === 0 ? (
                        <li className="px-6 py-12 text-center text-gray-500">
                            No products found. Click "Add Product" to create one.
                        </li>
                    ) : (
                        products.map((product) => (
                            <li key={product.id}>
                                <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="h-16 w-16 flex-shrink-0 relative rounded-md overflow-hidden border border-gray-200 bg-gray-100">
                                            {product.images[0] ? (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400">
                                                    No Img
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-lg font-medium text-primary-600 truncate">{product.name}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    {product.category}
                                                </span>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.type === 'RETAIL' ? 'bg-blue-100 text-blue-800' :
                                                        product.type === 'WHOLESALE' ? 'bg-purple-100 text-purple-800' :
                                                            'bg-green-100 text-green-800'
                                                    }`}>
                                                    {product.type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-gray-900">{formatPrice(product.price)}</div>
                                            <div className={`text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {product.stock} in stock
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/admin/products/${product.id}`} className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                                                <Edit className="h-5 w-5" />
                                            </Link>
                                            {/* Delete button would go here (form action) */}
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
}
