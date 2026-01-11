'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductGalleryProps {
    images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(images[0]);

    if (!images || images.length === 0) {
        return (
            <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400">
                No Image
            </div>
        );
    }

    return (
        <div className="flex flex-col-reverse gap-4">
            {/* Thumbnails */}
            <div className="hidden sm:grid grid-cols-4 gap-4 w-full">
                {images.map((image, i) => (
                    <button
                        key={i}
                        className={`relative aspect-square rounded-md overflow-hidden bg-white border-2 transition-all ${selectedImage === image ? 'border-black' : 'border-transparent'
                            }`}
                        onClick={() => setSelectedImage(image)}
                    >
                        <Image
                            src={image}
                            alt={`Spec ${i}`}
                            fill
                            className="object-cover object-center"
                        />
                    </button>
                ))}
            </div>

            {/* Main Image */}
            <div className="aspect-square w-full relative rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                <Image
                    src={selectedImage}
                    alt="Product image"
                    fill
                    className="object-cover object-center"
                    priority
                />
            </div>
        </div>
    );
}
