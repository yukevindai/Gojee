import { useEffect } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import type { Place } from '@/lib/places';

interface UseMapBoundsOptions {
  padding?: number;
  maxZoom?: number;
}

export function useMapBounds(
  places: Place[],
  options: UseMapBoundsOptions = {}
) {
  const map = useMap();
  const { padding = 80, maxZoom = 15 } = options;

  useEffect(() => {
    if (!map || !places || places.length === 0) return;

    // Create bounds
    const bounds = new google.maps.LatLngBounds();

    // Add all places to bounds
    places.forEach((place) => {
      bounds.extend({
        lat: place.location.lat,
        lng: place.location.lng,
      });
    });

    // Fit map to bounds
    map.fitBounds(bounds, padding);

    // Prevent zooming in too much for single location
    if (places.length === 1) {
      const listener = google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        const currentZoom = map.getZoom();
        if (currentZoom && currentZoom > maxZoom) {
          map.setZoom(maxZoom);
        }
      });

      return () => {
        google.maps.event.removeListener(listener);
      };
    }
  }, [map, places, padding, maxZoom]);
}
