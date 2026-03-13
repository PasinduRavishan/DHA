'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Search, FileText, Download, Eye, Clock, Calendar,
    User, ChevronDown, Filter, Plus, Receipt, CheckCircle, XCircle, Clock3
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatPrice } from '@/lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface QuotationItem {
    id: string;
    productId?: string;
    productName: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    isCustomItem: boolean;
}

interface Quotation {
    id: string;
    quotationNumber: string;
    customerName: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
    items: QuotationItem[];
    subtotal: number;
    discount: number;
    discountType: string;
    totalAmount: number;
    notes?: string;
    validUntil?: string;
    status: string;
    createdAt: string;
}

const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
    DRAFT: { bg: 'bg-gray-100 dark:bg-zinc-800', text: 'text-gray-600 dark:text-zinc-400', icon: FileText },
    SENT: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', icon: Clock3 },
    ACCEPTED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-400', icon: CheckCircle },
    REJECTED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', icon: XCircle },
    EXPIRED: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', icon: Clock }
};

export default function QuotationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

    // Redirect if not admin
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
            router.push('/');
        }
    }, [status, session, router]);

    // Fetch quotations
    useEffect(() => {
        const fetchQuotations = async () => {
            try {
                const params = new URLSearchParams();
                if (statusFilter !== 'all') params.append('status', statusFilter);
                if (searchQuery) params.append('search', searchQuery);

                const res = await fetch(`/api/admin/quotations?${params}`);
                if (res.ok) {
                    const data = await res.json();
                    setQuotations(data);
                }
            } catch (error) {
                console.error('Failed to fetch quotations');
            } finally {
                setLoading(false);
            }
        };
        fetchQuotations();
    }, [statusFilter, searchQuery]);

    // Download PDF with professional Black & White styling
    const downloadPDF = (quotation: Quotation) => {
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
        doc.text(`No: ${quotation.quotationNumber}`, pageWidth - 14, 28, { align: 'right' });
        doc.text(`Date: ${new Date(quotation.createdAt).toLocaleDateString('en-GB')}`, pageWidth - 14, 42, { align: 'right' });
        doc.text(`Time: ${new Date(quotation.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`, pageWidth - 14, 48, { align: 'right' });

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

        doc.setFont('helvetica', 'bold');
        doc.text(quotation.customerName, 18, yPos);
        doc.setFont('helvetica', 'normal');
        yPos += 5;

        doc.setFontSize(9);
        doc.setTextColor(50, 50, 50);
        if (quotation.customerPhone) {
            doc.text(`Tel: ${quotation.customerPhone}`, 18, yPos);
            yPos += 5;
        }
        if (quotation.customerEmail) {
            doc.text(`Email: ${quotation.customerEmail}`, 18, yPos);
            yPos += 5;
        }
        if (quotation.customerAddress) {
            const addressLines = doc.splitTextToSize(quotation.customerAddress, 70);
            doc.text(addressLines, 18, yPos);
        }

        // === ITEMS TABLE ===
        const tableData = quotation.items.map((item, index) => [
            (index + 1).toString(),
            item.productName + (item.isCustomItem ? ' *' : ''),
            item.quantity.toString(),
            formatPrice(item.unitPrice),
            formatPrice(item.totalPrice)
        ]);

        autoTable(doc, {
            startY: 90,
            head: [['#', 'Description', 'Qty', 'Unit Price', 'Amount']],
            body: tableData,
            theme: 'grid',
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
        doc.text(formatPrice(quotation.subtotal), pageWidth - 14, finalY, { align: 'right' });

        let currentY = finalY;

        if (quotation.discount > 0) {
            currentY += 6;
            doc.setTextColor(80, 80, 80);
            doc.text('Discount:', totalsX, currentY);
            doc.setTextColor(0, 0, 0);
            doc.text(`-${formatPrice(quotation.discount)}`, pageWidth - 14, currentY, { align: 'right' });
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
        doc.text(formatPrice(quotation.totalAmount), pageWidth - 14, currentY, { align: 'right' });

        // Double underline for total
        doc.setLineWidth(0.5);
        doc.line(pageWidth - 50, currentY + 2, pageWidth - 14, currentY + 2);
        doc.line(pageWidth - 50, currentY + 4, pageWidth - 14, currentY + 4);

        // === NOTES SECTION ===
        if (quotation.notes) {
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
            const noteLines = doc.splitTextToSize(quotation.notes, (pageWidth / 2) - 10);
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

        if (quotation.items.some(item => item.isCustomItem)) {
            doc.setFontSize(7);
            doc.text('* Custom item', 14, pageHeight - 10);
        }

        doc.save(`Quotation-${quotation.quotationNumber}.pdf`);
        toast.success('Quotation downloaded!');
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
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                                <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Quotations</h1>
                                <p className="text-sm text-gray-500 dark:text-zinc-400">Manage all quotations</p>
                            </div>
                        </div>
                        <Link
                            href="/admin/pos"
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>New Quotation</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-4 lg:p-6">
                {/* Filters */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-gray-200 dark:border-zinc-800 shadow-sm mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search quotations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:text-white"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-10 pr-8 py-3 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer dark:text-white min-w-[150px]"
                            >
                                <option value="all">All Status</option>
                                <option value="DRAFT">Draft</option>
                                <option value="SENT">Sent</option>
                                <option value="ACCEPTED">Accepted</option>
                                <option value="REJECTED">Rejected</option>
                                <option value="EXPIRED">Expired</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Quotations List */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                    {quotations.length === 0 ? (
                        <div className="p-12 text-center">
                            <Receipt className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-zinc-600" />
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No quotations yet</h3>
                            <p className="text-gray-500 dark:text-zinc-400 mb-6">Create your first quotation using the POS system</p>
                            <Link
                                href="/admin/pos"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Create Quotation
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-zinc-800/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Quotation</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Items</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Total</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                                    {quotations.map((quotation) => {
                                        const StatusIcon = statusColors[quotation.status]?.icon || FileText;
                                        return (
                                            <tr key={quotation.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                                            <FileText className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                                        </div>
                                                        <span className="font-medium text-gray-900 dark:text-white">{quotation.quotationNumber}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{quotation.customerName}</p>
                                                        {quotation.customerPhone && (
                                                            <p className="text-sm text-gray-500 dark:text-zinc-400">{quotation.customerPhone}</p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-gray-700 dark:text-zinc-300">{quotation.items.length} items</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-primary-600 dark:text-primary-400">{formatPrice(quotation.totalAmount)}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusColors[quotation.status]?.bg} ${statusColors[quotation.status]?.text}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {quotation.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400">
                                                        <Calendar className="w-4 h-4" />
                                                        <span className="text-sm">{new Date(quotation.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => setSelectedQuotation(quotation)}
                                                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => downloadPDF(quotation)}
                                                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                                            title="Download PDF"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Quotation Detail Modal */}
            {selectedQuotation && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedQuotation.quotationNumber}</h3>
                                <p className="text-sm text-gray-500 dark:text-zinc-400">Created {new Date(selectedQuotation.createdAt).toLocaleDateString()}</p>
                            </div>
                            <button
                                onClick={() => setSelectedQuotation(null)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                                <XCircle className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Customer Info */}
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Customer Details
                                </h4>
                                <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 space-y-2">
                                    <p className="font-medium text-gray-900 dark:text-white">{selectedQuotation.customerName}</p>
                                    {selectedQuotation.customerPhone && <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedQuotation.customerPhone}</p>}
                                    {selectedQuotation.customerEmail && <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedQuotation.customerEmail}</p>}
                                    {selectedQuotation.customerAddress && <p className="text-sm text-gray-500 dark:text-zinc-400">{selectedQuotation.customerAddress}</p>}
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Items</h4>
                                <div className="space-y-2">
                                    {selectedQuotation.items.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {item.productName}
                                                    {item.isCustomItem && <span className="ml-2 text-xs text-amber-600">(Custom)</span>}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-zinc-400">{item.quantity} × {formatPrice(item.unitPrice)}</p>
                                            </div>
                                            <p className="font-semibold text-gray-900 dark:text-white">{formatPrice(item.totalPrice)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Totals */}
                            <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-zinc-400">Subtotal</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{formatPrice(selectedQuotation.subtotal)}</span>
                                </div>
                                {selectedQuotation.discount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-zinc-400">Discount</span>
                                        <span className="font-medium text-red-500">-{formatPrice(selectedQuotation.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-zinc-700">
                                    <span className="text-gray-900 dark:text-white">Total</span>
                                    <span className="text-primary-600 dark:text-primary-400">{formatPrice(selectedQuotation.totalAmount)}</span>
                                </div>
                            </div>

                            {/* Notes */}
                            {selectedQuotation.notes && (
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Notes</h4>
                                    <p className="text-gray-600 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-800 rounded-xl p-4">{selectedQuotation.notes}</p>
                                </div>
                            )}
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-zinc-800 flex gap-3">
                            <button
                                onClick={() => setSelectedQuotation(null)}
                                className="flex-1 py-3 bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => downloadPDF(selectedQuotation)}
                                className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
