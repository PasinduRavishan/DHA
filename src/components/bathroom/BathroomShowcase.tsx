'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { X, Info, Layers, ArrowRight, ShoppingCart, MessageCircle, Search } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import useCart from '@/lib/store/cart';
import useChatStore from '@/lib/store/chat';
import { toast } from 'react-hot-toast';

interface Product {
    id: string;
    name: string;
    description?: string | null;
    price: number | null;
    images: string[];
    category: string;
    variants: Record<string, string[]> | Array<{ key: string, value: string }> | null;
    stock: number;
}

interface BathroomShowcaseProps {
    products: Product[];
    categories: { id: string; name: string }[];
}

export default function BathroomShowcase({ products, categories }: BathroomShowcaseProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const cart = useCart();
    const chatStore = useChatStore();
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [products, selectedCategory, searchQuery]);

    // Helper function to parse variants - MUST be defined before functions that use it
    const getVariants = (product: Product): Record<string, string[]> => {
        if (!product.variants) return {};

        try {
            // Handle old format: Array of {key, value} objects
            if (Array.isArray(product.variants)) {
                const variantsMap: Record<string, string[]> = {};
                product.variants.forEach((v: any) => {
                    if (v && typeof v === 'object' && v.key && v.value) {
                        const key = String(v.key);
                        const value = String(v.value);
                        if (!variantsMap[key]) {
                            variantsMap[key] = [];
                        }
                        variantsMap[key].push(value);
                    }
                });
                return variantsMap;
            }

            // Handle new format: Record<string, string[]>
            if (typeof product.variants === 'object') {
                const validVariants: Record<string, string[]> = {};
                Object.entries(product.variants).forEach(([key, value]) => {
                    if (Array.isArray(value) && value.length > 0) {
                        // Ensure all values are strings
                        validVariants[key] = value.map((v: any) => {
                            if (typeof v === 'string') return v;
                            if (typeof v === 'object' && v !== null) {
                                // Handle if value itself is {key, value} format
                                return String(v.value || v.name || JSON.stringify(v));
                            }
                            return String(v);
                        });
                    }
                });
                return validVariants;
            }
        } catch (error) {
            console.error('Error parsing variants:', error);
            return {};
        }

        return {};
    };

    const hasVariants = (product: Product): boolean => {
        const variants = getVariants(product);
        return Object.keys(variants).length > 0;
    };

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setActiveImageIndex(0);
        // Pre-select first variant value for each variant type using getVariants
        const variants = getVariants(product);
        const initialSelection: Record<string, string> = {};
        Object.entries(variants).forEach(([key, values]) => {
            if (values.length > 0) {
                initialSelection[key] = values[0];
            }
        });
        setSelectedVariants(initialSelection);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setSelectedProduct(null);
        setSelectedVariants({});
        document.body.style.overflow = 'auto';
    };

    const handleVariantSelect = (variantType: string, value: string) => {
        setSelectedVariants(prev => ({
            ...prev,
            [variantType]: value
        }));
    };

    const addToCart = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation();

        // Create unique ID based on selected variants
        const variantString = Object.entries(selectedVariants)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}:${value}`)
            .join('|');
        const uniqueId = variantString ? `${product.id}-${variantString}` : product.id;

        cart.addItem({
            id: product.id,
            uniqueId: uniqueId,
            name: product.name,
            price: product.price || 0,
            image: product.images[0],
            quantity: 1,
            maxStock: product.stock,
            selectedVariants: Object.keys(selectedVariants).length > 0 ? selectedVariants : undefined
        });

        toast.success('Added to cart!');
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-white selection:bg-amber-500/30">
            {/* Hero Section */}
            <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop"
                        alt="Luxury Bathroom"
                        fill
                        className="object-cover opacity-70 scale-105 animate-slow-zoom"
                        priority
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
                </div>

                <div className="relative z-10 text-center max-w-4xl px-6 animate-fade-in-up">
                    <span className="inline-block py-1 px-3 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold tracking-widest uppercase mb-6 border border-amber-500/20 backdrop-blur-md">
                        Bathroom Collection
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-tight">
                        Luxury <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">
                            Bathroom Fittings
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto font-light leading-relaxed">
                        Premium faucets, showers, and bath accessories designed with elegance and durability in mind.
                    </p>
                </div>
            </div>

            {/* Category Filter & Search */}
            <div className="sticky top-20 z-40 bg-neutral-950/80 backdrop-blur-xl border-b border-white/5 py-4">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        {/* Categories */}
                        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 md:pb-0 w-full md:w-auto">
                            <button
                                onClick={() => setSelectedCategory('All')}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap ${selectedCategory === 'All'
                                    ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105'
                                    : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white'
                                    }`}
                            >
                                All Products
                            </button>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.name)}
                                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 whitespace-nowrap ${selectedCategory === cat.name
                                        ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105'
                                        : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white'
                                        }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>

                        {/* Search Bar */}
                        <div className="relative w-full md:w-72 group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 group-focus-within:text-amber-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-neutral-900 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all text-white placeholder:text-neutral-600"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="max-w-7xl mx-auto px-4 py-20">
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-neutral-500 text-xl font-light">No products found in this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProducts.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => handleProductClick(product)}
                                className="group relative bg-neutral-900/50 rounded-2xl overflow-hidden cursor-pointer border border-white/5 hover:border-amber-500/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] hover:-translate-y-2"
                            >
                                {/* Image */}
                                <div className="aspect-[4/5] relative overflow-hidden bg-neutral-800">
                                    {product.images[0] && (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                    {/* Floating Action */}
                                    <div className="absolute bottom-6 right-6 translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                                        <button className="h-12 w-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:bg-amber-400 transition-colors">
                                            <ArrowRight className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Minimal Info */}
                                <div className="absolute bottom-6 left-6 right-16">
                                    <p className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
                                        {product.category}
                                    </p>
                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-amber-200 transition-colors">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm font-medium text-neutral-300">
                                        {product.price && product.price > 0 ? formatPrice(product.price) : 'POA'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8">
                    <div
                        className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-fade-in"
                        onClick={closeModal}
                    />

                    <div className="relative w-full max-w-6xl bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col md:flex-row max-h-[90vh] animate-scale-up">
                        {/* Close Button */}
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-white hover:text-black rounded-full text-white transition-all duration-300 backdrop-blur-md"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        {/* Gallery Side */}
                        <div className="w-full md:w-1/2 bg-black relative flex flex-col">
                            <div className="flex-1 relative min-h-[40vh] md:min-h-0">
                                {selectedProduct.images[activeImageIndex] && (
                                    <Image
                                        src={selectedProduct.images[activeImageIndex]}
                                        alt={selectedProduct.name}
                                        fill
                                        className="object-cover"
                                    />
                                )}
                            </div>
                            {/* Thumbnails */}
                            {selectedProduct.images.length > 1 && (
                                <div className="p-4 flex gap-2 overflow-x-auto bg-neutral-950/50 backdrop-blur-sm absolute bottom-0 left-0 right-0">
                                    {selectedProduct.images.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveImageIndex(idx)}
                                            className={`relative h-16 w-16 rounded-lg overflow-hidden border-2 transition-all ${activeImageIndex === idx ? 'border-amber-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            <Image src={img} alt="thumb" fill className="object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Details Side */}
                        <div className="w-full md:w-1/2 p-8 md:p-12 overflow-y-auto custom-scrollbar">
                            <div className="mb-8">
                                <span className="inline-block py-1 px-3 rounded-full bg-neutral-800 text-amber-500 text-xs font-bold tracking-widest uppercase mb-4">
                                    {selectedProduct.category}
                                </span>
                                <h2 className="text-4xl font-black text-white mb-4 leading-tight">
                                    {selectedProduct.name}
                                </h2>
                                <p className="text-2xl font-light text-neutral-200">
                                    {selectedProduct.price && selectedProduct.price > 0
                                        ? formatPrice(selectedProduct.price)
                                        : <span className="text-amber-500 font-bold text-lg">Price on Application</span>
                                    }
                                </p>
                            </div>

                            <div className="space-y-8">
                                {/* Description */}
                                {selectedProduct.description && (
                                    <div>
                                        <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <Info className="h-4 w-4" /> Description
                                        </h3>
                                        <p className="text-neutral-300 leading-relaxed text-lg font-light">
                                            {selectedProduct.description}
                                        </p>
                                    </div>
                                )}

                                {/* Variants Section */}
                                {hasVariants(selectedProduct) && (
                                    <div>
                                        <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Layers className="h-4 w-4" /> Available Options
                                        </h3>
                                        <div className="space-y-5">
                                            {Object.entries(getVariants(selectedProduct)).map(([variantType, values]) => (
                                                <div key={variantType}>
                                                    <label className="block text-sm font-medium text-neutral-400 mb-3">
                                                        {variantType}
                                                    </label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {values.map((value) => (
                                                            <button
                                                                key={value}
                                                                onClick={() => handleVariantSelect(variantType, value)}
                                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${selectedVariants[variantType] === value
                                                                    ? 'bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-600/20'
                                                                    : 'bg-neutral-800/50 border-white/10 text-neutral-300 hover:border-amber-500/50 hover:bg-neutral-800'
                                                                    }`}
                                                            >
                                                                {value}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Selected Variants Summary */}
                                {Object.keys(selectedVariants).length > 0 && (
                                    <div className="bg-neutral-800/30 rounded-xl p-4 border border-white/5">
                                        <p className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Selected Options</p>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(selectedVariants).map(([key, value]) => (
                                                <span key={key} className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-800 rounded-full text-sm">
                                                    <span className="text-neutral-500">{key}:</span>
                                                    <span className="text-white font-medium">{value}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="pt-8 border-t border-white/10 flex flex-col gap-4">
                                    {selectedProduct.price && selectedProduct.price > 0 ? (
                                        <button
                                            onClick={(e) => selectedProduct && addToCart(e as any, selectedProduct)}
                                            className="w-full py-4 bg-white text-black rounded-xl font-bold hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 group"
                                        >
                                            <ShoppingCart className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                            Add to Cart
                                        </button>
                                    ) : (
                                        <button
                                            className="w-full py-4 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-500 transition-colors flex items-center justify-center gap-2"
                                            onClick={() => {
                                                chatStore.shareProduct({
                                                    id: selectedProduct.id,
                                                    name: selectedProduct.name,
                                                    price: selectedProduct.price || 0,
                                                    image: selectedProduct.images[0] || '',
                                                    category: selectedProduct.category
                                                });
                                            }}
                                        >
                                            <MessageCircle className="h-5 w-5" />
                                            Inquire Now
                                        </button>
                                    )}

                                    {/* Chat Button - Always visible */}
                                    <button
                                        className="w-full py-3 bg-neutral-800 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2 border border-white/10"
                                        onClick={() => {
                                            chatStore.shareProduct({
                                                id: selectedProduct.id,
                                                name: selectedProduct.name,
                                                price: selectedProduct.price || 0,
                                                image: selectedProduct.images[0] || '',
                                                category: selectedProduct.category
                                            });
                                        }}
                                    >
                                        <MessageCircle className="h-4 w-4" />
                                        Ask About This Product
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
