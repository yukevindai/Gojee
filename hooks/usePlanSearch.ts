'use client';

import { useState, useCallback } from 'react';
import type { Place, SearchFilters } from '@/lib/places';
import { getPlaceType } from '@/lib/places';
import { generatePlans, generateDiningOnlyPlans, generateActivityOnlyPlans, getHangoutPlaceTypes, planFitsTimeWindow, type Plan } from '@/lib/planGenerator';
import { getCuisineKeywords } from '@/lib/cuisines';
import { getWeatherPreferences, isIndoorVenue, isOutdoorVenue } from '@/lib/weather';
import { getWeatherData } from '@/lib/weatherApi';

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

  // Helper function to filter places by price range
  const filterByPrice = (places: Place[], priceRange?: number[]): Place[] => {
    if (!priceRange || priceRange.length === 0) return places;

    return places.filter(place => {
      // If place has no price level, include it (better than excluding)
      if (!place.priceLevel) return true;

      // Check if place's price level is in the selected range
      return priceRange.includes(place.priceLevel);
    });
  };

  // Helper function to filter dining places by minimum rating (3.5+)
  const filterByRating = (places: Place[], minRating: number = 3.5): Place[] => {
    return places.filter(place => {
      // Only include places with 3.5+ star ratings
      if (!place.rating) return false; // Exclude places without ratings
      return place.rating >= minRating;
    });
  };

  // Helper function to perform search at a specific radius
  const performSearch = async (
    service: google.maps.places.PlacesService,
    filters: SearchFilters,
    radius: number
  ): Promise<Plan[]> => {
    const { location, dining, hangout, partySize, planType: explicitPlanType, cuisines, priceRange, sideQuestBudget, includeDining = true, includeActivities = true } = filters;

    // Fetch real-time weather data for the location
    const weatherData = await getWeatherData(location.lat, location.lng);

    // Get weather preferences for seasonal and temperature-based adjustments
    // Use actual temperature if weather data is available
    const weather = getWeatherPreferences(weatherData?.temperatureF);

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

            // Map results and filter by price and rating (3.5+)
            // Increased from 20 to 40 to get more venues before filtering
            const mappedPlaces = mapPlaceResults(filteredResults.slice(0, 40));
            const priceFilteredPlaces = filterByPrice(mappedPlaces, priceRange);
            const ratingFilteredPlaces = filterByRating(priceFilteredPlaces);
            resolve(ratingFilteredPlaces);
          } else {
            reject(new Error(`${mealType} search failed: ${status}`));
          }
        });
      });
    };

    // Search for meal places based on plan type (only if includeDining is true)
    let breakfastPlaces: Place[] = [];
    let lunchPlaces: Place[] = [];
    let dinnerPlaces: Place[] = [];
    let diningPlaces: Place[] = []; // For backward compatibility with single plans

    if (includeDining) {
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

              // Map results and filter by price and rating (3.5+)
              // Increased from 20 to 40 to get more venues before filtering
              const mappedPlaces = mapPlaceResults(filteredResults.slice(0, 40));
              const priceFilteredPlaces = filterByPrice(mappedPlaces, priceRange);
              const ratingFilteredPlaces = filterByRating(priceFilteredPlaces);
              resolve(ratingFilteredPlaces);
            } else {
              reject(new Error(`Dining search failed: ${status}`));
            }
          });
        });
      }
    }

    // Search for hangout places with multiple targeted searches (only if includeActivities is true)
    let hangoutPlaces: Place[] = [];

    if (includeActivities) {
      // Build activity searches based on weather
      const activitySearches = [
        // Indoor activities (always included, prioritized in hot weather)
        { keyword: 'museum art gallery cultural center science center', type: 'museum', priority: weather.favorIndoor ? 1 : 2 },
        { keyword: 'shopping mall store boutique market', type: 'shopping_mall', priority: weather.favorIndoor ? 1 : 2 },
        { keyword: 'theater cinema movie arcade bowling entertainment', type: 'movie_theater', priority: weather.favorIndoor ? 1 : 2 },
        { keyword: 'aquarium marine center oceanarium sea life center', type: 'aquarium', priority: weather.favorIndoor ? 1 : 2 },
        { keyword: 'library bookstore performing arts center', type: null, priority: weather.favorIndoor ? 1 : 2 },
        { keyword: 'gym fitness spa wellness yoga', type: 'gym', priority: weather.favorIndoor ? 1 : 2 },

        // Outdoor activities - parks (prioritized in fall/winter)
        { keyword: 'park national park botanical garden nature reserve', type: 'park', priority: weather.favorParks ? 1 : 2 },
        { keyword: 'national park state park recreation area nature preserve', type: null, priority: weather.favorParks ? 1 : 2 },

        // Outdoor activities - beaches (prioritized in spring/summer)
        { keyword: 'beach waterfront pier ocean seaside', type: null, priority: weather.favorBeaches ? 1 : 3 },

        // Mixed indoor/outdoor activities
        { keyword: 'landmark monument historical site tourist attraction', type: 'tourist_attraction', priority: 2 },
        { keyword: 'zoo aquarium amusement park', type: null, priority: weather.favorIndoor ? 3 : 2 },
        { keyword: 'stadium arena sports venue casino', type: null, priority: 2 },
        { keyword: 'church cathedral temple mosque synagogue religious shrine', type: 'church', priority: 2 },
        { keyword: 'historic landmark heritage site historical building', type: null, priority: 2 },
        { keyword: 'viewpoint observation deck scenic overlook vista point', type: null, priority: weather.favorIndoor ? 3 : 2 },
        { keyword: 'architectural landmark historic building monument', type: null, priority: 2 },
      ];

      const excludedTypes = ['lodging', 'hotel', 'bed_and_breakfast', 'hostel', 'motel', 'inn', 'resort'];
      const validActivityTypes = [
        'park', 'movie_theater', 'amusement_park', 'museum', 'art_gallery',
        'bowling_alley', 'gym', 'spa', 'shopping_mall', 'aquarium', 'zoo',
        'tourist_attraction', 'point_of_interest', 'stadium', 'casino',
        'night_club', 'bar', 'library', 'arcade', 'theater', 'performing_arts_theater',
        'natural_feature', 'beach', 'landmark', 'historical_landmark', 'pier',
        'store', 'shopping_center', 'department_store', 'clothing_store',
        'campground', 'rv_park', 'national_park', 'locality',
        'church', 'mosque', 'synagogue', 'hindu_temple', 'place_of_worship',
        'memorial', 'monument', 'cultural_center', 'heritage_site',
        'observation_deck', 'scenic_viewpoint'
      ];

      // Perform all searches in parallel
      const searchPromises = activitySearches.map(({ keyword, type }) => {
        const request: google.maps.places.PlaceSearchRequest = {
          location: new google.maps.LatLng(location.lat, location.lng),
          radius: 5000, // 5km radius for activity variety
          keyword,
          ...(type && { type }), // Only add type if specified
        };

        return new Promise<Place[]>((resolve) => {
          service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              const filteredResults = results.filter((result) => {
                const types = result.types || [];
                const hasLodging = types.some(type => excludedTypes.includes(type));
                if (hasLodging) return false;
                const hasValidActivity = types.some(type => validActivityTypes.includes(type));
                return hasValidActivity || types.includes('point_of_interest');
              });

              const mappedPlaces = mapPlaceResults(filteredResults);
              const priceFilteredPlaces = filterByPrice(mappedPlaces, priceRange);
              resolve(priceFilteredPlaces);
            } else {
              resolve([]);
            }
          });
        });
      });

      // Combine all search results
      const allResults = await Promise.all(searchPromises);
      const combinedPlaces = allResults.flat();

      // Remove duplicates by ID
      const uniquePlacesMap = new Map<string, Place>();
      combinedPlaces.forEach(place => {
        uniquePlacesMap.set(place.id, place);
      });

      hangoutPlaces = Array.from(uniquePlacesMap.values());

      // Sort venues based on weather preferences
      // In hot weather, prioritize indoor venues; otherwise maintain variety
      if (weather.favorIndoor) {
        hangoutPlaces.sort((a, b) => {
          const aIsIndoor = isIndoorVenue(a.types || []);
          const bIsIndoor = isIndoorVenue(b.types || []);
          if (aIsIndoor && !bIsIndoor) return -1; // Indoor venues first
          if (!aIsIndoor && bIsIndoor) return 1;
          return 0; // Maintain order for same type
        });
      }
    }

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
            // Map results and filter by side quest budget
            const mappedPlaces = mapPlaceResults(results.slice(0, 30));
            const budgetFilteredPlaces = filterByPrice(mappedPlaces, sideQuestBudget);
            resolve(budgetFilteredPlaces);
          } else {
            resolve([]);
          }
        });
      });
    } else {
      // For Chill, Formal, N/A plans: diverse side quests with more variety
      const sideQuestTypes = [
        { keyword: 'coffee bubble tea boba cafe dessert', type: 'cafe' },
        { keyword: 'arcade game center entertainment', type: null }, // No type for broader results
        { keyword: 'gym fitness yoga pilates', type: 'gym' },
        { keyword: 'movie cinema theater film', type: 'movie_theater' },
        { keyword: 'bowling alley', type: null },
        { keyword: 'ice cream gelato frozen yogurt', type: 'bakery' },
        { keyword: 'bar drinks cocktails beer wine', type: 'bar' },
        { keyword: 'bookstore library books', type: null },
        { keyword: 'beach waterfront pier ocean seaside', type: null },
        { keyword: 'tourist attraction landmark monument historic', type: 'tourist_attraction' },
        { keyword: 'viewpoint scenic vista lookout observation', type: null },
      ];

      const sideQuestSearches = sideQuestTypes.map((quest) => {
        const request: google.maps.places.PlaceSearchRequest = {
          location: new google.maps.LatLng(location.lat, location.lng),
          radius: 3000, // Use larger radius for better coverage
          keyword: quest.keyword,
          ...(quest.type && { type: quest.type }), // Only add type if specified
        };

        return new Promise<Place[]>((resolve) => {
          service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              // Get more results per category for variety
              const mappedPlaces = mapPlaceResults(results.slice(0, 8));
              const budgetFilteredPlaces = filterByPrice(mappedPlaces, sideQuestBudget);
              resolve(budgetFilteredPlaces);
            } else {
              // Log failures for debugging but don't fail the entire search
              console.warn(`Side quest search failed for ${quest.keyword}: ${status}`);
              resolve([]);
            }
          });
        });
      });

      // Combine all side quest results
      const allSideQuests = await Promise.all(sideQuestSearches);
      coffeeShops = allSideQuests.flat();

      // Shuffle to ensure variety in distribution across plans
      coffeeShops = coffeeShops.sort(() => Math.random() - 0.5);
    }

    // Generate plans from the search results based on includeDining and includeActivities
    if (!includeDining && includeActivities) {
      // Activity-only plans
      let plans = generateActivityOnlyPlans({
        hangoutPlaces,
        hangoutType: hangout,
        partySize,
        sideQuestPlaces: coffeeShops,
        numberOfPlans: filters.numberOfPlans || 5,
      });
      // Filter by time if specified
      if (filters.startTime || filters.endTime) {
        plans = plans.filter(plan => planFitsTimeWindow(plan, filters.startTime, filters.endTime));
      }
      return plans;
    } else if (includeDining && !includeActivities) {
      // Dining-only plans
      let plans = generateDiningOnlyPlans({
        breakfastPlaces,
        lunchPlaces,
        dinnerPlaces,
        partySize,
        sideQuestPlaces: coffeeShops,
        numberOfPlans: filters.numberOfPlans || 5,
      });
      // Filter by time if specified
      if (filters.startTime || filters.endTime) {
        plans = plans.filter(plan => planFitsTimeWindow(plan, filters.startTime, filters.endTime));
      }
      return plans;
    } else {
      // Standard plans with both dining and activities
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
        numberOfPlans: filters.numberOfPlans || 5,
        startTime: filters.startTime,
        endTime: filters.endTime,
        weather, // Pass weather preferences for distance and side quest adjustments
        weatherData, // Pass actual weather data for snow detection
      } as any); // Cast for compatibility with old interface
    }
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
