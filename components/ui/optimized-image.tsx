import React, { useState, useMemo } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'alt'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  loading?: 'eager' | 'lazy';
  quality?: number;
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/placeholder.svg',
  className,
  imgClassName,
  priority = false,
  // loading = 'lazy',
  quality = 80,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Generate optimized image URL
  const optimizedSrc = useMemo(() => {
    if (!src || error) return fallbackSrc;
    
    // If it's an external URL, use it as is
    if (src.startsWith('http') || src.startsWith('blob:')) {
      return src;
    }
    
    // For local images, use the optimized version if it exists
    const extension = src.split('.').pop()?.toLowerCase();
    const baseName = src.replace(/\.[^/.]+$/, '');
    
    // Check if the optimized version exists
    const optimizedPath = `/optimized/${baseName}.webp`;
    
    // If it's already a webp image, use it as is
    if (extension === 'webp') {
      return src.startsWith('/') ? src : `/${src}`;
    }
    
    // Otherwise, use the optimized webp version
    return optimizedPath;
  }, [src, error, fallbackSrc]);

  // Handle image load errors
  const handleError = () => {
    if (!error) {
      setError(true);
    }
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <Image
        src={optimizedSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          imgClassName
        )}
        onLoadingComplete={() => setIsLoading(false)}
        onError={handleError}
        // loading={loading}
        priority={priority}
        quality={quality}
        sizes={sizes}
        {...props}
      />
      
      {/* Show a simple placeholder while loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {/* Fallback for browsers that don't support WebP */}
      <style jsx global>{`
        picture img {
          opacity: 1;
          transition: opacity 0.3s ease;
        }
        picture img[data-nimg='1'] {
          position: relative;
        }
      `}</style>
    </div>
  );
}

export default OptimizedImage;
