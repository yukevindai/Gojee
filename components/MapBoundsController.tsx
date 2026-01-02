'use client';

import { useMapBounds } from '@/hooks/useMapBounds';
import type { Place } from '@/lib/places';

interface MapBoundsControllerProps {
  places: Place[];
}

export default function MapBoundsController({ places }: MapBoundsControllerProps) {
  useMapBounds(places, { padding: 100, maxZoom: 15 });
  return null;
}
