import React, { useState } from 'react';
import { CATEGORY_FALLBACK_IMAGES, DEFAULT_NEWS_IMAGE } from '../constants';

interface EditorialImageProps {
  src?: string;
  alt: string;
  category?: string;
  seed?: string;
  className?: string;
  caption?: string;
}

export const EditorialImage: React.FC<EditorialImageProps> = ({
  src,
  alt,
  category = '',
  className = '',
  caption
}) => {
  const [imgError, setImgError] = useState(false);

  const fallbackSrc = CATEGORY_FALLBACK_IMAGES[category] || DEFAULT_NEWS_IMAGE;
  const isInvalidOrExternalPlaceholder =
    !src ||
    src.includes('picsum.photos') ||
    src.includes('unsplash.com') ||
    src.includes('placeholder.com') ||
    src.startsWith('builtin://');

  const resolvedSrc = imgError || isInvalidOrExternalPlaceholder ? fallbackSrc : src;

  return (
    <figure className={`relative overflow-hidden bg-slate-100 ${className}`}>
      <img
        src={resolvedSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => {
          if (!imgError) setImgError(true);
        }}
        className="w-full h-full object-cover"
      />
      {caption && (
        <figcaption className="text-xs text-slate-500 mt-2 px-1 leading-relaxed">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};
