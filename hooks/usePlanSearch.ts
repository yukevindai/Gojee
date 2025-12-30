'use client';

import { useState, useCallback } from 'react';
import type { Place, SearchFilters } from '@/lib/places';
import { getPlaceType } from '@/lib/places';
import { generatePlans, getHangoutPlaceTypes, type Plan } from '@/lib/planGenerator';

function mapPlaceResults(results: google.maps.places.PlaceResult[]): Place[] {
  return results.map((result) => ({
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
}

export function usePlanSearch() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to perform search at a specific radius
  const performSearch = async (
    service: google.maps.places.PlacesService,
    filters: SearchFilters,
    radius: number
  ): Promise<Plan[]> => {
    const { location, dining, hangout, partySize } = filters;

    // Search for dining places
    const diningTypes = getPlaceType(dining);
    const diningRequest: google.maps.places.PlaceSearchRequest = {
      location: new google.maps.LatLng(location.lat, location.lng),
      radius,
      type: diningTypes[0] || 'restaurant',
      keyword: 'restaurant food dining',
    };

    const diningPlaces = await new Promise<Place[]>((resolve, reject) => {
      service.nearbySearch(diningRequest, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          // Filter to only include actual restaurants/food establishments
          const validFoodTypes = [
            'restaurant', 'cafe', 'bar', 'food', 'bakery',
            'meal_takeaway', 'meal_delivery', 'fast_food'
          ];

          const filteredResults = results.filter((result) => {
            const types = result.types || [];
            return types.some(type => validFoodTypes.includes(type));
          });

          resolve(mapPlaceResults(filteredResults.slice(0, 10)));
        } else {
          reject(new Error(`Dining search failed: ${status}`));
        }
      });
    });

    // Search for hangout places
    const hangoutTypes = getHangoutPlaceTypes(hangout);
    const hangoutRequest: google.maps.places.PlaceSearchRequest = {
      location: new google.maps.LatLng(location.lat, location.lng),
      radius,
      type: hangoutTypes[0] || 'park',
    };

    const hangoutPlaces = await new Promise<Place[]>((resolve, reject) => {
      service.nearbySearch(hangoutRequest, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          resolve(mapPlaceResults(results.slice(0, 10)));
        } else {
          reject(new Error(`Hangout search failed: ${status}`));
        }
      });
    });

    // Search for side quest locations (coffee, arcades, gyms, etc.) for all plans
    let coffeeShops: Place[] = [];

    if (hangout === 'Date') {
      // For Date plans: only coffee/bubble tea (no intense activities)
      const coffeeRequest: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius,
        keyword: 'coffee bubble tea boba',
        type: 'cafe',
      };

      coffeeShops = await new Promise<Place[]>((resolve) => {
        service.nearbySearch(coffeeRequest, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            resolve(mapPlaceResults(results.slice(0, 10)));
          } else {
            resolve([]);
          }
        });
      });
    } else {
      // For Chill, Formal, N/A plans: coffee + arcades + gyms + movie theaters
      const sideQuestTypes = [
        { keyword: 'coffee bubble tea boba', type: 'cafe' },
        { keyword: 'arcade game', type: 'amusement_center' },
        { keyword: 'gym fitness', type: 'gym' },
        { keyword: 'movie cinema', type: 'movie_theater' },
      ];

      const sideQuestSearches = sideQuestTypes.map((quest) => {
        const request: google.maps.places.PlaceSearchRequest = {
          location: new google.maps.LatLng(location.lat, location.lng),
          radius,
          keyword: quest.keyword,
          type: quest.type,
        };

        return new Promise<Place[]>((resolve) => {
          service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              resolve(mapPlaceResults(results.slice(0, 5)));
            } else {
              resolve([]);
            }
          });
        });
      });

      // Combine all side quest results
      const allSideQuests = await Promise.all(sideQuestSearches);
      coffeeShops = allSideQuests.flat();
    }

    // Generate plans from the search results
    return generatePlans({
      diningPlaces,
      hangoutPlaces,
      hangoutType: hangout,
      partySize,
      coffeeShops,
    });
  };

  const searchPlans = useCallback(async (filters: SearchFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if Google Maps is loaded
      if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
        throw new Error('Google Maps Places library not loaded');
      }

      // Create a map instance (required for PlacesService)
      const mapDiv = document.createElement('div');
      const map = new google.maps.Map(mapDiv);
      const service = new google.maps.places.PlacesService(map);

      // Try progressively larger radii until we get at least 5 unique plans
      const radii = [2000, 3000, 5000, 7000]; // 2km, 3km, 5km, 7km
      let generatedPlans: Plan[] = [];

      for (const radius of radii) {
        generatedPlans = await performSearch(service, filters, radius);

        // If we have at least 5 plans, we're done
        if (generatedPlans.length >= 5) {
          break;
        }

        // If not the last radius, wait a bit before trying again
        if (radius !== radii[radii.length - 1]) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      if (generatedPlans.length === 0) {
        throw new Error('No suitable plans found. Try different filters or location.');
      }

      setPlans(generatedPlans);
      setIsLoading(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      setIsLoading(false);
      setPlans([]);
      console.error('Plan search error:', err);
    }
  }, []);

  const clearPlans = useCallback(() => {
    setPlans([]);
    setError(null);
  }, []);

  return {
    plans,
    isLoading,
    error,
    searchPlans,
    clearPlans,
  };
}
