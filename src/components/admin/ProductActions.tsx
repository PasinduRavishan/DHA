'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Edit } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ProductActionsProps {
    productId: string;
}

export default function ProductActions({ productId }: ProductActionsProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const onDelete = async () => {
        try {
            setLoading(true);
            await fetch(`/api/products/${productId}`, {
                method: 'DELETE',
            });
            toast.success('Product deleted');
            router.refresh();
            router.push('/admin/products');
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
            setShowConfirm(false);
        }
    };

    return (
        <>
            <div className="flex gap-2">
                <button
                    onClick={() => router.push(`/admin/products/${productId}/edit`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition flex items-center gap-2"
                >
                    <Edit size={16} />
                    Edit
                </button>
                <button
                    onClick={() => setShowConfirm(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition flex items-center gap-2"
                >
                    <Trash2 size={16} />
                    Delete
                </button>
            </div>

            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
                        <h3 className="text-lg font-bold mb-2">Delete Product?</h3>
                        <p className="text-gray-500 mb-6">
                            Are you sure you want to delete this product? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                disabled={loading}
                                className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={onDelete}
                                disabled={loading}
                                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                            >
                                {loading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
