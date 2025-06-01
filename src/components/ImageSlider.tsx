
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageSliderProps {
  images: string[];
  altText?: string;
  baseDataAiHint?: string; 
}

export const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  altText = 'Coliving space image',
  baseDataAiHint = 'coliving view',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const validImages = images && images.length > 0 ? images : ['https://placehold.co/600x400.png?text=No+Image+Available'];
  const currentDataAiHint = validImages[currentIndex] === 'https://placehold.co/600x400.png?text=No+Image+Available' ? 'placeholder building' : `${baseDataAiHint} ${currentIndex + 1}`;


  if (validImages.length === 1) {
    return (
      <div className="relative w-full h-72 md:h-96 rounded-lg overflow-hidden shadow-inner">
        <Image
          src={validImages[0]}
          alt={`${altText} 1`}
          fill
          style={{ objectFit: 'cover' }}
          className="rounded-lg"
          data-ai-hint={currentDataAiHint}
          priority
        />
      </div>
    );
  }

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? validImages.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === validImages.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  return (
    <div className="relative w-full h-72 md:h-96 rounded-t-lg overflow-hidden shadow-inner group">
      <div className="w-full h-full">
        <Image
          src={validImages[currentIndex]}
          alt={`${altText} ${currentIndex + 1}`}
          fill
          style={{ objectFit: 'cover' }}
          className="transition-opacity duration-300 ease-in-out rounded-t-lg"
          data-ai-hint={currentDataAiHint}
          priority={currentIndex === 0}
          key={currentIndex} 
        />
      </div>
      {/* Left Arrow */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-1/2 left-3 transform -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
        onClick={goToPrevious}
        aria-label="Previous image"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      {/* Right Arrow */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-1/2 right-3 transform -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
        onClick={goToNext}
        aria-label="Next image"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {validImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
              currentIndex === index ? 'bg-primary scale-125' : 'bg-white/60 hover:bg-white/90'
            }`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
