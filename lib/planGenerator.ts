import type { Place } from './places';

export interface ActivityStep {
  type: 'dining' | 'hangout';
  place: Place;
  duration: number; // in minutes
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  steps: ActivityStep[];
  totalDuration: number; // in minutes
  estimatedCost: number; // 1-4 ($-$$$$)
  vibe: string; // casual, romantic, adventurous, etc.
  distance: number; // distance between venues in meters
  distanceCategory: 'walking' | 'bussing' | 'driving';
  sideQuest?: ActivityStep; // Optional side quest (e.g., bubble tea, coffee)
}

export interface GeneratePlansOptions {
  diningPlaces: Place[];
  hangoutPlaces: Place[];
  hangoutType: string; // 'Formal', 'Chill', 'Date', 'N/A'
  partySize: string;
  coffeeShops?: Place[]; // Optional coffee/bubble tea shops for side quests
}

function calculateDistance(place1: Place, place2: Place): number {
  // Haversine formula for distance between two lat/lng points
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (place1.location.lat * Math.PI) / 180;
  const φ2 = (place2.location.lat * Math.PI) / 180;
  const Δφ = ((place2.location.lat - place1.location.lat) * Math.PI) / 180;
  const Δλ = ((place2.location.lng - place1.location.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

function categorizeDistance(distance: number): 'walking' | 'bussing' | 'driving' {
  if (distance <= 1500) return 'walking'; // 0-1.5km
  if (distance <= 5000) return 'bussing'; // 1.5-5km
  return 'driving'; // 5km+
}

function getHangoutDuration(hangoutType: string): number {
  switch (hangoutType) {
    case 'park':
      return 60; // 1 hour walk in park
    case 'movie_theater':
      return 150; // 2.5 hours for movie
    case 'amusement_park':
      return 180; // 3 hours at arcade/amusement
    default:
      return 90; // Default 1.5 hours
  }
}

function getDiningDuration(partySize: string): number {
  const size = parseInt(partySize) || 2;
  if (size >= 6) return 90; // Large groups take longer
  if (size >= 4) return 75;
  return 60; // Couples/small groups
}

function getPlanName(dining: Place, hangout: Place, index: number): string {
  // Determine dining type based on place types
  let diningType = 'Dining';
  if (dining.types?.includes('cafe') || dining.types?.includes('bakery')) {
    diningType = 'Cafe';
  } else if (dining.types?.includes('bar')) {
    diningType = 'Drinks';
  } else if (dining.types?.includes('fast_food')) {
    diningType = 'Quick Bite';
  } else if (dining.types?.includes('restaurant')) {
    diningType = 'Meal';
  }

  // Determine hangout activity based on place types
  let hangoutActivity = 'Activity';
  if (hangout.types?.includes('park')) {
    hangoutActivity = 'Park Visit';
  } else if (hangout.types?.includes('movie_theater')) {
    hangoutActivity = 'Movie';
  } else if (hangout.types?.includes('amusement_park') || hangout.types?.includes('bowling_alley')) {
    hangoutActivity = 'Fun & Games';
  } else if (hangout.types?.includes('museum') || hangout.types?.includes('art_gallery')) {
    hangoutActivity = 'Culture';
  } else if (hangout.types?.includes('bar')) {
    hangoutActivity = 'Drinks';
  }

  // Create unique name using short versions of place names
  const diningShort = dining.name.split(' ').slice(0, 2).join(' ');
  const hangoutShort = hangout.name.split(' ').slice(0, 2).join(' ');

  // Alternate between different name patterns for variety
  const patterns = [
    `${diningType} at ${diningShort}`,
    `${hangoutActivity} & ${diningType}`,
    `${diningShort} + ${hangoutActivity}`,
  ];

  return patterns[index % patterns.length];
}

function getPlanDescription(dining: Place, hangout: Place, vibe: string): string {
  return `Start with ${vibe} dining at ${dining.name}, then head to ${hangout.name} for a great time.`;
}

function getVibeFromHangout(hangoutType: string, formality: string): string {
  if (formality === 'Date') return 'romantic';
  if (formality === 'Formal') return 'upscale';

  if (hangoutType === 'park') return 'relaxed';
  if (hangoutType === 'movie_theater') return 'classic';
  if (hangoutType === 'amusement_park') return 'fun';

  return 'casual';
}

export function generatePlans(options: GeneratePlansOptions): Plan[] {
  const { diningPlaces, hangoutPlaces, hangoutType, partySize, coffeeShops } = options;
  const plans: Plan[] = [];
  const usedDiningIds = new Set<string>(); // Track used dining locations
  const usedHangoutIds = new Set<string>(); // Track used hangout locations
  const usedSideQuestIds = new Set<string>(); // Track used side quest locations

  // Limit to top 10 dining and 10 hangout places for combinations
  const topDining = diningPlaces.slice(0, 10);
  const topHangout = hangoutPlaces.slice(0, 10);

  // Generate combinations
  let planIndex = 0;
  for (const dining of topDining) {
    for (const hangout of topHangout) {
      // Skip if either location has already been used in another plan
      if (usedDiningIds.has(dining.id) || usedHangoutIds.has(hangout.id)) {
        continue;
      }

      // Check proximity - venues should be within 10km
      const distance = calculateDistance(dining, hangout);
      if (distance > 10000) continue; // Skip if too far (>10km)

      const distanceCategory = categorizeDistance(distance);
      const diningDuration = getDiningDuration(partySize);
      const hangoutDuration = getHangoutDuration(
        hangout.types?.[0] || 'entertainment'
      );

      const vibe = getVibeFromHangout(
        hangout.types?.[0] || 'entertainment',
        hangoutType
      );

      const avgCost = Math.round(
        ((dining.priceLevel || 2) + (hangout.priceLevel || 2)) / 2
      );

      // Add travel time based on distance category
      let travelTime = 15; // Default 15 min
      if (distanceCategory === 'driving') travelTime = 20;
      else if (distanceCategory === 'bussing') travelTime = 15;
      else if (distanceCategory === 'walking') travelTime = 10;

      // Find a nearby side quest location (coffee, arcade, gym, etc.)
      let sideQuest: ActivityStep | undefined;
      if (coffeeShops && coffeeShops.length > 0) {
        // Find side quest within 1.5km of either dining or hangout location
        // that hasn't been used yet
        const nearbySideQuest = coffeeShops.find((shop) => {
          // Skip if this side quest has already been used
          if (usedSideQuestIds.has(shop.id)) return false;

          const distanceToDining = calculateDistance(shop, dining);
          const distanceToHangout = calculateDistance(shop, hangout);
          // Within 1.5km of either location
          return distanceToDining <= 1500 || distanceToHangout <= 1500;
        });

        if (nearbySideQuest) {
          sideQuest = {
            type: 'hangout',
            place: nearbySideQuest,
            duration: 20, // 20 min for side quest
          };
          // Mark this side quest as used
          usedSideQuestIds.add(nearbySideQuest.id);
        }
      }

      const planId = `${dining.id}-${hangout.id}`;
      const plan: Plan = {
        id: planId,
        name: getPlanName(dining, hangout, planIndex),
        description: getPlanDescription(dining, hangout, vibe),
        steps: [
          {
            type: 'dining',
            place: dining,
            duration: diningDuration,
          },
          {
            type: 'hangout',
            place: hangout,
            duration: hangoutDuration,
          },
        ],
        totalDuration: diningDuration + hangoutDuration + travelTime + (sideQuest ? 25 : 0), // +25 for side quest (20min + 5min travel)
        estimatedCost: avgCost,
        vibe,
        distance,
        distanceCategory,
        sideQuest,
      };

      plans.push(plan);
      // Mark these locations as used
      usedDiningIds.add(dining.id);
      usedHangoutIds.add(hangout.id);
      planIndex++;
    }
  }

  // Sort by rating combination and limit to top 5 plans
  plans.sort((a, b) => {
    const ratingA =
      (a.steps[0].place.rating || 0) + (a.steps[1].place.rating || 0);
    const ratingB =
      (b.steps[0].place.rating || 0) + (b.steps[1].place.rating || 0);
    return ratingB - ratingA;
  });

  return plans.slice(0, 5); // Return top 5 plans
}

export function getHangoutPlaceTypes(hangoutType: string): string[] {
  switch (hangoutType) {
    case 'Formal':
      return ['museum', 'art_gallery', 'theater'];
    case 'Date':
      return ['park', 'movie_theater', 'bowling_alley'];
    case 'Chill':
      return ['park', 'cafe', 'bar'];
    default:
      return ['park', 'movie_theater', 'amusement_park', 'bowling_alley'];
  }
}
