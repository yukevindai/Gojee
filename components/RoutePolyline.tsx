'use client';

import { useMap } from '@vis.gl/react-google-maps';
import { useEffect, useRef } from 'react';
import type { Place } from '@/lib/places';

interface RoutePolylineProps {
  places: Place[];
  color?: string;
  opacity?: number;
  strokeWeight?: number;
  isDashed?: boolean;
}

export default function RoutePolyline({
  places,
  color = '#3b82f6', // blue-500
  opacity = 0.8,
  strokeWeight = 3,
  isDashed = false,
}: RoutePolylineProps) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || places.length < 2) return;

    // Create path from places
    const path = places.map((place) => ({
      lat: place.location.lat,
      lng: place.location.lng,
    }));

    // Create polyline
    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: color,
      strokeOpacity: opacity,
      strokeWeight,
      ...(isDashed && {
        icons: [
          {
            icon: {
              path: 'M 0,-1 0,1',
              strokeOpacity: 1,
              scale: 3,
            },
            offset: '0',
            repeat: '20px',
          },
        ],
        strokeOpacity: 0,
      }),
    });

    polyline.setMap(map);
    polylineRef.current = polyline;

    // Cleanup
    return () => {
      polyline.setMap(null);
    };
  }, [map, places, color, opacity, strokeWeight, isDashed]);

  return null;
}
