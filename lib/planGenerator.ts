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
  sideQuests?: ActivityStep[]; // Optional side quests (e.g., bubble tea, coffee, etc.)
}

export interface GeneratePlansOptions {
  breakfastPlaces?: Place[];
  lunchPlaces?: Place[];
  dinnerPlaces?: Place[];
  hangoutPlaces: Place[];
  hangoutType: string; // 'Formal', 'Chill', 'Date', 'N/A'
  partySize: string;
  sideQuestPlaces?: Place[]; // Optional side quest venues (coffee, arcade, gym, etc.)
  planType: 'morning' | 'afternoon' | 'fullday' | 'single'; // Type of plan to generate
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
  const { breakfastPlaces = [], lunchPlaces = [], dinnerPlaces = [], hangoutPlaces, hangoutType, partySize, sideQuestPlaces = [], planType } = options;

  // For backward compatibility, if old parameters are passed
  const diningPlaces = (options as any).diningPlaces || [];
  const coffeeShops = (options as any).coffeeShops || sideQuestPlaces;

  // If using old interface (single dining type)
  if (diningPlaces.length > 0 && planType === 'single') {
    return generateSinglePlans({ diningPlaces, hangoutPlaces, hangoutType, partySize, sideQuestPlaces: coffeeShops });
  }

  // Generate plans based on plan type
  switch (planType) {
    case 'morning':
      return generateMorningPlans({ breakfastPlaces, lunchPlaces, hangoutPlaces, hangoutType, partySize, sideQuestPlaces });
    case 'afternoon':
      return generateAfternoonPlans({ lunchPlaces, dinnerPlaces, hangoutPlaces, hangoutType, partySize, sideQuestPlaces });
    case 'fullday':
      return generateFullDayPlans({ breakfastPlaces, lunchPlaces, dinnerPlaces, hangoutPlaces, hangoutType, partySize, sideQuestPlaces });
    case 'single':
    default:
      // Use first available dining category
      const singleDining = dinnerPlaces.length > 0 ? dinnerPlaces : (lunchPlaces.length > 0 ? lunchPlaces : breakfastPlaces);
      return generateSinglePlans({ diningPlaces: singleDining, hangoutPlaces, hangoutType, partySize, sideQuestPlaces });
  }
}

function generateSinglePlans(params: {
  diningPlaces: Place[];
  hangoutPlaces: Place[];
  hangoutType: string;
  partySize: string;
  sideQuestPlaces: Place[];
}): Plan[] {
  const { diningPlaces, hangoutPlaces, hangoutType, partySize, sideQuestPlaces } = params;
  const plans: Plan[] = [];
  const usedDiningIds = new Set<string>();
  const usedHangoutIds = new Set<string>();
  const usedSideQuestIds = new Set<string>();

  const topDining = diningPlaces.slice(0, 10);
  const topHangout = hangoutPlaces.slice(0, 10);

  let planIndex = 0;
  for (const dining of topDining) {
    for (const hangout of topHangout) {
      if (usedDiningIds.has(dining.id) || usedHangoutIds.has(hangout.id)) {
        continue;
      }

      const distance = calculateDistance(dining, hangout);
      if (distance > 10000) continue;

      const distanceCategory = categorizeDistance(distance);
      const diningDuration = getDiningDuration(partySize);
      const hangoutDuration = getHangoutDuration(hangout.types?.[0] || 'entertainment');

      const vibe = getVibeFromHangout(hangout.types?.[0] || 'entertainment', hangoutType);
      const avgCost = Math.round(((dining.priceLevel || 2) + (hangout.priceLevel || 2)) / 2);

      let travelTime = 15;
      if (distanceCategory === 'driving') travelTime = 20;
      else if (distanceCategory === 'bussing') travelTime = 15;
      else if (distanceCategory === 'walking') travelTime = 10;

      // Find nearby side quests (1-3 based on availability)
      const sideQuests: ActivityStep[] = [];
      if (sideQuestPlaces && sideQuestPlaces.length > 0) {
        const nearbySideQuests = sideQuestPlaces.filter((shop) => {
          if (usedSideQuestIds.has(shop.id)) return false;
          const distanceToDining = calculateDistance(shop, dining);
          const distanceToHangout = calculateDistance(shop, hangout);
          return distanceToDining <= 1500 || distanceToHangout <= 1500;
        }).slice(0, 3);

        nearbySideQuests.forEach(quest => {
          sideQuests.push({
            type: 'hangout',
            place: quest,
            duration: 20,
          });
          usedSideQuestIds.add(quest.id);
        });
      }

      const planId = `${dining.id}-${hangout.id}`;
      const plan: Plan = {
        id: planId,
        name: getPlanName(dining, hangout, planIndex),
        description: getPlanDescription(dining, hangout, vibe),
        steps: [
          { type: 'dining', place: dining, duration: diningDuration },
          { type: 'hangout', place: hangout, duration: hangoutDuration },
        ],
        totalDuration: diningDuration + hangoutDuration + travelTime + (sideQuests.length * 25),
        estimatedCost: avgCost,
        vibe,
        distance,
        distanceCategory,
        sideQuests: sideQuests.length > 0 ? sideQuests : undefined,
      };

      plans.push(plan);
      usedDiningIds.add(dining.id);
      usedHangoutIds.add(hangout.id);
      planIndex++;
    }
  }

  plans.sort((a, b) => {
    const ratingA = a.steps.reduce((sum, step) => sum + (step.place.rating || 0), 0);
    const ratingB = b.steps.reduce((sum, step) => sum + (step.place.rating || 0), 0);
    return ratingB - ratingA;
  });

  return plans.slice(0, 5);
}

function generateMorningPlans(params: {
  breakfastPlaces: Place[];
  lunchPlaces: Place[];
  hangoutPlaces: Place[];
  hangoutType: string;
  partySize: string;
  sideQuestPlaces: Place[];
}): Plan[] {
  const { breakfastPlaces, lunchPlaces, hangoutPlaces, hangoutType, partySize, sideQuestPlaces } = params;
  const plans: Plan[] = [];
  const usedIds = new Set<string>();

  const topBreakfast = breakfastPlaces.slice(0, 8);
  const topLunch = lunchPlaces.slice(0, 8);
  const topHangout = hangoutPlaces.slice(0, 8);

  let planIndex = 0;
  for (const breakfast of topBreakfast) {
    for (const hangout of topHangout) {
      for (const lunch of topLunch) {
        const allIds = [breakfast.id, hangout.id, lunch.id];
        if (allIds.some(id => usedIds.has(id))) continue;

        // Check total distance
        const dist1 = calculateDistance(breakfast, hangout);
        const dist2 = calculateDistance(hangout, lunch);
        const totalDistance = dist1 + dist2;
        if (totalDistance > 15000) continue;

        const steps: ActivityStep[] = [
          { type: 'dining', place: breakfast, duration: 45 },
          { type: 'hangout', place: hangout, duration: 60 },
          { type: 'dining', place: lunch, duration: 60 },
        ];

        // Find side quests
        const sideQuests = findSideQuests(sideQuestPlaces, [breakfast, hangout, lunch], usedIds, 2);

        const avgCost = Math.round(((breakfast.priceLevel || 2) + (hangout.priceLevel || 2) + (lunch.priceLevel || 2)) / 3);
        const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0) + 40 + (sideQuests.length * 25);

        const plan: Plan = {
          id: `morning-${planIndex}`,
          name: `Morning: ${breakfast.name.split(' ')[0]} → ${hangout.name.split(' ')[0]}`,
          description: `Start with breakfast at ${breakfast.name}, enjoy ${hangout.name}, then lunch at ${lunch.name}.`,
          steps,
          totalDuration,
          estimatedCost: avgCost,
          vibe: getVibeFromHangout(hangout.types?.[0] || 'park', hangoutType),
          distance: totalDistance,
          distanceCategory: categorizeDistance(totalDistance / 2),
          sideQuests: sideQuests.length > 0 ? sideQuests : undefined,
        };

        plans.push(plan);
        allIds.forEach(id => usedIds.add(id));
        planIndex++;
        if (plans.length >= 5) break;
      }
      if (plans.length >= 5) break;
    }
    if (plans.length >= 5) break;
  }

  return sortAndLimitPlans(plans);
}

function generateAfternoonPlans(params: {
  lunchPlaces: Place[];
  dinnerPlaces: Place[];
  hangoutPlaces: Place[];
  hangoutType: string;
  partySize: string;
  sideQuestPlaces: Place[];
}): Plan[] {
  const { lunchPlaces, dinnerPlaces, hangoutPlaces, hangoutType, partySize, sideQuestPlaces } = params;
  const plans: Plan[] = [];
  const usedIds = new Set<string>();

  const topLunch = lunchPlaces.slice(0, 8);
  const topDinner = dinnerPlaces.slice(0, 8);
  const topHangout = hangoutPlaces.slice(0, 12);

  let planIndex = 0;
  for (const lunch of topLunch) {
    for (let i = 0; i < topHangout.length - 1; i++) {
      const hangout1 = topHangout[i];
      const hangout2 = topHangout[i + 1];
      for (const dinner of topDinner) {
        const allIds = [lunch.id, hangout1.id, hangout2.id, dinner.id];
        if (allIds.some(id => usedIds.has(id))) continue;

        const dist1 = calculateDistance(lunch, hangout1);
        const dist2 = calculateDistance(hangout1, hangout2);
        const dist3 = calculateDistance(hangout2, dinner);
        const totalDistance = dist1 + dist2 + dist3;
        if (totalDistance > 20000) continue;

        const steps: ActivityStep[] = [
          { type: 'dining', place: lunch, duration: 60 },
          { type: 'hangout', place: hangout1, duration: 75 },
          { type: 'hangout', place: hangout2, duration: 75 },
          { type: 'dining', place: dinner, duration: getDiningDuration(partySize) },
        ];

        const sideQuests = findSideQuests(sideQuestPlaces, [lunch, hangout1, hangout2, dinner], usedIds, 3);

        const avgCost = Math.round(((lunch.priceLevel || 2) + (hangout1.priceLevel || 2) + (hangout2.priceLevel || 2) + (dinner.priceLevel || 2)) / 4);
        const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0) + 60 + (sideQuests.length * 25);

        const plan: Plan = {
          id: `afternoon-${planIndex}`,
          name: `Afternoon: ${lunch.name.split(' ')[0]} → ${hangout1.name.split(' ')[0]}`,
          description: `Lunch at ${lunch.name}, activities at ${hangout1.name} and ${hangout2.name}, then dinner at ${dinner.name}.`,
          steps,
          totalDuration,
          estimatedCost: avgCost,
          vibe: getVibeFromHangout(hangout1.types?.[0] || 'park', hangoutType),
          distance: totalDistance,
          distanceCategory: categorizeDistance(totalDistance / 3),
          sideQuests: sideQuests.length > 0 ? sideQuests : undefined,
        };

        plans.push(plan);
        allIds.forEach(id => usedIds.add(id));
        planIndex++;
        if (plans.length >= 5) break;
      }
      if (plans.length >= 5) break;
    }
    if (plans.length >= 5) break;
  }

  return sortAndLimitPlans(plans);
}

function generateFullDayPlans(params: {
  breakfastPlaces: Place[];
  lunchPlaces: Place[];
  dinnerPlaces: Place[];
  hangoutPlaces: Place[];
  hangoutType: string;
  partySize: string;
  sideQuestPlaces: Place[];
}): Plan[] {
  const { breakfastPlaces, lunchPlaces, dinnerPlaces, hangoutPlaces, hangoutType, partySize, sideQuestPlaces } = params;
  const plans: Plan[] = [];
  const usedIds = new Set<string>();

  const topBreakfast = breakfastPlaces.slice(0, 5);
  const topLunch = lunchPlaces.slice(0, 5);
  const topDinner = dinnerPlaces.slice(0, 5);
  const topHangout = hangoutPlaces.slice(0, 15);

  let planIndex = 0;
  for (const breakfast of topBreakfast) {
    for (const lunch of topLunch) {
      for (const dinner of topDinner) {
        if (topHangout.length < 3) break;

        // Use three different hangout locations
        const hangout1 = topHangout[0];
        const hangout2 = topHangout[1];
        const hangout3 = topHangout[2];

        const allIds = [breakfast.id, hangout1.id, lunch.id, hangout2.id, hangout3.id, dinner.id];
        if (allIds.some(id => usedIds.has(id))) continue;

        const dist1 = calculateDistance(breakfast, hangout1);
        const dist2 = calculateDistance(hangout1, lunch);
        const dist3 = calculateDistance(lunch, hangout2);
        const dist4 = calculateDistance(hangout2, hangout3);
        const dist5 = calculateDistance(hangout3, dinner);
        const totalDistance = dist1 + dist2 + dist3 + dist4 + dist5;
        if (totalDistance > 30000) continue; // Increased limit for 6 stops

        const steps: ActivityStep[] = [
          { type: 'dining', place: breakfast, duration: 45 },
          { type: 'hangout', place: hangout1, duration: 60 },
          { type: 'dining', place: lunch, duration: 60 },
          { type: 'hangout', place: hangout2, duration: 75 },
          { type: 'hangout', place: hangout3, duration: 75 },
          { type: 'dining', place: dinner, duration: getDiningDuration(partySize) },
        ];

        const sideQuests = findSideQuests(sideQuestPlaces, [breakfast, hangout1, lunch, hangout2, hangout3, dinner], usedIds, 4);

        const avgCost = Math.round(
          ((breakfast.priceLevel || 2) + (hangout1.priceLevel || 2) + (lunch.priceLevel || 2) + (hangout2.priceLevel || 2) + (hangout3.priceLevel || 2) + (dinner.priceLevel || 2)) / 6
        );
        const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0) + 100 + (sideQuests.length * 25);

        const plan: Plan = {
          id: `fullday-${planIndex}`,
          name: `Full Day: ${breakfast.name.split(' ')[0]} to ${dinner.name.split(' ')[0]}`,
          description: `Complete day from breakfast at ${breakfast.name} to dinner at ${dinner.name} with multiple activities.`,
          steps,
          totalDuration,
          estimatedCost: avgCost,
          vibe: getVibeFromHangout(hangout1.types?.[0] || 'park', hangoutType),
          distance: totalDistance,
          distanceCategory: categorizeDistance(totalDistance / 5),
          sideQuests: sideQuests.length > 0 ? sideQuests : undefined,
        };

        plans.push(plan);
        allIds.forEach(id => usedIds.add(id));
        planIndex++;
        if (plans.length >= 5) break;
      }
      if (plans.length >= 5) break;
    }
    if (plans.length >= 5) break;
  }

  return sortAndLimitPlans(plans);
}

function findSideQuests(
  sideQuestPlaces: Place[],
  mainPlaces: Place[],
  usedIds: Set<string>,
  maxQuests: number
): ActivityStep[] {
  const sideQuests: ActivityStep[] = [];

  for (const quest of sideQuestPlaces) {
    if (usedIds.has(quest.id)) continue;
    if (sideQuests.length >= maxQuests) break;

    // Check if within 1.5km of any main location
    const isNearby = mainPlaces.some(place => {
      const distance = calculateDistance(quest, place);
      return distance <= 1500;
    });

    if (isNearby) {
      sideQuests.push({
        type: 'hangout',
        place: quest,
        duration: 20,
      });
      usedIds.add(quest.id);
    }
  }

  return sideQuests;
}

function sortAndLimitPlans(plans: Plan[]): Plan[] {
  plans.sort((a, b) => {
    const ratingA = a.steps.reduce((sum, step) => sum + (step.place.rating || 0), 0);
    const ratingB = b.steps.reduce((sum, step) => sum + (step.place.rating || 0), 0);
    return ratingB - ratingA;
  });

  return plans.slice(0, 5);
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
