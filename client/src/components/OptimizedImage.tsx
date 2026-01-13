import React from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  width?: number;
  height?: number;
}

export function OptimizedImage({ 
  src, 
  alt, 
  className = '', 
  loading = 'lazy',
  width,
  height 
}: OptimizedImageProps) {
  // Convert .png to .webp for the optimized version
  const webpSrc = src.replace(/\.png$/, '.webp').replace(/\.jpg$/, '.webp').replace(/\.jpeg$/, '.webp');
  const hasWebp = src.match(/\.(png|jpg|jpeg)$/i);

  if (hasWebp) {
    return (
      <picture>
        <source srcSet={webpSrc} type="image/webp" />
        <img 
          src={src} 
          alt={alt} 
          className={className}
          loading={loading}
          width={width}
          height={height}
          decoding="async"
        />
      </picture>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      loading={loading}
      width={width}
      height={height}
      decoding="async"
    />
  );
}
