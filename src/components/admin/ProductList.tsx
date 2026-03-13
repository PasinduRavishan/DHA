'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Edit, Trash2, Search, Filter, Package, AlertCircle, ChevronRight, MoreVertical } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    images: string[];
    type: string;
}

interface Category {
    id: string;
    name: string;
}

interface ProductListProps {
    initialProducts: Product[];
    categories: Category[];
}

export default function ProductList({ initialProducts, categories }: ProductListProps) {
    const [products, setProducts] = useState(initialProducts);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedType, setSelectedType] = useState('All');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const router = useRouter();

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.category.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
            const matchesType = selectedType === 'All' || product.type === selectedType;
            return matchesSearch && matchesCategory && matchesType;
        });
    }, [products, searchQuery, selectedCategory, selectedType]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success('Product deleted successfully');
                setProducts(prev => prev.filter(p => p.id !== id));
            } else {
                toast.error('Failed to delete product');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters Partition */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-secondary-200 dark:border-zinc-800">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Search */}
                    <div className="flex-1">
                        <label className="block text-sm font-semibold text-secondary-700 dark:text-zinc-300 mb-2">Search Products</label>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by name or category..."
                                className="w-full pl-10 pr-4 py-3 bg-secondary-50 dark:bg-black border border-secondary-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-foreground"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="w-full lg:w-64">
                        <label className="block text-sm font-semibold text-secondary-700 dark:text-zinc-300 mb-2">Category Filter</label>
                        <div className="relative group">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
                            <select
                                className="w-full pl-10 pr-4 py-3 bg-secondary-50 dark:bg-black border border-secondary-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none transition-all text-foreground cursor-pointer"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                                <option value="All">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Type Filter */}
                    <div className="w-full lg:w-48">
                        <label className="block text-sm font-semibold text-secondary-700 dark:text-zinc-300 mb-2">Pricing Type</label>
                        <select
                            className="w-full px-4 py-3 bg-secondary-50 dark:bg-black border border-secondary-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none transition-all text-foreground cursor-pointer"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                        >
                            <option value="All">All Types</option>
                            <option value="RETAIL">Retail Only</option>
                            <option value="WHOLESALE">Wholesale Only</option>
                            <option value="BOTH">Dual Pricing</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 gap-4">
                {filteredProducts.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 p-20 rounded-2xl text-center border border-dashed border-secondary-200 dark:border-zinc-800">
                        <Package className="h-12 w-12 text-secondary-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-foreground dark:text-white">No products found</h3>
                        <p className="text-secondary-500 dark:text-zinc-400">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    filteredProducts.map((product) => (
                        <div
                            key={product.id}
                            className="group bg-white dark:bg-zinc-900 rounded-2xl border border-secondary-200 dark:border-zinc-800 overflow-hidden hover:shadow-xl hover:border-primary-500/30 transition-all flex flex-col md:flex-row items-center p-4 gap-6"
                        >
                            {/* Image Section */}
                            <div className="relative h-24 w-24 md:h-20 md:w-20 rounded-xl overflow-hidden border border-secondary-100 dark:border-zinc-800 bg-secondary-50 dark:bg-black flex-shrink-0">
                                {product.images[0] ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-secondary-400">
                                        <Package className="h-6 w-6" />
                                    </div>
                                )}
                            </div>

                            {/* Info Section */}
                            <div className="flex-1 text-center md:text-left min-w-0">
                                <h3 className="text-lg font-bold text-foreground dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-500 transition-colors">
                                    {product.name}
                                </h3>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-secondary-100 dark:bg-zinc-800 text-secondary-700 dark:text-zinc-400">
                                        {product.category}
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${product.type === 'RETAIL'
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                                            : product.type === 'WHOLESALE'
                                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                                                : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                        }`}>
                                        {product.type === 'BOTH' ? 'Retail & Wholesale' : product.type}
                                    </span>
                                </div>
                            </div>

                            {/* Stats Section */}
                            <div className="flex items-center gap-12 text-center">
                                <div>
                                    <p className="text-xs text-secondary-500 dark:text-zinc-500 uppercase tracking-wider font-bold mb-1">Price</p>
                                    <p className="text-base font-black text-foreground dark:text-white">{formatPrice(product.price)}</p>
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-xs text-secondary-500 dark:text-zinc-500 uppercase tracking-wider font-bold mb-1">Stock</p>
                                    <p className={`text-base font-black ${product.stock > 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
                                        {product.stock}
                                    </p>
                                </div>
                            </div>

                            {/* Actions Section */}
                            <div className="flex items-center gap-2 ml-auto">
                                <Link
                                    href={`/admin/products/${product.id}`}
                                    className="p-3 bg-secondary-100 dark:bg-zinc-800 text-secondary-600 dark:text-zinc-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 dark:hover:text-primary-500 rounded-xl transition-all"
                                    title="Edit Product"
                                >
                                    <Edit className="h-5 w-5" />
                                </Link>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    disabled={deletingId === product.id}
                                    className="p-3 bg-secondary-100 dark:bg-zinc-800 text-secondary-600 dark:text-zinc-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-500 rounded-xl transition-all disabled:opacity-50"
                                    title="Delete Product"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
