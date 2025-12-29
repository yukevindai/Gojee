'use client';

import { AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import type { Place } from '@/lib/places';

interface PlaceMarkerProps {
  place: Place;
  onClick: () => void;
}

export default function PlaceMarker({ place, onClick }: PlaceMarkerProps) {
  return (
    <AdvancedMarker
      position={place.location}
      onClick={onClick}
      title={place.name}
    >
      <Pin
        background="#3B82F6"
        borderColor="#1E40AF"
        glyphColor="#FFFFFF"
      />
    </AdvancedMarker>
  );
}
