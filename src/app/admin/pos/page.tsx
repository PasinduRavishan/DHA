'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
    Search, Plus, Minus, Trash2, ShoppingCart, FileText, Printer,
    Download, User, Package, X, Filter, ChevronDown, Receipt,
    ExternalLink, Check, Edit2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Product {
    id: string;
    name: string;
    description: string;
    category: string;
    price: number;
    stock: number;
    images: string[];
    type: string;
}

interface CartItem {
    id: string;
    productId?: string;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    isCustom: boolean;
    image?: string;
}

interface CustomerInfo {
    name: string;
    email: string;
    phone: string;
    address: string;
}

export default function POSPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    // State
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [savedQuotationId, setSavedQuotationId] = useState('');
    const [editingPriceId, setEditingPriceId] = useState<string | null>(null);

    // Quick add custom item inline
    const [quickCustomName, setQuickCustomName] = useState('');
    const [quickCustomPrice, setQuickCustomPrice] = useState<number>(0);

    // Customer info
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    // Discount & Tax
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState<'fixed' | 'percentage'>('fixed');
    const [notes, setNotes] = useState('');

    // Redirect if not admin
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
            router.push('/');
        }
    }, [status, session, router]);

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/products');
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                    const cats = [...new Set(data.map((p: Product) => p.category))] as string[];
                    setCategories(cats);
                }
            } catch (error) {
                console.error('Failed to fetch products');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // Filter products
    useEffect(() => {
        let filtered = products;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
            );
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(p => p.category === categoryFilter);
        }

        setFilteredProducts(filtered);
    }, [products, searchQuery, categoryFilter]);

    // Cart calculations
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = discountType === 'percentage'
        ? (subtotal * discount / 100)
        : discount;
    const total = Math.max(0, subtotal - discountAmount);

    // Add product to cart
    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id && !item.isCustom);
            if (existing) {
                return prev.map(item =>
                    item.productId === product.id && !item.isCustom
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                id: `cart-${Date.now()}`,
                productId: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                quantity: 1,
                isCustom: false,
                image: product.images[0]
            }];
        });
        toast.success(`${product.name} added`);
    };

    // Quick add custom item
    const addQuickCustomItem = () => {
        if (!quickCustomName || quickCustomPrice <= 0) {
            toast.error('Enter item name and price');
            return;
        }

        setCart(prev => [...prev, {
            id: `custom-${Date.now()}`,
            name: quickCustomName,
            price: quickCustomPrice,
            quantity: 1,
            isCustom: true
        }]);

        setQuickCustomName('');
        setQuickCustomPrice(0);
        toast.success('Custom item added');
    };

    // Update price
    const updatePrice = (id: string, newPrice: number) => {
        setCart(prev => prev.map(item =>
            item.id === id ? { ...item, price: newPrice } : item
        ));
        setEditingPriceId(null);
    };

    // Update quantity
    const updateQuantity = (id: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    // Remove from cart
    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    // Clear cart
    const clearCart = () => {
        setCart([]);
        setDiscount(0);
        setNotes('');
        setCustomerInfo({ name: '', email: '', phone: '', address: '' });
    };

    // Generate PDF with professional Black & White styling
    const generatePDF = useCallback((quotationNumber: string) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // === HEADER SECTION ===
        // Minimalist Header
        doc.setFontSize(26);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('DHANUKA', 14, 20);

        // Subtitle
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text('Hardware & Building Materials', 14, 26);

        // Thick Black Line
        doc.setLineWidth(1.5);
        doc.setDrawColor(0, 0, 0);
        doc.line(14, 32, pageWidth - 14, 32);

        // QUOTATION Title (right side)
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('QUOTATION', pageWidth - 14, 20, { align: 'right' });

        // Quotation details (right side)
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`No: ${quotationNumber}`, pageWidth - 14, 28, { align: 'right' });
        doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - 14, 42, { align: 'right' });

        // === CUSTOMER SECTION ===
        // Box for Bill To
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        doc.setFillColor(250, 250, 250);
        doc.rect(14, 45, pageWidth / 2 - 20, 35, 'FD');

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('BILL TO:', 18, 52);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        let yPos = 58;

        if (customerInfo.name) {
            doc.setFont('helvetica', 'bold');
            doc.text(customerInfo.name, 18, yPos);
            doc.setFont('helvetica', 'normal');
            yPos += 5;
        }

        doc.setFontSize(9);
        doc.setTextColor(50, 50, 50);
        if (customerInfo.phone) {
            doc.text(`Tel: ${customerInfo.phone}`, 18, yPos);
            yPos += 5;
        }
        if (customerInfo.email) {
            doc.text(`Email: ${customerInfo.email}`, 18, yPos);
            yPos += 5;
        }
        if (customerInfo.address) {
            const addressLines = doc.splitTextToSize(customerInfo.address, 70);
            doc.text(addressLines, 18, yPos);
        }

        // === ITEMS TABLE ===
        const tableData = cart.map((item, index) => [
            (index + 1).toString(),
            item.name + (item.isCustom ? ' *' : ''),
            item.quantity.toString(),
            formatPrice(item.price),
            formatPrice(item.price * item.quantity)
        ]);

        autoTable(doc, {
            startY: 90,
            head: [['#', 'Description', 'Qty', 'Unit Price', 'Amount']],
            body: tableData,
            theme: 'grid', // 'grid' theme gives definitive lines
            headStyles: {
                fillColor: [20, 20, 20], // Almost black
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 9,
                cellPadding: 6,
                halign: 'center'
            },
            bodyStyles: {
                fontSize: 9,
                cellPadding: 6,
                textColor: [0, 0, 0],
                lineColor: [200, 200, 200]
            },
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' },
                1: { cellWidth: 'auto' },
                2: { cellWidth: 25, halign: 'center' },
                3: { cellWidth: 35, halign: 'right' },
                4: { cellWidth: 35, halign: 'right' }
            },
            alternateRowStyles: {
                fillColor: [248, 248, 248]
            },
            tableLineColor: [200, 200, 200],
            tableLineWidth: 0.1
        });

        // @ts-ignore
        const finalY = doc.lastAutoTable.finalY + 10;

        // === TOTALS SECTION ===
        const totalsWidth = 70;
        const totalsX = pageWidth - totalsWidth - 14;

        // Background for totals
        doc.setFillColor(250, 250, 250);
        doc.rect(totalsX - 5, finalY - 5, totalsWidth + 5, 40, 'F');

        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text('Subtotal:', totalsX, finalY);
        doc.setTextColor(0, 0, 0);
        doc.text(formatPrice(subtotal), pageWidth - 14, finalY, { align: 'right' });

        let currentY = finalY;

        // Discount
        if (discountAmount > 0) {
            currentY += 6;
            doc.setTextColor(80, 80, 80);
            doc.text(`Discount${discountType === 'percentage' ? ` (${discount}%)` : ''}:`, totalsX, currentY);
            doc.setTextColor(0, 0, 0);
            doc.text(`-${formatPrice(discountAmount)}`, pageWidth - 14, currentY, { align: 'right' });
        }

        // Total Line
        currentY += 8;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(totalsX, currentY, pageWidth - 14, currentY);

        // Grand Total
        currentY += 8;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('TOTAL:', totalsX, currentY);
        doc.text(formatPrice(total), pageWidth - 14, currentY, { align: 'right' });

        // Double underline for total
        doc.setLineWidth(0.5);
        doc.line(pageWidth - 50, currentY + 2, pageWidth - 14, currentY + 2);
        doc.line(pageWidth - 50, currentY + 4, pageWidth - 14, currentY + 4);

        // === NOTES SECTION ===
        if (notes) {
            currentY += 20;
            // Notes Box
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.1);
            doc.setFillColor(252, 252, 252);
            doc.rect(14, currentY - 5, pageWidth / 2, 25, 'FD');

            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text('NOTES:', 18, currentY);

            doc.setFont('helvetica', 'normal');
            doc.setTextColor(50, 50, 50);
            const noteLines = doc.splitTextToSize(notes, (pageWidth / 2) - 10);
            doc.text(noteLines, 18, currentY + 5);
        }

        // === FOOTER ===
        const footerY = pageHeight - 20;
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.1);
        doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);

        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' });
        doc.text('This quotation is valid for 30 days from the date of issue.', pageWidth / 2, footerY + 5, { align: 'center' });

        // Custom items note
        if (cart.some(item => item.isCustom)) {
            doc.setFontSize(7);
            doc.text('* Custom item', 14, pageHeight - 10);
        }

        return doc;
    }, [cart, customerInfo, subtotal, discountAmount, discountType, discount, total, notes]);

    // Download PDF
    const downloadPDF = () => {
        if (cart.length === 0) {
            toast.error('Cart is empty');
            return;
        }
        const quotationNumber = `QT-${Date.now().toString(36).toUpperCase()}`;
        const doc = generatePDF(quotationNumber);
        doc.save(`Quotation-${quotationNumber}.pdf`);
        toast.success('Quotation downloaded!');
    };

    // Print directly
    const printQuotation = () => {
        if (cart.length === 0) {
            toast.error('Cart is empty');
            return;
        }
        const quotationNumber = `QT-${Date.now().toString(36).toUpperCase()}`;
        const doc = generatePDF(quotationNumber);
        doc.autoPrint();
        window.open(doc.output('bloburl'), '_blank');
    };

    // Save quotation to database
    const saveQuotation = async () => {
        if (cart.length === 0) {
            toast.error('Cart is empty');
            return;
        }
        if (!customerInfo.name) {
            toast.error('Customer name is required');
            return;
        }

        try {
            const res = await fetch('/api/admin/quotations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: customerInfo.name,
                    customerEmail: customerInfo.email,
                    customerPhone: customerInfo.phone,
                    customerAddress: customerInfo.address,
                    items: cart.map(item => ({
                        productId: item.productId,
                        productName: item.name,
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.price,
                        totalPrice: item.price * item.quantity,
                        isCustomItem: item.isCustom
                    })),
                    subtotal,
                    discount: discountAmount,
                    discountType,
                    totalAmount: total,
                    notes
                })
            });

            if (res.ok) {
                const data = await res.json();
                setSavedQuotationId(data.quotationNumber);
                setShowSuccessModal(true);
                clearCart();
            } else {
                toast.error('Failed to save quotation');
            }
        } catch (error) {
            toast.error('Error saving quotation');
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-background dark:bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black">
            {/* Header */}
            <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-40">
                <div className="max-w-[1800px] mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                                <Receipt className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Point of Sale</h1>
                                <p className="text-sm text-gray-500 dark:text-zinc-400">Create quotations and orders</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/admin/quotations"
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                                <FileText className="w-4 h-4" />
                                <span className="hidden sm:inline">View Quotations</span>
                            </Link>
                            <button
                                onClick={printQuotation}
                                disabled={cart.length === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
                            >
                                <Printer className="w-4 h-4" />
                                <span className="hidden sm:inline">Print</span>
                            </button>
                            <button
                                onClick={downloadPDF}
                                disabled={cart.length === 0}
                                className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">Download</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1800px] mx-auto p-4 lg:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Products Section */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Search & Filters */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-gray-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:text-white"
                                    />
                                </div>
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="pl-10 pr-8 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer dark:text-white min-w-[150px]"
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-gray-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-semibold text-gray-900 dark:text-white">Products</h2>
                                <span className="text-sm text-gray-500 dark:text-zinc-400">{filteredProducts.length} items</span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-2">
                                {filteredProducts.map(product => (
                                    <button
                                        key={product.id}
                                        onClick={() => addToCart(product)}
                                        className="group bg-gray-50 dark:bg-zinc-800 rounded-xl p-3 text-left hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:ring-2 hover:ring-primary-500 transition-all"
                                    >
                                        <div className="aspect-square relative rounded-lg overflow-hidden mb-2 bg-gray-100 dark:bg-zinc-700">
                                            {product.images[0] ? (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-8 h-8 text-gray-300 dark:text-zinc-500" />
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate">{product.name}</h3>
                                        <p className="text-xs text-gray-500 dark:text-zinc-400 truncate">{product.category}</p>
                                        <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mt-1">{formatPrice(product.price)}</p>
                                    </button>
                                ))}
                            </div>

                            {filteredProducts.length === 0 && (
                                <div className="text-center py-12 text-gray-500 dark:text-zinc-400">
                                    <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                    <p>No products found</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cart Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm sticky top-24 overflow-hidden">
                            {/* Cart Header */}
                            <div className="p-4 border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <ShoppingCart className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                        <h2 className="font-semibold text-gray-900 dark:text-white">Cart</h2>
                                        {cart.length > 0 && (
                                            <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold px-2 py-0.5 rounded-full">
                                                {cart.length}
                                            </span>
                                        )}
                                    </div>
                                    {cart.length > 0 && (
                                        <button
                                            onClick={clearCart}
                                            className="text-sm text-red-500 hover:text-red-600 transition-colors"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Quick Add Custom Item */}
                            <div className="p-3 border-b border-gray-200 dark:border-zinc-800 bg-amber-50 dark:bg-amber-900/10">
                                <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-2">+ Quick Add Custom Item</p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Item name"
                                        value={quickCustomName}
                                        onChange={(e) => setQuickCustomName(e.target.value)}
                                        className="flex-1 px-2 py-1.5 bg-white dark:bg-zinc-800 border border-amber-200 dark:border-amber-800 rounded-lg text-sm focus:ring-1 focus:ring-amber-500 dark:text-white"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={quickCustomPrice || ''}
                                        onChange={(e) => setQuickCustomPrice(parseFloat(e.target.value) || 0)}
                                        className="w-24 px-2 py-1.5 bg-white dark:bg-zinc-800 border border-amber-200 dark:border-amber-800 rounded-lg text-sm focus:ring-1 focus:ring-amber-500 dark:text-white"
                                    />
                                    <button
                                        onClick={addQuickCustomItem}
                                        className="px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Cart Items */}
                            <div className="max-h-[280px] overflow-y-auto">
                                {cart.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500 dark:text-zinc-400">
                                        <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                        <p>Your cart is empty</p>
                                        <p className="text-sm">Add products to get started</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-gray-100 dark:divide-zinc-800">
                                        {cart.map(item => (
                                            <div key={item.id} className="p-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 flex-shrink-0 overflow-hidden">
                                                        {item.image ? (
                                                            <Image
                                                                src={item.image}
                                                                alt={item.name}
                                                                width={40}
                                                                height={40}
                                                                className="object-cover w-full h-full"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package className="w-4 h-4 text-gray-300 dark:text-zinc-600" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                                            {item.name}
                                                            {item.isCustom && (
                                                                <span className="ml-1 text-xs text-amber-600 dark:text-amber-400">*</span>
                                                            )}
                                                        </h4>
                                                        {/* Editable Price */}
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            {editingPriceId === item.id ? (
                                                                <input
                                                                    type="number"
                                                                    defaultValue={item.price}
                                                                    onBlur={(e) => updatePrice(item.id, parseFloat(e.target.value) || item.price)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') {
                                                                            updatePrice(item.id, parseFloat((e.target as HTMLInputElement).value) || item.price);
                                                                        }
                                                                    }}
                                                                    autoFocus
                                                                    className="w-20 px-1 py-0.5 text-sm bg-white dark:bg-zinc-700 border border-primary-500 rounded focus:outline-none dark:text-white"
                                                                />
                                                            ) : (
                                                                <>
                                                                    <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                                                        {formatPrice(item.price)}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => setEditingPriceId(item.id)}
                                                                        className="p-0.5 text-gray-400 hover:text-primary-600 transition-colors"
                                                                        title="Edit price"
                                                                    >
                                                                        <Edit2 className="w-3 h-3" />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            className="w-6 h-6 rounded bg-gray-100 dark:bg-zinc-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="w-6 text-center text-sm font-medium text-gray-900 dark:text-white">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            className="w-6 h-6 rounded bg-gray-100 dark:bg-zinc-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-zinc-600 transition-colors"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="w-6 h-6 rounded bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors ml-1"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                                {/* Item Total */}
                                                <div className="flex justify-end mt-1">
                                                    <span className="text-xs text-gray-500 dark:text-zinc-400">
                                                        = {formatPrice(item.price * item.quantity)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Customer Info */}
                            {cart.length > 0 && (
                                <div className="p-4 border-t border-gray-200 dark:border-zinc-800 space-y-3">
                                    <h3 className="font-medium text-sm text-gray-700 dark:text-zinc-300 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Customer Details
                                    </h3>
                                    <input
                                        type="text"
                                        placeholder="Customer Name *"
                                        value={customerInfo.name}
                                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="tel"
                                            placeholder="Phone"
                                            value={customerInfo.phone}
                                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                                            className="px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={customerInfo.email}
                                            onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                                            className="px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                                        />
                                    </div>
                                    <textarea
                                        placeholder="Address"
                                        value={customerInfo.address}
                                        onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                                        rows={2}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 resize-none dark:text-white"
                                    />
                                </div>
                            )}

                            {/* Discount & Notes */}
                            {cart.length > 0 && (
                                <div className="p-4 border-t border-gray-200 dark:border-zinc-800 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                placeholder="Discount"
                                                value={discount || ''}
                                                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                                            />
                                        </div>
                                        <select
                                            value={discountType}
                                            onChange={(e) => setDiscountType(e.target.value as 'fixed' | 'percentage')}
                                            className="px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 dark:text-white"
                                        >
                                            <option value="fixed">LKR</option>
                                            <option value="percentage">%</option>
                                        </select>
                                    </div>
                                    <textarea
                                        placeholder="Notes (optional)"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 resize-none dark:text-white"
                                    />
                                </div>
                            )}

                            {/* Totals */}
                            {cart.length > 0 && (
                                <div className="p-4 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-zinc-400">Subtotal</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-zinc-400">
                                                Discount {discountType === 'percentage' && `(${discount}%)`}
                                            </span>
                                            <span className="font-medium text-red-500">-{formatPrice(discountAmount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-zinc-700">
                                        <span className="text-gray-900 dark:text-white">Total</span>
                                        <span className="text-primary-600 dark:text-primary-400">{formatPrice(total)}</span>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            {cart.length > 0 && (
                                <div className="p-4 border-t border-gray-200 dark:border-zinc-800 space-y-2">
                                    <button
                                        onClick={saveQuotation}
                                        disabled={!customerInfo.name}
                                        className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <FileText className="w-5 h-5" />
                                        Save Quotation
                                    </button>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={printQuotation}
                                            className="py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Printer className="w-4 h-4" />
                                            Print
                                        </button>
                                        <button
                                            onClick={downloadPDF}
                                            className="py-2.5 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            PDF
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full shadow-2xl text-center p-8">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Quotation Saved!</h3>
                        <p className="text-gray-500 dark:text-zinc-400 mb-2">Your quotation has been saved successfully.</p>
                        <p className="text-sm font-mono bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg inline-block text-primary-600 dark:text-primary-400 mb-6">
                            {savedQuotationId}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="flex-1 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                                Create Another
                            </button>
                            <Link
                                href="/admin/quotations"
                                className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <ExternalLink className="w-4 h-4" />
                                View All
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
