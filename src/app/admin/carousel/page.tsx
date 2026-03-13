'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, Save, X, Upload } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { CldUploadWidget } from 'next-cloudinary';

interface CarouselSlide {
    id: string;
    pageType: 'RETAIL' | 'WHOLESALE';
    title: string;
    subtitle?: string | null;
    description?: string | null;
    imageUrl: string;
    order: number;
    isActive: boolean;
}

export default function CarouselManager() {
    const [slides, setSlides] = useState<CarouselSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [selectedPage, setSelectedPage] = useState<'RETAIL' | 'WHOLESALE'>('RETAIL');

    const [formData, setFormData] = useState({
        pageType: 'RETAIL' as 'RETAIL' | 'WHOLESALE',
        title: '',
        subtitle: '',
        description: '',
        imageUrl: '',
        order: 0
    });

    useEffect(() => {
        fetchSlides();
    }, []);

    const fetchSlides = async () => {
        try {
            const res = await fetch('/api/carousel');
            if (res.ok) {
                const data = await res.json();
                setSlides(Array.isArray(data) ? data : []);
            } else {
                console.error('Failed to fetch slides');
                setSlides([]);
            }
        } catch (error) {
            console.error('Error fetching slides:', error);
            setSlides([]);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (result: any) => {
        if (result.event === 'success') {
            setFormData(prev => ({ ...prev, imageUrl: result.info.secure_url }));
            toast.success('Image uploaded successfully');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.imageUrl) {
            toast.error('Please upload an image');
            return;
        }

        try {
            if (editingSlide) {
                // Update
                const res = await fetch('/api/carousel', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editingSlide.id, ...formData })
                });

                if (res.ok) {
                    toast.success('Slide updated successfully');
                    fetchSlides();
                    resetForm();
                } else {
                    const error = await res.json();
                    toast.error(error.error || 'Failed to update slide');
                }
            } else {
                // Create
                const res = await fetch('/api/carousel', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (res.ok) {
                    toast.success('Slide created successfully');
                    fetchSlides();
                    resetForm();
                } else {
                    const error = await res.json();
                    toast.error(error.error || 'Failed to create slide');
                }
            }
        } catch (error) {
            toast.error('Failed to save slide');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this slide?')) return;

        try {
            const res = await fetch(`/api/carousel?id=${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success('Slide deleted successfully');
                fetchSlides();
            } else {
                toast.error('Failed to delete slide');
            }
        } catch (error) {
            toast.error('Failed to delete slide');
        }
    };

    const toggleActive = async (slide: CarouselSlide) => {
        try {
            const res = await fetch('/api/carousel', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: slide.id, isActive: !slide.isActive })
            });

            if (res.ok) {
                toast.success(`Slide ${!slide.isActive ? 'activated' : 'deactivated'}`);
                fetchSlides();
            } else {
                toast.error('Failed to update slide');
            }
        } catch (error) {
            toast.error('Failed to update slide');
        }
    };

    const resetForm = () => {
        setFormData({
            pageType: selectedPage,
            title: '',
            subtitle: '',
            description: '',
            imageUrl: '',
            order: 0
        });
        setEditingSlide(null);
        setIsCreating(false);
    };

    const startEdit = (slide: CarouselSlide) => {
        setFormData({
            pageType: slide.pageType,
            title: slide.title,
            subtitle: slide.subtitle || '',
            description: slide.description || '',
            imageUrl: slide.imageUrl,
            order: slide.order
        });
        setEditingSlide(slide);
        setIsCreating(true);
    };

    const filteredSlides = slides.filter(s => s.pageType === selectedPage);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-screen">
                <div className="text-neutral-400 flex items-center gap-2">
                    <div className="h-5 w-5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-white mb-2">Carousel Manager</h1>
                <p className="text-neutral-400">Manage hero carousel slides for retail and wholesale pages</p>
            </div>

            {/* Page Selector */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setSelectedPage('RETAIL')}
                    className={`px-6 py-3 rounded-lg font-bold transition-all ${selectedPage === 'RETAIL'
                            ? 'bg-primary-600 text-white'
                            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                        }`}
                >
                    Retail Page
                </button>
                <button
                    onClick={() => setSelectedPage('WHOLESALE')}
                    className={`px-6 py-3 rounded-lg font-bold transition-all ${selectedPage === 'WHOLESALE'
                            ? 'bg-primary-600 text-white'
                            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                        }`}
                >
                    Wholesale Page
                </button>
            </div>

            {/* Create/Edit Form */}
            {isCreating ? (
                <div className="bg-neutral-900 rounded-2xl border border-white/10 p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">
                            {editingSlide ? 'Edit Slide' : 'Create New Slide'}
                        </h2>
                        <button
                            onClick={resetForm}
                            className="p-2 text-neutral-400 hover:text-white transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">
                                    Page Type
                                </label>
                                <select
                                    value={formData.pageType}
                                    onChange={(e) => setFormData({ ...formData, pageType: e.target.value as any })}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                                    required
                                >
                                    <option value="RETAIL">Retail</option>
                                    <option value="WHOLESALE">Wholesale</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                                    required
                                    min="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                                placeholder="Main heading"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">
                                Subtitle
                            </label>
                            <input
                                type="text"
                                value={formData.subtitle}
                                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                                className="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500"
                                placeholder="Small badge text (optional)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">
                                Description
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500 h-24 resize-none"
                                placeholder="Supporting text (optional)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-2">
                                Background Image *
                            </label>
                            <div className="space-y-4">
                                <CldUploadWidget
                                    onSuccess={handleImageUpload}
                                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                                    options={{
                                        maxFiles: 1,
                                        resourceType: 'image',
                                        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
                                        maxFileSize: 5000000, // 5MB
                                    }}
                                >
                                    {({ open }) => (
                                        <button
                                            type="button"
                                            onClick={() => open()}
                                            className="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-lg text-white hover:bg-neutral-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Upload className="h-5 w-5" />
                                            {formData.imageUrl ? 'Change Image' : 'Upload Image'}
                                        </button>
                                    )}
                                </CldUploadWidget>
                                <p className="text-xs text-neutral-500">
                                    Recommended: 1920x1080px or larger. Max 5MB. JPG, PNG, or WebP.
                                </p>
                            </div>
                        </div>

                        {formData.imageUrl && (
                            <div className="relative h-64 rounded-lg overflow-hidden border border-white/10">
                                <Image
                                    src={formData.imageUrl}
                                    alt="Preview"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute top-2 right-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, imageUrl: '' })}
                                        className="p-2 bg-black/50 hover:bg-red-500 text-white rounded-lg transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={!formData.imageUrl}
                                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save className="h-5 w-5" />
                                {editingSlide ? 'Update Slide' : 'Create Slide'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-3 bg-neutral-800 text-neutral-300 rounded-lg font-bold hover:bg-neutral-700 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <button
                    onClick={() => {
                        setFormData({ ...formData, pageType: selectedPage });
                        setIsCreating(true);
                    }}
                    className="mb-8 px-6 py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-500 transition-colors flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    Add New Slide
                </button>
            )}

            {/* Slides List */}
            <div className="space-y-4">
                {filteredSlides.length === 0 ? (
                    <div className="bg-neutral-900 rounded-2xl border border-white/10 p-12 text-center">
                        <p className="text-neutral-400 text-lg mb-4">
                            No slides yet for {selectedPage.toLowerCase()} page.
                        </p>
                        <p className="text-neutral-500 text-sm">
                            Click "Add New Slide" to create your first carousel slide!
                        </p>
                    </div>
                ) : (
                    filteredSlides
                        .sort((a, b) => a.order - b.order)
                        .map((slide) => (
                            <div
                                key={slide.id}
                                className={`bg-neutral-900 rounded-2xl border border-white/10 p-6 flex gap-6 transition-all ${!slide.isActive && 'opacity-50'
                                    }`}
                            >
                                <div className="flex items-center text-neutral-600">
                                    <GripVertical className="h-6 w-6" />
                                </div>

                                <div className="relative w-48 h-32 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                                    <Image
                                        src={slide.imageUrl}
                                        alt={slide.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>

                                <div className="flex-1">
                                    {slide.subtitle && (
                                        <span className="inline-block px-2 py-1 rounded bg-primary-500/20 text-primary-400 text-xs font-bold mb-2">
                                            {slide.subtitle}
                                        </span>
                                    )}
                                    <h3 className="text-xl font-bold text-white mb-2">{slide.title}</h3>
                                    {slide.description && (
                                        <p className="text-neutral-400 text-sm line-clamp-2">{slide.description}</p>
                                    )}
                                    <div className="mt-2 text-xs text-neutral-500">Order: {slide.order}</div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleActive(slide)}
                                        className="p-2 text-neutral-400 hover:text-white transition-colors"
                                        title={slide.isActive ? 'Deactivate' : 'Activate'}
                                    >
                                        {slide.isActive ? (
                                            <Eye className="h-5 w-5" />
                                        ) : (
                                            <EyeOff className="h-5 w-5" />
                                        )}
                                    </button>
                                    <button
                                        onClick={() => startEdit(slide)}
                                        className="p-2 text-neutral-400 hover:text-primary-500 transition-colors"
                                        title="Edit"
                                    >
                                        <Edit className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(slide.id)}
                                        className="p-2 text-neutral-400 hover:text-red-500 transition-colors"
                                        title="Delete"
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
