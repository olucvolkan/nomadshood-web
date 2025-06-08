'use client';

import type { CategorizedNearbyPlaceGroup } from '@/types';
import { Clock, ExternalLink, MapPin, Star } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const NearbyPlaceIcon: React.FC<{ type: string; className?: string }> = ({ type, className = "h-5 w-5 text-primary mr-2" }) => {
  switch (type?.toLowerCase()) {
    case 'cafe': return <div className={className}>☕</div>;
    case 'restaurant': return <div className={className}>🍽️</div>;
    case 'food': return <div className={className}>🍜</div>;
    case 'park': return <div className={className}>🌳</div>;
    case 'gym': return <div className={className}>💪</div>;
    case 'supermarket':
    case 'grocery_or_supermarket':
      return <div className={className}>🛒</div>;
    case 'transit_station':
    case 'bus_station':
    case 'subway_station':
    case 'public_transport':
      return <div className={className}>🚌</div>;
    case 'bank':
    case 'atm':
      return <div className={className}>🏦</div>;
    case 'hospital':
    case 'doctor':
    case 'pharmacy':
      return <div className={className}>🏥</div>;
    case 'shopping_mall':
    case 'clothing_store':
    case 'store':
    case 'shopping':
      return <div className={className}>🛍️</div>;
    case 'bar':
    case 'night_club':
    case 'nightlife':
      return <div className={className}>🍺</div>;
    case 'beach':
      return <div className={className}>🏖️</div>;
    case 'hiking_trail':
    case 'mountain':
    case 'hiking':
      return <div className={className}>⛰️</div>;
    case 'coworking_space':
    case 'coworking':
      return <div className={className}>💼</div>;
    case 'tourist_attraction':
    case 'landmark':
      return <div className={className}>🏛️</div>;
    default: return <div className={className}>📍</div>;
  }
};

interface NearbyPlacesTabsProps {
  categorizedNearbyPlaces: CategorizedNearbyPlaceGroup[];
}

export const NearbyPlacesTabs: React.FC<NearbyPlacesTabsProps> = ({ categorizedNearbyPlaces }) => {
  const [activeTab, setActiveTab] = useState(0);

  if (!categorizedNearbyPlaces || categorizedNearbyPlaces.length === 0) {
    return null;
  }

  const activeCategory = categorizedNearbyPlaces[activeTab];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 bg-orange-50 p-2 rounded-2xl">
        {categorizedNearbyPlaces.map((category, index) => (
          <button
            key={category.categoryKey}
            onClick={() => setActiveTab(index)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === index
                ? 'bg-white text-orange-600 shadow-md'
                : 'text-gray-600 hover:text-orange-600 hover:bg-white/50'
            }`}
          >
            <NearbyPlaceIcon type={category.categoryKey} className="h-4 w-4" />
            {category.categoryDisplayName}
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
              {category.places.length}
            </span>
          </button>
        ))}
      </div>

      {/* Active Category Content */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-4 min-w-max">
            {activeCategory.places.slice(0, 6).map((place) => (
              <div key={place.id} className="flex-shrink-0 w-80 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200 hover:border-orange-300 hover:shadow-md transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 flex-1">
                    {place.name}
                  </h4>
                  {place.rating && (
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0 bg-yellow-100 px-2 py-1 rounded-full">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-medium text-gray-700">{place.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                
                {place.address_vicinity && (
                  <p className="text-xs text-gray-600 mb-3 line-clamp-1">
                    {place.address_vicinity}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {place.distance_meters && (
                      <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        <MapPin className="h-3 w-3" />
                        {place.distance_meters < 1000 
                          ? `${place.distance_meters}m`
                          : `${(place.distance_meters / 1000).toFixed(1)}km`
                        }
                      </span>
                    )}
                    
                    {place.distance_walking_time && (
                      <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        <Clock className="h-3 w-3" />
                        {place.distance_walking_time}min
                      </span>
                    )}
                  </div>
                  
                  {place.locationLink && (
                    <Link 
                      href={place.locationLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-full transition-colors text-xs font-medium"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View on Map
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {activeCategory.places.length > 6 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Showing 6 of {activeCategory.places.length} {activeCategory.categoryDisplayName.toLowerCase()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 