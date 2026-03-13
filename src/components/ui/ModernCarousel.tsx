'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CarouselSlide {
    id: string;
    title: string;
    subtitle?: string | null;
    description?: string | null;
    imageUrl: string;
}

interface ModernCarouselProps {
    slides: CarouselSlide[];
    autoPlayInterval?: number;
}

export default function ModernCarousel({ slides, autoPlayInterval = 5000 }: ModernCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [progress, setProgress] = useState(0);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
        setProgress(0);
    }, [slides.length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
        setProgress(0);
    }, [slides.length]);

    const goToSlide = useCallback((index: number) => {
        setCurrentIndex(index);
        setProgress(0);
    }, []);

    useEffect(() => {
        if (!isPlaying || slides.length <= 1) return;

        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    return 0;
                }
                return prev + (100 / (autoPlayInterval / 100));
            });
        }, 100);

        const slideInterval = setInterval(nextSlide, autoPlayInterval);

        return () => {
            clearInterval(progressInterval);
            clearInterval(slideInterval);
        };
    }, [isPlaying, nextSlide, autoPlayInterval, slides.length]);

    if (slides.length === 0) {
        return (
            <div className="relative h-[80vh] flex items-center justify-center bg-neutral-900">
                <p className="text-neutral-500 text-lg">No slides available</p>
            </div>
        );
    }

    return (
        <div className="relative h-[80vh] overflow-hidden group">
            {/* Slides */}
            <div className="relative h-full">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={cn(
                            "absolute inset-0 transition-all duration-1000 ease-in-out",
                            index === currentIndex
                                ? "opacity-100 scale-100"
                                : "opacity-0 scale-105 pointer-events-none"
                        )}
                    >
                        {/* Image with Parallax Effect */}
                        <div className="absolute inset-0 z-0">
                            <Image
                                src={slide.imageUrl}
                                alt={slide.title}
                                fill
                                className="object-cover"
                                priority={index === 0}
                                unoptimized
                            />
                            {/* Gradient Overlays */}
                            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/50 via-transparent to-neutral-950/50" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 h-full flex items-center justify-center">
                            <div className="max-w-5xl mx-auto px-6 text-center">
                                {slide.subtitle && (
                                    <div
                                        className={cn(
                                            "inline-block py-2 px-4 rounded-full bg-primary-500/20 text-primary-400 text-sm font-bold tracking-widest uppercase mb-6 border border-primary-500/30 backdrop-blur-md transition-all duration-1000 delay-200",
                                            index === currentIndex
                                                ? "opacity-100 translate-y-0"
                                                : "opacity-0 translate-y-10"
                                        )}
                                    >
                                        {slide.subtitle}
                                    </div>
                                )}
                                <h1
                                    className={cn(
                                        "text-6xl md:text-8xl font-black mb-6 tracking-tight leading-tight text-white transition-all duration-1000 delay-300",
                                        index === currentIndex
                                            ? "opacity-100 translate-y-0"
                                            : "opacity-0 translate-y-10"
                                    )}
                                >
                                    {slide.title}
                                </h1>
                                {slide.description && (
                                    <p
                                        className={cn(
                                            "text-xl md:text-2xl text-neutral-300 max-w-3xl mx-auto font-light leading-relaxed transition-all duration-1000 delay-500",
                                            index === currentIndex
                                                ? "opacity-100 translate-y-0"
                                                : "opacity-0 translate-y-10"
                                        )}
                                    >
                                        {slide.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {slides.length > 1 && (
                <>
                    {/* Navigation Arrows */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>

                    {/* Bottom Controls */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6">
                        {/* Dot Indicators */}
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className="group relative"
                                    aria-label={`Go to slide ${index + 1}`}
                                >
                                    <div
                                        className={cn(
                                            "w-2 h-2 rounded-full transition-all duration-300",
                                            index === currentIndex
                                                ? "bg-white w-8"
                                                : "bg-white/40 hover:bg-white/60"
                                        )}
                                    />
                                    {index === currentIndex && (
                                        <div
                                            className="absolute inset-0 rounded-full bg-primary-500"
                                            style={{
                                                width: `${progress}%`,
                                                transition: 'width 0.1s linear'
                                            }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Play/Pause Button */}
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all"
                            aria-label={isPlaying ? 'Pause' : 'Play'}
                        >
                            {isPlaying ? (
                                <Pause className="h-4 w-4" />
                            ) : (
                                <Play className="h-4 w-4" />
                            )}
                        </button>
                    </div>

                    {/* Slide Counter */}
                    <div className="absolute top-8 right-8 z-20 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-sm font-medium">
                        {currentIndex + 1} / {slides.length}
                    </div>
                </>
            )}
        </div>
    );
}
