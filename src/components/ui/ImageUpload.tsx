'use client';

import { CldUploadWidget } from 'next-cloudinary';
import { ImagePlus, Trash, AlertTriangle } from 'lucide-react';
import { useCallback, useState } from 'react';

interface ImageUploadProps {
    disabled?: boolean;
    onChange: (value: string) => void;
    onRemove: (value: string) => void;
    value: string[];
}

// Safe image preview that uses a plain <img> tag to avoid Next.js
// Image optimization crashing on broken/local /uploads/ paths.
function ImagePreview({ url, onRemove }: { url: string; onRemove: (url: string) => void }) {
    const [broken, setBroken] = useState(false);
    return (
        <div className="relative w-[200px] h-[200px] rounded-md overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="z-10 absolute top-2 right-2">
                <button
                    type="button"
                    onClick={() => onRemove(url)}
                    className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                >
                    <Trash className="h-4 w-4" />
                </button>
            </div>
            {broken ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                    <AlertTriangle className="h-8 w-8 text-amber-400" />
                    <p className="text-xs text-amber-600 text-center px-2">Image unavailable</p>
                </div>
            ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={url}
                    alt="Product"
                    onError={() => setBroken(true)}
                    className="w-full h-full object-cover"
                />
            )}
        </div>
    );
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    disabled,
    onChange,
    onRemove,
    value
}) => {
    const onUpload = useCallback((result: any) => {
        if (result.event === "success") {
            onChange(result.info.secure_url);
        }
    }, [onChange]);

    // Separate valid remote URLs from local-only /uploads/ paths
    const remoteUrls = value.filter(url => !url.startsWith('/uploads/'));
    const localUrls = value.filter(url => url.startsWith('/uploads/'));

    return (
        <div>
            {localUrls.length > 0 && (
                <div className="mb-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span>
                        {localUrls.length} image(s) were uploaded locally and are not available in the deployed app.
                        Please remove them and re-upload via Cloudinary.
                    </span>
                </div>
            )}
            <div className="mb-4 flex items-center gap-4 flex-wrap">
                {/* Render safe remote images (Cloudinary / Unsplash) */}
                {remoteUrls.map((url) => (
                    <ImagePreview key={url} url={url} onRemove={onRemove} />
                ))}
                {/* Show local-only images as broken placeholders so admin can remove them */}
                {localUrls.map((url) => (
                    <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden border-2 border-dashed border-amber-300 bg-amber-50 flex flex-col items-center justify-center gap-2 flex-shrink-0">
                        <div className="z-10 absolute top-2 right-2">
                            <button
                                type="button"
                                onClick={() => onRemove(url)}
                                className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                            >
                                <Trash className="h-4 w-4" />
                            </button>
                        </div>
                        <AlertTriangle className="h-8 w-8 text-amber-400" />
                        <p className="text-xs text-amber-600 text-center px-2">Local image only</p>
                        <p className="text-[10px] text-amber-400 text-center px-3 break-all">{url.split('/').pop()}</p>
                    </div>
                ))}
            </div>
            <CldUploadWidget
                onSuccess={onUpload}
                uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
                options={{
                    maxFiles: 5
                }}
            >
                {({ open }) => {
                    const onClick = () => {
                        open();
                    };

                    return (
                        <button
                            type="button"
                            disabled={disabled}
                            onClick={onClick}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors border border-gray-300"
                        >
                            <ImagePlus className="h-4 w-4" />
                            Upload an Image
                        </button>
                    );
                }}
            </CldUploadWidget>
        </div>
    );
}

export default ImageUpload;
