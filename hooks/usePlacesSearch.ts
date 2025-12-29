'use client';

import { useState, useCallback } from 'react';
import type { Place, SearchFilters } from '@/lib/places';
import { getPlaceType, getSearchKeyword } from '@/lib/places';

export function usePlacesSearch() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPlaces = useCallback(async (filters: SearchFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if Google Maps is loaded
      if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
        throw new Error('Google Maps Places library not loaded');
      }

      const { location } = filters;

      // Create a map instance (required for PlacesService)
      const mapDiv = document.createElement('div');
      const map = new google.maps.Map(mapDiv);

      const service = new google.maps.places.PlacesService(map);

      // Build search request
      const types = getPlaceType(filters.dining);
      const keyword = getSearchKeyword(filters);

      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius: 2000, // 2km radius
        keyword,
        type: types[0], // Use first type as primary
      };

      // Perform search
      return new Promise<void>((resolve, reject) => {
        service.nearbySearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const mappedPlaces: Place[] = results.slice(0, 10).map((result) => ({
              id: result.place_id || '',
              name: result.name || 'Unknown',
              address: result.vicinity || 'No address',
              rating: result.rating,
              userRatingsTotal: result.user_ratings_total,
              priceLevel: result.price_level,
              location: {
                lat: result.geometry?.location?.lat() || 0,
                lng: result.geometry?.location?.lng() || 0,
              },
              types: result.types,
              openNow: result.opening_hours?.open_now,
            }));

            setPlaces(mappedPlaces);
            setIsLoading(false);
            resolve();
          } else {
            const errorMsg = `Places search failed: ${status}`;
            setError(errorMsg);
            setIsLoading(false);
            reject(new Error(errorMsg));
          }
        });
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      setIsLoading(false);
      console.error('Places search error:', err);
    }
  }, []);

  const clearPlaces = useCallback(() => {
    setPlaces([]);
    setError(null);
  }, []);

  return {
    places,
    isLoading,
    error,
    searchPlaces,
    clearPlaces,
  };
}
