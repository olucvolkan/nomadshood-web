'use client';

import Image from 'next/image';
import React, { useState } from 'react';

interface ColivingImageProps {
  logoUrl: string;
  name: string;
  className?: string;
}

const ColivingImage: React.FC<ColivingImageProps> = ({ logoUrl, name, className = "" }) => {
  const [imageError, setImageError] = useState(false);
  
  const shouldShowFallback = !logoUrl || 
    logoUrl.includes('placehold.co') || 
    imageError;

  if (shouldShowFallback) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center relative ${className}`}>
        <span className="text-white font-bold text-4xl">
          {name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </span>
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <Image
        src={logoUrl}
        alt={`${name} logo`}
        fill
        style={{objectFit: 'cover'}}
        className="group-hover:scale-105 transition-transform duration-300"
        onError={() => setImageError(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
    </>
  );
};

export default ColivingImage; 