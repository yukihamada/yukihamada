import { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
}

/**
 * Optimized image component with lazy loading and WebP support
 */
const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  fetchPriority = 'auto',
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // Reset state when src changes
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
    setCurrentSrc(src);
  }, [src]);

  const imageSrc = hasError ? '/placeholder.svg' : currentSrc;

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`${className} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-50'}`}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      onLoad={() => setIsLoaded(true)}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setIsLoaded(true);
        }
      }}
    />
  );
};

export default OptimizedImage;
