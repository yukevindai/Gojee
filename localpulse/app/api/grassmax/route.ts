import { NextRequest, NextResponse } from 'next/server';
import { Filters, Place, Plan, GrassMaxResponse } from '@/lib/types';

// Helper: Calculate distance between two coordinates (Haversine formula)
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper: Check if reviews mention romantic/intimate keywords
function hasRomanticKeywords(reviews: any[]): boolean {
  if (!reviews || reviews.length === 0) return false;

  const keywords = ['romantic', 'intimate', 'date', 'cozy', 'ambiance', 'candlelit'];
  const reviewText = reviews.map(r => r.text?.toLowerCase() || '').join(' ');

  return keywords.some(keyword => reviewText.includes(keyword));
}

// Helper: Map dining filter to Google Places types
function getDiningType(diningFilters: string[]): string[] {
  const typeMap: Record<string, string[]> = {
    'Breakfast': ['cafe', 'bakery', 'restaurant'],
    'Lunch': ['restaurant', 'cafe'],
    'Dinner': ['restaurant', 'fine_dining'],
    'Quick Bite': ['fast_food', 'cafe', 'sandwich_shop'],
    'Snack': ['cafe', 'bakery', 'ice_cream_shop'],
    'Desert': ['dessert_shop', 'ice_cream_shop', 'bakery'],
  };

  const types = new Set<string>();
  diningFilters.forEach(filter => {
    typeMap[filter]?.forEach(type => types.add(type));
  });

  return Array.from(types);
}

// Helper: Get activity types based on hangout style
function getActivityTypes(hangout: string): string[] {
  const activityMap: Record<string, string[]> = {
    'Formal': ['museum', 'art_gallery', 'theater', 'concert_hall'],
    'Chill': ['park', 'cafe', 'bookstore', 'bowling_alley', 'movie_theater'],
    'Date': ['park', 'movie_theater', 'art_gallery', 'wine_bar', 'scenic_overlook'],
    'N/A': ['park', 'museum', 'shopping_mall', 'entertainment'],
  };

  return activityMap[hangout] || activityMap['N/A'];
}

// Main GrassMax Logic
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filters, userLocation } = body as {
      filters: Filters;
      userLocation: { lat: number; lng: number };
    };

    // Validate input
    if (!filters || !userLocation) {
      return NextResponse.json(
        { success: false, error: 'Missing filters or user location' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Google Maps API key not configured' },
        { status: 500 }
      );
    }

    // Step 1: Query dining spots
    const diningTypes = getDiningType(filters.dining);
    const diningQuery = diningTypes.join('|');

    const nearbySearchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${userLocation.lat},${userLocation.lng}&radius=2000&type=${diningQuery}&key=${apiKey}`;

    const diningResponse = await fetch(nearbySearchUrl);
    const diningData = await diningResponse.json();

    if (diningData.status !== 'OK' || !diningData.results) {
      return NextResponse.json(
        { success: false, error: 'No dining spots found' },
        { status: 404 }
      );
    }

    // Filter for 4.5+ stars
    let diningSpots = diningData.results.filter(
      (place: any) => place.rating >= 4.5
    );

    // Step 2: Get detailed info for top dining spots (to check reviews)
    const topDiningSpots = diningSpots.slice(0, 5);
    const detailedDiningSpots = await Promise.all(
      topDiningSpots.map(async (place: any) => {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,user_ratings_total,price_level,geometry,formatted_address,types,reviews,photos,opening_hours&key=${apiKey}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();
        return detailsData.result;
      })
    );

    // Step 3: Prioritize romantic spots if Date is selected
    if (filters.hangout === 'Date') {
      detailedDiningSpots.sort((a, b) => {
        const aRomantic = hasRomanticKeywords(a.reviews || []);
        const bRomantic = hasRomanticKeywords(b.reviews || []);

        if (aRomantic && !bRomantic) return -1;
        if (!aRomantic && bRomantic) return 1;
        return b.rating - a.rating; // Fallback to rating
      });
    } else {
      // Sort by rating
      detailedDiningSpots.sort((a, b) => b.rating - a.rating);
    }

    const selectedDining = detailedDiningSpots[0];
    if (!selectedDining) {
      return NextResponse.json(
        { success: false, error: 'No suitable dining spot found' },
        { status: 404 }
      );
    }

    // Step 4: Query activities near the dining spot
    const activityTypes = getActivityTypes(filters.hangout);
    const activityQuery = activityTypes.join('|');

    const activitySearchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${selectedDining.geometry.location.lat},${selectedDining.geometry.location.lng}&radius=2000&type=${activityQuery}&key=${apiKey}`;

    const activityResponse = await fetch(activitySearchUrl);
    const activityData = await activityResponse.json();

    if (activityData.status !== 'OK' || !activityData.results) {
      return NextResponse.json(
        { success: false, error: 'No activities found' },
        { status: 404 }
      );
    }

    // Filter activities for 4.5+ stars and within 2km of dining spot
    const activities = activityData.results
      .filter((place: any) => {
        if (place.rating < 4.5) return false;

        const distance = calculateDistance(
          selectedDining.geometry.location.lat,
          selectedDining.geometry.location.lng,
          place.geometry.location.lat,
          place.geometry.location.lng
        );

        return distance <= 2;
      })
      .sort((a: any, b: any) => b.rating - a.rating);

    const selectedActivity = activities[0];
    if (!selectedActivity) {
      return NextResponse.json(
        { success: false, error: 'No suitable activity found' },
        { status: 404 }
      );
    }

    // Get detailed info for selected activity
    const activityDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${selectedActivity.place_id}&fields=name,rating,user_ratings_total,price_level,geometry,formatted_address,types,reviews,photos,opening_hours&key=${apiKey}`;
    const activityDetailsResponse = await fetch(activityDetailsUrl);
    const activityDetailsData = await activityDetailsResponse.json();
    const detailedActivity = activityDetailsData.result;

    // Step 5: Create Plan object
    const diningSpot: Place = {
      placeId: selectedDining.place_id,
      name: selectedDining.name,
      address: selectedDining.formatted_address,
      rating: selectedDining.rating,
      userRatingsTotal: selectedDining.user_ratings_total,
      priceLevel: selectedDining.price_level,
      location: {
        lat: selectedDining.geometry.location.lat,
        lng: selectedDining.geometry.location.lng,
      },
      types: selectedDining.types,
      photos: selectedDining.photos?.slice(0, 3).map((photo: any) =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`
      ),
      reviews: selectedDining.reviews?.slice(0, 3),
      openingHours: selectedDining.opening_hours,
    };

    const activity: Place = {
      placeId: detailedActivity.place_id,
      name: detailedActivity.name,
      address: detailedActivity.formatted_address,
      rating: detailedActivity.rating,
      userRatingsTotal: detailedActivity.user_ratings_total,
      priceLevel: detailedActivity.price_level,
      location: {
        lat: detailedActivity.geometry.location.lat,
        lng: detailedActivity.geometry.location.lng,
      },
      types: detailedActivity.types,
      photos: detailedActivity.photos?.slice(0, 3).map((photo: any) =>
        `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${apiKey}`
      ),
      reviews: detailedActivity.reviews?.slice(0, 3),
      openingHours: detailedActivity.opening_hours,
    };

    const totalDistance = calculateDistance(
      diningSpot.location.lat,
      diningSpot.location.lng,
      activity.location.lat,
      activity.location.lng
    );

    const plan: Plan = {
      id: `plan_${Date.now()}`,
      diningSpot,
      activity,
      filters,
      createdAt: new Date(),
      totalDistance,
    };

    const response: GrassMaxResponse = {
      success: true,
      plan,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('GrassMax error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
