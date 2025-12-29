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
}

export interface GeneratePlansOptions {
  diningPlaces: Place[];
  hangoutPlaces: Place[];
  hangoutType: string; // 'Formal', 'Chill', 'Date', 'N/A'
  partySize: string;
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

function getPlanName(dining: Place, hangout: Place): string {
  const diningType = dining.types?.includes('restaurant') ? 'Dinner' : 'Food';
  const hangoutName = hangout.types?.includes('park')
    ? 'Park Stroll'
    : hangout.types?.includes('movie_theater')
    ? 'Movie'
    : hangout.types?.includes('amusement_park')
    ? 'Arcade Fun'
    : 'Hangout';

  return `${diningType} & ${hangoutName}`;
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
  const { diningPlaces, hangoutPlaces, hangoutType, partySize } = options;
  const plans: Plan[] = [];

  // Limit to top 3 dining and 3 hangout places for combinations
  const topDining = diningPlaces.slice(0, 3);
  const topHangout = hangoutPlaces.slice(0, 3);

  // Generate combinations
  for (const dining of topDining) {
    for (const hangout of topHangout) {
      // Check proximity - venues should be within 3km
      const distance = calculateDistance(dining, hangout);
      if (distance > 3000) continue; // Skip if too far

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

      const plan: Plan = {
        id: `${dining.id}-${hangout.id}`,
        name: getPlanName(dining, hangout),
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
        totalDuration: diningDuration + hangoutDuration + 15, // +15 min for travel
        estimatedCost: avgCost,
        vibe,
      };

      plans.push(plan);
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
