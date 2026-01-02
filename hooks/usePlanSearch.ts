'use client';

import { useState, useCallback } from 'react';
import type { Place, SearchFilters } from '@/lib/places';
import { getPlaceType } from '@/lib/places';
import { generatePlans, getHangoutPlaceTypes, type Plan } from '@/lib/planGenerator';
import { getCuisineKeywords } from '@/lib/cuisines';

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
    const { location, dining, hangout, partySize, planType: explicitPlanType, cuisines } = filters;

    // Get cuisine keywords for search
    const cuisineKeywords = cuisines && cuisines.length > 0 ? getCuisineKeywords(cuisines) : '';

    // Determine plan type from dining selection or explicit planType
    let planType: 'morning' | 'afternoon' | 'fullday' | 'single' = explicitPlanType || 'single';

    if (!explicitPlanType) {
      const hasBreakfast = dining.includes('Breakfast');
      const hasLunch = dining.includes('Lunch');
      const hasDinner = dining.includes('Dinner');

      if (hasBreakfast && hasLunch && hasDinner) {
        planType = 'fullday';
      } else if (hasBreakfast && hasLunch) {
        planType = 'morning';
      } else if (hasLunch && hasDinner) {
        planType = 'afternoon';
      } else {
        planType = 'single';
      }
    }

    // Helper function to search for specific meal type
    const searchMealType = async (mealType: string): Promise<Place[]> => {
      const types = getPlaceType([mealType]);
      let keyword = mealType === 'Breakfast' ? 'breakfast brunch cafe' :
                    mealType === 'Lunch' ? 'lunch restaurant' :
                    'dinner restaurant';

      // Add cuisine keywords if specified
      if (cuisineKeywords) {
        keyword = `${keyword} ${cuisineKeywords}`;
      }

      const request: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius,
        type: types[0] || 'restaurant',
        keyword,
      };

      return new Promise<Place[]>((resolve, reject) => {
        service.nearbySearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const validFoodTypes = [
              'restaurant', 'cafe', 'bar', 'food', 'bakery',
              'meal_takeaway', 'meal_delivery', 'fast_food'
            ];

            const filteredResults = results.filter((result) => {
              const types = result.types || [];
              return types.some(type => validFoodTypes.includes(type));
            });

            resolve(mapPlaceResults(filteredResults.slice(0, 20)));
          } else {
            reject(new Error(`${mealType} search failed: ${status}`));
          }
        });
      });
    };

    // Search for meal places based on plan type
    let breakfastPlaces: Place[] = [];
    let lunchPlaces: Place[] = [];
    let dinnerPlaces: Place[] = [];
    let diningPlaces: Place[] = []; // For backward compatibility with single plans

    if (planType === 'morning') {
      [breakfastPlaces, lunchPlaces] = await Promise.all([
        searchMealType('Breakfast'),
        searchMealType('Lunch'),
      ]);
    } else if (planType === 'afternoon') {
      [lunchPlaces, dinnerPlaces] = await Promise.all([
        searchMealType('Lunch'),
        searchMealType('Dinner'),
      ]);
    } else if (planType === 'fullday') {
      [breakfastPlaces, lunchPlaces, dinnerPlaces] = await Promise.all([
        searchMealType('Breakfast'),
        searchMealType('Lunch'),
        searchMealType('Dinner'),
      ]);
    } else {
      // Single plan - use original logic
      const diningTypes = getPlaceType(dining);
      let diningKeyword = 'restaurant food dining';

      // Add cuisine keywords if specified
      if (cuisineKeywords) {
        diningKeyword = `${diningKeyword} ${cuisineKeywords}`;
      }

      const diningRequest: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius,
        type: diningTypes[0] || 'restaurant',
        keyword: diningKeyword,
      };

      diningPlaces = await new Promise<Place[]>((resolve, reject) => {
        service.nearbySearch(diningRequest, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            const validFoodTypes = [
              'restaurant', 'cafe', 'bar', 'food', 'bakery',
              'meal_takeaway', 'meal_delivery', 'fast_food'
            ];

            const filteredResults = results.filter((result) => {
              const types = result.types || [];
              return types.some(type => validFoodTypes.includes(type));
            });

            resolve(mapPlaceResults(filteredResults.slice(0, 20)));
          } else {
            reject(new Error(`Dining search failed: ${status}`));
          }
        });
      });
    }

    // Search for hangout places with broader keywords
    const hangoutTypes = getHangoutPlaceTypes(hangout);
    const hangoutRequest: google.maps.places.PlaceSearchRequest = {
      location: new google.maps.LatLng(location.lat, location.lng),
      radius,
      keyword: 'museum park beach theater arcade bowling gym entertainment activity attraction aquarium zoo',
    };

    const hangoutPlaces = await new Promise<Place[]>((resolve, reject) => {
      service.nearbySearch(hangoutRequest, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          // Filter out lodging/hotels - we only want actual activity locations
          const excludedTypes = ['lodging', 'hotel', 'bed_and_breakfast', 'hostel', 'motel', 'inn', 'resort'];
          const validActivityTypes = [
            'park', 'movie_theater', 'amusement_park', 'museum', 'art_gallery',
            'bowling_alley', 'gym', 'spa', 'shopping_mall', 'aquarium', 'zoo',
            'tourist_attraction', 'point_of_interest', 'stadium', 'casino',
            'night_club', 'bar', 'library', 'arcade', 'theater', 'performing_arts_theater'
          ];

          const filteredResults = results.filter((result) => {
            const types = result.types || [];

            // Exclude if any type is a lodging type
            const hasLodging = types.some(type => excludedTypes.includes(type));
            if (hasLodging) return false;

            // Include if it has valid activity types or if it's a general point_of_interest
            const hasValidActivity = types.some(type => validActivityTypes.includes(type));
            return hasValidActivity || types.includes('point_of_interest');
          });

          resolve(mapPlaceResults(filteredResults.slice(0, 20)));
        } else {
          reject(new Error(`Hangout search failed: ${status}`));
        }
      });
    });

    // Search for side quest locations (coffee, arcades, gyms, etc.) for all plans
    let coffeeShops: Place[] = [];

    if (hangout === 'Date') {
      // For Date plans: only coffee/bubble tea (no intense activities)
      // Search more extensively to ensure we have enough for 5 plans with 2+ each
      const coffeeRequest: google.maps.places.PlaceSearchRequest = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius,
        keyword: 'coffee bubble tea boba cafe dessert bakery',
        type: 'cafe',
      };

      coffeeShops = await new Promise<Place[]>((resolve) => {
        service.nearbySearch(coffeeRequest, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            // Get more results for Date Night - need enough for 5 plans with 2+ each
            resolve(mapPlaceResults(results.slice(0, 30)));
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
      breakfastPlaces,
      lunchPlaces,
      dinnerPlaces,
      diningPlaces, // For backward compatibility
      hangoutPlaces,
      hangoutType: hangout,
      partySize,
      sideQuestPlaces: coffeeShops,
      planType,
    } as any); // Cast for compatibility with old interface
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

      // Try progressively larger radii (1km increments) until we get at least 5 unique plans
      const maxRadius = 10000; // Maximum 10km
      let generatedPlans: Plan[] = [];
      let currentRadius = 2000; // Start at 2km

      while (currentRadius <= maxRadius) {
        generatedPlans = await performSearch(service, filters, currentRadius);

        // If we have at least 5 plans, we're done
        if (generatedPlans.length >= 5) {
          break;
        }

        // Expand radius by 1km and wait a bit before trying again
        currentRadius += 1000;
        if (currentRadius <= maxRadius) {
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
