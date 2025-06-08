'use client';

import Image from 'next/image';
import React, { useState } from 'react';

interface ColivingLogoProps {
  logoUrl: string;
  name: string;
}

const ColivingLogo: React.FC<ColivingLogoProps> = ({ logoUrl, name }) => {
  const [imageError, setImageError] = useState(false);
  
  const shouldShowFallback = !logoUrl || 
    logoUrl.includes('placehold.co') || 
    imageError;

  if (shouldShowFallback) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500 flex items-center justify-center">
        <span className="text-white font-bold text-xl lg:text-3xl">
          {name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .slice(0, 2)
            .toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-2">
      <Image
        src={logoUrl}
        alt={`${name || 'Coliving'} logo`}
        fill
        style={{objectFit: 'contain'}}
        data-ai-hint="company logo"
        onError={() => setImageError(true)}
      />
    </div>
  );
};

export default ColivingLogo; 