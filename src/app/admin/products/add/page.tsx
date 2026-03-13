'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import ImageUpload from '@/components/ui/ImageUpload';
import { Plus, X, Trash2 } from 'lucide-react';

interface VariantField {
    name: string;
    values: string; // Comma separated for input, converted to array for submission
}

interface Category {
    id: string;
    name: string;
}

export default function AddProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        type: 'RETAIL',
        images: [] as string[]
    });

    const [variants, setVariants] = useState<VariantField[]>([]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories');
            const data = await res.json();
            setCategories(data);
            if (data.length > 0 && !formData.category) {
                setFormData(prev => ({ ...prev, category: data[0].name }));
            }
        } catch (error) {
            toast.error("Failed to load categories");
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName) return;
        try {
            setLoading(true);
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newCategoryName })
            });
            if (!res.ok) throw new Error();
            toast.success("Category added");
            setNewCategoryName('');
            setShowNewCategoryInput(false);
            fetchCategories();
        } catch {
            toast.error("Failed to add category");
        } finally {
            setLoading(false);
        }
    };

    const addVariant = () => {
        setVariants([...variants, { name: '', values: '' }]);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const updateVariant = (index: number, field: keyof VariantField, value: string) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Process variants into JSON structure
        // { "Size": ["S", "M"], "Color": ["Red"] }
        const variantsJson: Record<string, string[]> = {};
        variants.forEach(v => {
            if (v.name && v.values) {
                variantsJson[v.name] = v.values.split(',').map(s => s.trim()).filter(Boolean);
            }
        });

        try {
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock),
                    variants: variantsJson
                }),
            });

            if (!response.ok) throw new Error('Failed to create product');

            toast.success('Product created successfully');
            router.refresh();
            router.push('/admin/products');
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold mb-8">Add New Product</h1>

            <form onSubmit={onSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow border border-gray-100">

                {/* Images */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Product Images</label>
                    <ImageUpload
                        value={formData.images}
                        disabled={loading}
                        onChange={(url) => setFormData(prev => ({ ...prev, images: [...prev.images, url] }))}
                        onRemove={(url) => setFormData(prev => ({ ...prev, images: prev.images.filter((current) => current !== url) }))}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Product Name</label>
                        <input
                            type="text"
                            required
                            disabled={loading}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
                            placeholder="e.g. Modern Faucet"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <div className="flex gap-2">
                            {!showNewCategoryInput ? (
                                <>
                                    <select
                                        disabled={loading}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.name}>
                                                {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewCategoryInput(true)}
                                        className="mt-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                        title="Add New Category"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </>
                            ) : (
                                <div className="flex gap-2 w-full mt-1">
                                    <input
                                        type="text"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
                                        placeholder="New Category Name"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleCreateCategory}
                                        className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        Add
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowNewCategoryInput(false)}
                                        className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Price (LKR)</label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            disabled={loading}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                        <input
                            type="number"
                            required
                            min="0"
                            disabled={loading}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
                            placeholder="0"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Product Type</label>
                        <select
                            disabled={loading}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="RETAIL">Retail Only</option>
                            <option value="WHOLESALE">Wholesale Only</option>
                            <option value="BOTH">Both Retail & Wholesale</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        required
                        rows={4}
                        disabled={loading}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-2 border"
                        placeholder="Product details..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                {/* Dynamic Variants Section */}
                <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Variables / Variants</h3>
                        <button
                            type="button"
                            onClick={addVariant}
                            className="text-sm bg-secondary-50 text-secondary-700 px-3 py-1 rounded-full border border-secondary-200 hover:bg-secondary-100 flex items-center gap-1"
                        >
                            <Plus size={14} /> Add Field
                        </button>
                    </div>

                    <div className="space-y-4">
                        {variants.length === 0 && (
                            <p className="text-sm text-gray-500 italic">No custom fields added (e.g. Size, Color, Voltage)</p>
                        )}

                        {variants.map((variant, index) => (
                            <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-md">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Field Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Size"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-1.5 border"
                                        value={variant.name}
                                        onChange={(e) => updateVariant(index, 'name', e.target.value)}
                                    />
                                </div>
                                <div className="flex-[2]">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Values (comma separated)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Small, Medium, Large"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-3 py-1.5 border"
                                        value={variant.values}
                                        onChange={(e) => updateVariant(index, 'values', e.target.value)}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeVariant(index)}
                                    className="mt-6 text-red-500 hover:text-red-700 p-1"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t">
                    <button
                        type="button"
                        disabled={loading}
                        onClick={() => router.back()}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}
