'use client';

import { motion } from 'framer-motion';
import { Star, MapPin, DollarSign, Clock } from 'lucide-react';
import type { Place } from '@/lib/places';

interface PlaceCardProps {
  place: Place;
  index: number;
  onClick: () => void;
}

export default function PlaceCard({ place, index, onClick }: PlaceCardProps) {
  const getPriceSymbol = (level?: number) => {
    if (!level) return 'N/A';
    return '$'.repeat(level);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="cursor-pointer overflow-hidden rounded-2xl bg-white p-4 shadow-lg transition-all hover:shadow-xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{place.name}</h3>

          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            <span className="line-clamp-1">{place.address}</span>
          </div>

          <div className="mt-2 flex items-center gap-3">
            {place.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-gray-900">
                  {place.rating.toFixed(1)}
                </span>
                {place.userRatingsTotal && (
                  <span className="text-xs text-gray-500">
                    ({place.userRatingsTotal})
                  </span>
                )}
              </div>
            )}

            {place.priceLevel && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {getPriceSymbol(place.priceLevel)}
                </span>
              </div>
            )}

            {place.openNow !== undefined && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-400" />
                <span
                  className={`text-xs font-medium ${
                    place.openNow ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {place.openNow ? 'Open' : 'Closed'}
                </span>
              </div>
            )}
          </div>
        </div>

        <button className="shrink-0 rounded-full bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-600">
          View
        </button>
      </div>
    </motion.div>
  );
}
