'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface SafeImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  fill?: boolean;
  onError?: () => void;
}

// Placeholder image as SVG data URI (light gray background with message)
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk9icmF6ZWsgbmllIHpvc3Rhw6EgemFsYWRvd2FueTwvdGV4dD48L3N2Zz4=';

export default function SafeImage({
  src,
  alt,
  width,
  height,
  className = '',
  sizes,
  priority = false,
  loading = 'lazy',
  fill = false,
  onError,
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset state when src changes
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  // Use a hidden img element to detect errors
  useEffect(() => {
    if (!src || src === PLACEHOLDER_IMAGE || hasError) {
      return;
    }

    const img = document.createElement('img');
    const handleError = () => {
      if (!hasError) {
        setHasError(true);
        setImgSrc(PLACEHOLDER_IMAGE);
        if (onError) {
          onError();
        }
      }
    };

    img.onerror = handleError;
    img.onload = () => {
      // Image loaded successfully, use the original src
      if (imgSrc !== src) {
        setImgSrc(src);
      }
    };
    img.src = src;

    return () => {
      img.onerror = null;
      img.onload = null;
    };
  }, [src, hasError, onError, imgSrc]);

  // Prepare image props - don't pass loading when priority is true
  const imageProps = {
    src: imgSrc,
    alt,
    className,
    sizes,
    priority,
    unoptimized: hasError || imgSrc === PLACEHOLDER_IMAGE,
    ...(priority ? {} : { loading }), // Only pass loading if priority is false
  };

  // If fill is true, use different Image component props
  if (fill) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Image
          {...imageProps}
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>
    );
  }

  return (
    <Image
      {...imageProps}
      width={width}
      height={height}
    />
  );
}
