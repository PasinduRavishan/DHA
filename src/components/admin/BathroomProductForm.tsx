'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Upload, X, Plus, Save, Info, Check } from 'lucide-react';
import Image from 'next/image';

interface Category {
    id: string;
    name: string;
}

interface BathroomProductFormProps {
    categories: Category[];
}

export default function BathroomProductForm({ categories: initialCategories }: BathroomProductFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [customCategory, setCustomCategory] = useState('');
    const [isCustomCategory, setIsCustomCategory] = useState(false);
    const [price, setPrice] = useState<string>('');
    const [isPOA, setIsPOA] = useState(false); // Price on Application
    const [stock, setStock] = useState('1');
    const [images, setImages] = useState<string[]>([]);
    const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
        { key: 'Material', value: '' },
        { key: 'Finish', value: '' }
    ]);

    // Image Upload Handler
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        const files = Array.from(e.target.files);
        const uploadPromises = files.map(async (file) => {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!res.ok) throw new Error('Upload failed');
                const data = await res.json();
                return data.url;
            } catch (error) {
                console.error('Upload error:', error);
                toast.error(`Failed to upload ${file.name}`);
                return null;
            }
        });

        setIsLoading(true);
        try {
            const uploadedUrls = await Promise.all(uploadPromises);
            const validUrls = uploadedUrls.filter((url): url is string => url !== null);
            setImages(prev => [...prev, ...validUrls]);
        } finally {
            setIsLoading(false);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    // Specs Handler
    const addSpec = () => {
        setSpecs(prev => [...prev, { key: '', value: '' }]);
    };

    const updateSpec = (index: number, field: 'key' | 'value', val: string) => {
        const newSpecs = [...specs];
        newSpecs[index][field] = val;
        setSpecs(newSpecs);
    };

    const removeSpec = (index: number) => {
        setSpecs(prev => prev.filter((_, i) => i !== index));
    };

    // Submit Handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const finalCategory = isCustomCategory ? customCategory : category;
        if (!finalCategory) {
            toast.error("Please select or enter a category");
            setIsLoading(false);
            return;
        }

        const productData = {
            name,
            description,
            category: finalCategory,
            price: isPOA ? 0 : parseFloat(price),
            stock: parseInt(stock),
            images,
            type: 'BATHROOM',
            variants: {
                specs: specs.filter(s => s.key && s.value) // Store as JSON specs
            }
        };

        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData)
            });

            if (res.ok) {
                toast.success('Bathroom fitting added successfully!');
                router.push('/admin/bathroom-fittings/add'); // Refresh or go somewhere
                // Reset form
                setName('');
                setDescription('');
                setImages([]);
                setSpecs([{ key: 'Material', value: '' }, { key: 'Finish', value: '' }]);
            } else {
                toast.error('Failed to create product');
            }
        } catch (error) {
            toast.error('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-secondary-100 dark:border-zinc-800">
                <h3 className="text-xl font-bold mb-6 text-foreground dark:text-white flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary-500" />
                    Essential Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-secondary-700 dark:text-zinc-400 mb-2">Product Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full px-4 py-3 bg-secondary-50 dark:bg-black border border-secondary-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                                placeholder="ex: Luxury Rainfall Shower Head"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-secondary-700 dark:text-zinc-400 mb-2">Category</label>
                            <div className="flex gap-2">
                                {!isCustomCategory ? (
                                    <select
                                        value={category}
                                        onChange={e => {
                                            if (e.target.value === 'NEW') setIsCustomCategory(true);
                                            else setCategory(e.target.value);
                                        }}
                                        className="flex-1 px-4 py-3 bg-secondary-50 dark:bg-black border border-secondary-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                                    >
                                        <option value="">Select Category</option>
                                        {initialCategories.map(c => (
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        ))}
                                        <option value="NEW" className="font-bold text-primary-600">+ Add New Category</option>
                                    </select>
                                ) : (
                                    <div className="flex-1 flex gap-2">
                                        <input
                                            type="text"
                                            value={customCategory}
                                            onChange={e => setCustomCategory(e.target.value)}
                                            placeholder="Enter new category name"
                                            className="flex-1 px-4 py-3 bg-secondary-50 dark:bg-black border border-secondary-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setIsCustomCategory(false)}
                                            className="p-3 bg-secondary-200 dark:bg-zinc-800 rounded-xl hover:bg-secondary-300 transition-colors"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-secondary-700 dark:text-zinc-400 mb-2">Price (LKR)</label>
                                <input
                                    type="number"
                                    disabled={isPOA}
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    className="w-full px-4 py-3 bg-secondary-50 dark:bg-black border border-secondary-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder={isPOA ? "Contact for Price" : "0.00"}
                                />
                            </div>
                            <div className="flex items-end pb-3">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={isPOA}
                                        onChange={e => setIsPOA(e.target.checked)}
                                        className="w-5 h-5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-sm font-bold text-secondary-600 dark:text-zinc-400">POA</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-secondary-700 dark:text-zinc-400 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={8}
                            className="w-full px-4 py-3 bg-secondary-50 dark:bg-black border border-secondary-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                            placeholder="Detailed description of the product..."
                        />
                    </div>
                </div>
            </div>

            {/* Gallery Section */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-secondary-100 dark:border-zinc-800">
                <h3 className="text-xl font-bold mb-6 text-foreground dark:text-white flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary-500" />
                    Image Gallery
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {images.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-secondary-200 dark:border-zinc-800 group">
                            <Image src={url} alt="Product" fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    <label className="relative aspect-square rounded-xl border-2 border-dashed border-secondary-300 dark:border-zinc-700 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group">
                        <Upload className="h-8 w-8 text-secondary-400 group-hover:text-primary-500 mb-2 transition-colors" />
                        <span className="text-xs font-bold text-secondary-500 group-hover:text-primary-500">Upload</span>
                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                </div>
            </div>

            {/* Specs Section */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-xl border border-secondary-100 dark:border-zinc-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-foreground dark:text-white flex items-center gap-2">
                        <Check className="h-5 w-5 text-primary-500" />
                        Technical Specifications & Facts
                    </h3>
                    <button
                        type="button"
                        onClick={addSpec}
                        className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                        <Plus className="h-4 w-4" />
                        Add Spec
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {specs.map((spec, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Property (e.g. Finish)"
                                value={spec.key}
                                onChange={e => updateSpec(idx, 'key', e.target.value)}
                                className="flex-1 px-4 py-2 bg-secondary-50 dark:bg-black border border-secondary-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            />
                            <input
                                type="text"
                                placeholder="Value (e.g. Matte Black)"
                                value={spec.value}
                                onChange={e => updateSpec(idx, 'value', e.target.value)}
                                className="flex-1 px-4 py-2 bg-secondary-50 dark:bg-black border border-secondary-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => removeSpec(idx)}
                                className="p-2 text-secondary-400 hover:text-red-500"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Saving...' : (
                        <>
                            <Save className="h-5 w-5" />
                            Save Product
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
