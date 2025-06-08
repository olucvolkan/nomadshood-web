import { getColivingSpaceById } from '@/services/colivingService';
import type { ColivingSpace } from '@/types';
import { createColivingSlug, slugify } from '@/utils/slugify';
import {
  Banknote,
  Beer,
  Briefcase,
  Bus,
  ChefHat,
  Coffee,
  Dumbbell,
  Hospital,
  Landmark,
  MapPin,
  MountainSnow,
  ShoppingCart,
  Star,
  Store,
  Trees,
  Utensils,
  WavesIcon
} from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

const StarRating: React.FC<{ rating?: number; maxStars?: number, starSize?: string, totalRatings?: number, showTextRating?: boolean }> = ({ rating, maxStars = 5, starSize = "h-4 w-4", totalRatings, showTextRating = false }) => {
  if (typeof rating !== 'number' || rating < 0 || rating > 5) {
    return <span className="text-xs text-muted-foreground">No rating</span>;
  }
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = maxStars - fullStars - halfStar;

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className={`${starSize} text-yellow-500 fill-current`} />
      ))}
      {halfStar === 1 && <Star key="half" className={`${starSize} text-yellow-500 fill-yellow-200`} />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className={`${starSize} text-yellow-300/70`} />
      ))}
      {showTextRating && <span className="ml-1 text-xs font-medium">{rating.toFixed(1)}</span>}
      {typeof totalRatings === 'number' && (
        <span className="ml-1.5 text-xs text-muted-foreground">({totalRatings})</span>
      )}
    </div>
  );
};

const NearbyPlaceIcon: React.FC<{ type: string; className?: string }> = ({ type, className = "h-5 w-5 text-primary mr-2" }) => {
  switch (type?.toLowerCase()) {
    case 'cafe': return <Coffee className={className} />;
    case 'restaurant': return <Utensils className={className} />;
    case 'food': return <ChefHat className={className} />;
    case 'park': return <Trees className={className} />;
    case 'gym': return <Dumbbell className={className} />;
    case 'supermarket':
    case 'grocery_or_supermarket':
      return <ShoppingCart className={className} />;
    case 'transit_station':
    case 'bus_station':
    case 'subway_station':
    case 'public_transport':
       return <Bus className={className} />;
    case 'bank':
    case 'atm':
      return <Banknote className={className} />;
    case 'hospital':
    case 'doctor':
    case 'pharmacy':
      return <Hospital className={className} />;
    case 'shopping_mall':
    case 'clothing_store':
    case 'store':
    case 'shopping':
      return <Store className={className} />;
    case 'bar':
    case 'night_club':
    case 'nightlife':
      return <Beer className={className} />;
    case 'beach':
      return <WavesIcon className={className} />;
    case 'hiking_trail':
    case 'mountain':
    case 'hiking':
      return <MountainSnow className={className} />;
    case 'coworking_space':
    case 'coworking':
      return <Briefcase className={className} />;
    case 'tourist_attraction':
    case 'landmark':
       return <Landmark className={className} />;
    default: return <MapPin className={className} />;
  }
};

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const paramsResolved = await params;
  const space: ColivingSpace | null = await getColivingSpaceById(paramsResolved.id);

  if (!space) {
    return {
      title: 'Coliving Space Not Found',
      description: 'The requested coliving space could not be found.'
    };
  }

  const title = `${space.name} - Coliving Space${space.address ? ` in ${space.address}` : ''}`;
  const description = `Discover ${space.name}, a${space.address ? ` coliving space located in ${space.address}` : ' amazing coliving space'}. ${space.amenities?.length ? `Features ${space.amenities.slice(0, 3).join(', ')} and more.` : ''} Perfect for digital nomads and remote workers.`;

  return {
    title,
    description: description.slice(0, 160), // Ensure under 160 characters
    openGraph: {
      title: `${title} | NomadsHood`,
      description,
      images: space.logoUrl ? [
        {
          url: space.logoUrl,
          width: 1200,
          height: 630,
          alt: `${space.name} logo`
        }
      ] : undefined,
    },
    twitter: {
      title: `${title} | NomadsHood`,
      description,
      images: space.logoUrl ? [space.logoUrl] : undefined,
    },
    alternates: {
      canonical: `/coliving/${paramsResolved.id}`
    }
  };
}

export default async function OldColivingDetailPage({ params }: { params: { id: string } }) {
  const paramsResolved = await params;
  
  try {
    // Get the coliving space by ID
    const space = await getColivingSpaceById(paramsResolved.id);
    
    if (!space || !space.country || !space.city) {
      // If space not found or missing required data, redirect to main coliving page
      redirect('/coliving');
    }
    
    // Generate the new SEO-friendly URL
    const countrySlug = slugify(space.country);
    const citySlug = slugify(space.city);
    const spaceSlug = createColivingSlug(space.name, space.id);
    
    const newUrl = `/colivings/${countrySlug}/${citySlug}/${spaceSlug}`;
    
    // Redirect to the new URL structure
    redirect(newUrl);
  } catch (error) {
    console.error('Error redirecting from old URL:', error);
    redirect('/coliving');
  }
}

    
