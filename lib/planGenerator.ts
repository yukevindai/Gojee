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
  numberOfPlans?: number; // Number of plans to generate (default 5)
  startTime?: string; // Optional start time (e.g., "9 AM")
  endTime?: string; // Optional end time (e.g., "5 PM")
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

// Convert time string like "9 AM" or "5 PM" to minutes from midnight
function timeToMinutes(timeStr: string): number {
  const match = timeStr.match(/^(\d+)\s*(AM|PM)$/i);
  if (!match) return 0;

  let hours = parseInt(match[1]);
  const period = match[2].toUpperCase();

  if (period === 'PM' && hours !== 12) {
    hours += 12;
  } else if (period === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60;
}

// Check if a plan fits within the specified time window
export function planFitsTimeWindow(plan: Plan, startTime?: string, endTime?: string): boolean {
  if (!startTime && !endTime) return true; // No time constraints

  const startMinutes = startTime ? timeToMinutes(startTime) : 0;
  const endMinutes = endTime ? timeToMinutes(endTime) : 24 * 60;

  // Calculate available time window
  const availableTime = endMinutes - startMinutes;

  // Check if plan duration fits within the available time window
  // We're being flexible here - as long as the plan can fit within the time window,
  // we consider it valid (the plan can start anytime within the window as long as it fits)
  if (plan.totalDuration > availableTime) {
    return false;
  }

  return true;
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
  const { breakfastPlaces = [], lunchPlaces = [], dinnerPlaces = [], hangoutPlaces, hangoutType, partySize, sideQuestPlaces = [], planType, numberOfPlans = 5, startTime, endTime } = options;

  // For backward compatibility, if old parameters are passed
  const diningPlaces = (options as any).diningPlaces || [];
  const coffeeShops = (options as any).coffeeShops || sideQuestPlaces;

  let plans: Plan[] = [];

  // If using old interface (single dining type)
  if (diningPlaces.length > 0 && planType === 'single') {
    plans = generateSinglePlans({ diningPlaces, hangoutPlaces, hangoutType, partySize, sideQuestPlaces: coffeeShops, numberOfPlans });
  } else {
    // Generate plans based on plan type
    switch (planType) {
      case 'morning':
        plans = generateMorningPlans({ breakfastPlaces, lunchPlaces, hangoutPlaces, hangoutType, partySize, sideQuestPlaces, numberOfPlans });
        break;
      case 'afternoon':
        plans = generateAfternoonPlans({ lunchPlaces, dinnerPlaces, hangoutPlaces, hangoutType, partySize, sideQuestPlaces, numberOfPlans });
        break;
      case 'fullday':
        plans = generateFullDayPlans({ breakfastPlaces, lunchPlaces, dinnerPlaces, hangoutPlaces, hangoutType, partySize, sideQuestPlaces, numberOfPlans });
        break;
      case 'single':
      default:
        // Use first available dining category
        const singleDining = dinnerPlaces.length > 0 ? dinnerPlaces : (lunchPlaces.length > 0 ? lunchPlaces : breakfastPlaces);
        plans = generateSinglePlans({ diningPlaces: singleDining, hangoutPlaces, hangoutType, partySize, sideQuestPlaces, numberOfPlans });
        break;
    }
  }

  // Filter plans based on time constraints if specified
  if (startTime || endTime) {
    plans = plans.filter(plan => planFitsTimeWindow(plan, startTime, endTime));
  }

  return plans;
}

function generateSinglePlans(params: {
  diningPlaces: Place[];
  hangoutPlaces: Place[];
  hangoutType: string;
  partySize: string;
  sideQuestPlaces: Place[];
  numberOfPlans: number;
}): Plan[] {
  const { diningPlaces, hangoutPlaces, hangoutType, partySize, sideQuestPlaces, numberOfPlans } = params;
  const candidatePlans: Plan[] = [];
  const usedSideQuestIds = new Set<string>();

  // Scale pool sizes based on number of plans requested (with larger buffer to account for filtering)
  const poolSize = Math.min(numberOfPlans * 4, 60);
  const topDining = diningPlaces.slice(0, poolSize);
  const topHangout = hangoutPlaces.slice(0, poolSize);

  let planIndex = 0;
  for (const dining of topDining) {
    for (const hangout of topHangout) {
      const distance = calculateDistance(dining, hangout);
      // Keep main locations closer together (max 8km - relaxed from 5km)
      if (distance > 8000) continue;

      const distanceCategory = categorizeDistance(distance);
      const diningDuration = getDiningDuration(partySize);
      const hangoutDuration = getHangoutDuration(hangout.types?.[0] || 'entertainment');

      const vibe = getVibeFromHangout(hangout.types?.[0] || 'entertainment', hangoutType);
      const avgCost = Math.round(((dining.priceLevel || 2) + (hangout.priceLevel || 2)) / 2);

      let travelTime = 15;
      if (distanceCategory === 'driving') travelTime = 20;
      else if (distanceCategory === 'bussing') travelTime = 15;
      else if (distanceCategory === 'walking') travelTime = 10;

      // Find side quests: limit to 1-2 per plan to ensure enough plans can be created
      const sideQuests: ActivityStep[] = [];
      if (sideQuestPlaces && sideQuestPlaces.length > 0) {
        // First, find close side quests (within 2km)
        const closeSideQuests = sideQuestPlaces.filter((shop) => {
          if (usedSideQuestIds.has(shop.id)) return false;
          const distanceToDining = calculateDistance(shop, dining);
          const distanceToHangout = calculateDistance(shop, hangout);
          return distanceToDining <= 2000 || distanceToHangout <= 2000;
        }).slice(0, 1);

        // Then, find 1 farther side quest for variety (within 5km)
        const farSideQuests = sideQuestPlaces.filter((shop) => {
          if (usedSideQuestIds.has(shop.id)) return false;
          if (closeSideQuests.some(close => close.id === shop.id)) return false;
          const distanceToDining = calculateDistance(shop, dining);
          const distanceToHangout = calculateDistance(shop, hangout);
          return (distanceToDining > 2000 && distanceToDining <= 5000) ||
                 (distanceToHangout > 2000 && distanceToHangout <= 5000);
        }).slice(0, 1);

        // Combine close and far side quests (max 2 total)
        const allSideQuests = [...closeSideQuests, ...farSideQuests];
        allSideQuests.forEach(quest => {
          sideQuests.push({
            type: 'hangout',
            place: quest,
            duration: 20,
          });
          usedSideQuestIds.add(quest.id);
        });
      }

      // Don't require minimum side quests to ensure enough plans can be created
      // Plans can have 0-2 side quests

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

      candidatePlans.push(plan);
      planIndex++;
    }
  }

  // Sort all candidate plans by rating
  candidatePlans.sort((a, b) => {
    const ratingA = a.steps.reduce((sum, step) => sum + (step.place.rating || 0), 0);
    const ratingB = b.steps.reduce((sum, step) => sum + (step.place.rating || 0), 0);
    return ratingB - ratingA;
  });

  // Try to select plans with unique dining AND hangout venues first
  let finalPlans: Plan[] = [];
  let usedDiningIds = new Set<string>();
  let usedHangoutIds = new Set<string>();

  for (const plan of candidatePlans) {
    if (finalPlans.length >= numberOfPlans) break;

    const diningId = plan.steps[0].place.id;
    const hangoutId = plan.steps[1].place.id;

    // Skip if this dining or hangout venue is already used
    if (usedDiningIds.has(diningId) || usedHangoutIds.has(hangoutId)) {
      continue;
    }

    finalPlans.push(plan);
    usedDiningIds.add(diningId);
    usedHangoutIds.add(hangoutId);
  }

  // If we don't have enough plans with unique activities, fall back to only unique dining
  if (finalPlans.length < numberOfPlans) {
    finalPlans = [];
    usedDiningIds = new Set<string>();

    for (const plan of candidatePlans) {
      if (finalPlans.length >= numberOfPlans) break;

      const diningId = plan.steps[0].place.id;

      if (usedDiningIds.has(diningId)) {
        continue;
      }

      finalPlans.push(plan);
      usedDiningIds.add(diningId);
    }
  }

  return finalPlans;
}

function generateMorningPlans(params: {
  breakfastPlaces: Place[];
  lunchPlaces: Place[];
  hangoutPlaces: Place[];
  hangoutType: string;
  partySize: string;
  sideQuestPlaces: Place[];
  numberOfPlans: number;
}): Plan[] {
  const { breakfastPlaces, lunchPlaces, hangoutPlaces, hangoutType, partySize, sideQuestPlaces, numberOfPlans } = params;
  const candidatePlans: Plan[] = [];
  const usedSideQuestIds = new Set<string>();

  // Scale pool sizes based on number of plans requested (with larger buffer to account for filtering)
  const poolSize = Math.min(numberOfPlans * 3, 50);
  const topBreakfast = breakfastPlaces.slice(0, poolSize);
  const topLunch = lunchPlaces.slice(0, poolSize);
  const topHangout = hangoutPlaces.slice(0, poolSize);

  let planIndex = 0;
  for (const breakfast of topBreakfast) {
    for (const hangout of topHangout) {
      for (const lunch of topLunch) {
        const allIds = [breakfast.id, hangout.id, lunch.id];

        // Check for duplicates within this plan (e.g., same restaurant for breakfast and lunch)
        const uniqueIds = new Set(allIds);
        if (uniqueIds.size !== allIds.length) continue;

        // Check total distance - keep main locations closer together
        const dist1 = calculateDistance(breakfast, hangout);
        const dist2 = calculateDistance(hangout, lunch);
        const totalDistance = dist1 + dist2;
        // Relaxed from 10km to 15km to allow more plan combinations
        if (totalDistance > 15000) continue;

        const steps: ActivityStep[] = [
          { type: 'dining', place: breakfast, duration: 45 },
          { type: 'hangout', place: hangout, duration: 60 },
          { type: 'dining', place: lunch, duration: 60 },
        ];

        // Find side quests (1-2 per plan)
        const sideQuests = findSideQuests(sideQuestPlaces, [breakfast, hangout, lunch], usedSideQuestIds, 2);

        // Don't require minimum side quests to ensure enough plans can be created

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

        candidatePlans.push(plan);
        planIndex++;
      }
    }
  }

  // Sort all candidate plans by rating
  candidatePlans.sort((a, b) => {
    const ratingA = a.steps.reduce((sum, step) => sum + (step.place.rating || 0), 0);
    const ratingB = b.steps.reduce((sum, step) => sum + (step.place.rating || 0), 0);
    return ratingB - ratingA;
  });

  // Try to select plans with unique dining AND hangout venues first
  let finalPlans: Plan[] = [];
  let usedBreakfastIds = new Set<string>();
  let usedLunchIds = new Set<string>();
  let usedHangoutIds = new Set<string>();

  for (const plan of candidatePlans) {
    if (finalPlans.length >= numberOfPlans) break;

    const breakfastId = plan.steps[0].place.id;
    const hangoutId = plan.steps[1].place.id;
    const lunchId = plan.steps[2].place.id;

    // Skip if any venue is already used
    if (usedBreakfastIds.has(breakfastId) || usedHangoutIds.has(hangoutId) || usedLunchIds.has(lunchId)) {
      continue;
    }

    finalPlans.push(plan);
    usedBreakfastIds.add(breakfastId);
    usedHangoutIds.add(hangoutId);
    usedLunchIds.add(lunchId);
  }

  // If we don't have enough plans with unique activities, fall back to only unique dining
  if (finalPlans.length < numberOfPlans) {
    finalPlans = [];
    usedBreakfastIds = new Set<string>();
    usedLunchIds = new Set<string>();

    for (const plan of candidatePlans) {
      if (finalPlans.length >= numberOfPlans) break;

      const breakfastId = plan.steps[0].place.id;
      const lunchId = plan.steps[2].place.id;

      if (usedBreakfastIds.has(breakfastId) || usedLunchIds.has(lunchId)) {
        continue;
      }

      finalPlans.push(plan);
      usedBreakfastIds.add(breakfastId);
      usedLunchIds.add(lunchId);
    }
  }

  return finalPlans;
}

function generateAfternoonPlans(params: {
  lunchPlaces: Place[];
  dinnerPlaces: Place[];
  hangoutPlaces: Place[];
  hangoutType: string;
  partySize: string;
  sideQuestPlaces: Place[];
  numberOfPlans: number;
}): Plan[] {
  const { lunchPlaces, dinnerPlaces, hangoutPlaces, hangoutType, partySize, sideQuestPlaces, numberOfPlans } = params;
  const candidatePlans: Plan[] = [];
  const usedSideQuestIds = new Set<string>();

  // Scale pool sizes based on number of plans requested (with larger buffer to account for filtering)
  const poolSize = Math.min(numberOfPlans * 3, 50);
  const hangoutPoolSize = Math.min(numberOfPlans * 5, 70); // Need more hangouts (2 per plan) plus buffer
  const topLunch = lunchPlaces.slice(0, poolSize);
  const topDinner = dinnerPlaces.slice(0, poolSize);
  const topHangout = hangoutPlaces.slice(0, hangoutPoolSize);

  let planIndex = 0;
  for (const lunch of topLunch) {
    for (let i = 0; i < topHangout.length - 1; i++) {
      const hangout1 = topHangout[i];
      const hangout2 = topHangout[i + 1];
      for (const dinner of topDinner) {
        const allIds = [lunch.id, hangout1.id, hangout2.id, dinner.id];

        // Check for duplicates within this plan (e.g., same restaurant for lunch and dinner)
        const uniqueIds = new Set(allIds);
        if (uniqueIds.size !== allIds.length) continue;

        const dist1 = calculateDistance(lunch, hangout1);
        const dist2 = calculateDistance(hangout1, hangout2);
        const dist3 = calculateDistance(hangout2, dinner);
        const totalDistance = dist1 + dist2 + dist3;
        // Relaxed from 12km to 18km to allow more plan combinations
        if (totalDistance > 18000) continue;

        const steps: ActivityStep[] = [
          { type: 'dining', place: lunch, duration: 60 },
          { type: 'hangout', place: hangout1, duration: 75 },
          { type: 'hangout', place: hangout2, duration: 75 },
          { type: 'dining', place: dinner, duration: getDiningDuration(partySize) },
        ];

        // Find side quests (1-2 per plan)
        const sideQuests = findSideQuests(sideQuestPlaces, [lunch, hangout1, hangout2, dinner], usedSideQuestIds, 2);

        // Don't require minimum side quests to ensure enough plans can be created

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

        candidatePlans.push(plan);
        planIndex++;
      }
    }
  }

  // Sort all candidate plans by rating
  candidatePlans.sort((a, b) => {
    const ratingA = a.steps.reduce((sum, step) => sum + (step.place.rating || 0), 0);
    const ratingB = b.steps.reduce((sum, step) => sum + (step.place.rating || 0), 0);
    return ratingB - ratingA;
  });

  // Try to select plans with unique dining AND hangout venues first
  let finalPlans: Plan[] = [];
  let usedLunchIds = new Set<string>();
  let usedDinnerIds = new Set<string>();
  let usedHangoutIds = new Set<string>();

  for (const plan of candidatePlans) {
    if (finalPlans.length >= numberOfPlans) break;

    const lunchId = plan.steps[0].place.id;
    const hangout1Id = plan.steps[1].place.id;
    const hangout2Id = plan.steps[2].place.id;
    const dinnerId = plan.steps[3].place.id;

    // Skip if any venue is already used
    if (usedLunchIds.has(lunchId) || usedHangoutIds.has(hangout1Id) ||
        usedHangoutIds.has(hangout2Id) || usedDinnerIds.has(dinnerId)) {
      continue;
    }

    finalPlans.push(plan);
    usedLunchIds.add(lunchId);
    usedHangoutIds.add(hangout1Id);
    usedHangoutIds.add(hangout2Id);
    usedDinnerIds.add(dinnerId);
  }

  // If we don't have enough plans with unique activities, fall back to only unique dining
  if (finalPlans.length < numberOfPlans) {
    finalPlans = [];
    usedLunchIds = new Set<string>();
    usedDinnerIds = new Set<string>();

    for (const plan of candidatePlans) {
      if (finalPlans.length >= numberOfPlans) break;

      const lunchId = plan.steps[0].place.id;
      const dinnerId = plan.steps[3].place.id;

      if (usedLunchIds.has(lunchId) || usedDinnerIds.has(dinnerId)) {
        continue;
      }

      finalPlans.push(plan);
      usedLunchIds.add(lunchId);
      usedDinnerIds.add(dinnerId);
    }
  }

  return finalPlans;
}

function generateFullDayPlans(params: {
  breakfastPlaces: Place[];
  lunchPlaces: Place[];
  dinnerPlaces: Place[];
  hangoutPlaces: Place[];
  hangoutType: string;
  partySize: string;
  sideQuestPlaces: Place[];
  numberOfPlans: number;
}): Plan[] {
  const { breakfastPlaces, lunchPlaces, dinnerPlaces, hangoutPlaces, hangoutType, partySize, sideQuestPlaces, numberOfPlans } = params;
  const candidatePlans: Plan[] = [];
  const usedSideQuestIds = new Set<string>();

  // Scale pool sizes based on number of plans requested
  // For Full Day, use smaller pools to prevent performance issues from nested loops
  const diningPoolSize = Math.min(numberOfPlans * 2, 10); // Reduced from 50 to prevent freezing
  const hangoutPoolSize = Math.min(numberOfPlans * 5, 25); // Reduced from 100 to prevent freezing
  const topBreakfast = breakfastPlaces.slice(0, diningPoolSize);
  const topLunch = lunchPlaces.slice(0, diningPoolSize);
  const topDinner = dinnerPlaces.slice(0, diningPoolSize);
  const topHangout = hangoutPlaces.slice(0, hangoutPoolSize);

  let planIndex = 0;
  const maxCandidates = numberOfPlans * 50; // Limit to 50x the requested plans to prevent browser freeze

  // Iterate through different combinations of breakfast, lunch, dinner, and 3 hangouts
  outerLoop: for (const breakfast of topBreakfast) {
    for (const lunch of topLunch) {
      for (const dinner of topDinner) {
        // Need at least 3 hangout locations
        if (topHangout.length < 3) break;

        // Try different combinations of 3 hangout locations
        for (let i = 0; i < topHangout.length - 2; i++) {
          for (let j = i + 1; j < topHangout.length - 1; j++) {
            for (let k = j + 1; k < topHangout.length; k++) {
              // Early exit if we have enough candidates
              if (candidatePlans.length >= maxCandidates) {
                break outerLoop;
              }

              const hangout1 = topHangout[i];
              const hangout2 = topHangout[j];
              const hangout3 = topHangout[k];

              const allIds = [breakfast.id, hangout1.id, lunch.id, hangout2.id, hangout3.id, dinner.id];

              // Check for duplicates within this plan (e.g., same restaurant for multiple meals)
              const uniqueIds = new Set(allIds);
              if (uniqueIds.size !== allIds.length) continue;

              // Calculate total distance
              const dist1 = calculateDistance(breakfast, hangout1);
              const dist2 = calculateDistance(hangout1, lunch);
              const dist3 = calculateDistance(lunch, hangout2);
              const dist4 = calculateDistance(hangout2, hangout3);
              const dist5 = calculateDistance(hangout3, dinner);
              const totalDistance = dist1 + dist2 + dist3 + dist4 + dist5;

              // Relaxed from 20km to 25km to allow more plan combinations
              if (totalDistance > 25000) continue;

              const steps: ActivityStep[] = [
                { type: 'dining', place: breakfast, duration: 45 },
                { type: 'hangout', place: hangout1, duration: 60 },
                { type: 'dining', place: lunch, duration: 60 },
                { type: 'hangout', place: hangout2, duration: 75 },
                { type: 'hangout', place: hangout3, duration: 75 },
                { type: 'dining', place: dinner, duration: getDiningDuration(partySize) },
              ];

              // Find side quests (1-2 per plan)
              const sideQuests = findSideQuests(sideQuestPlaces, [breakfast, hangout1, lunch, hangout2, hangout3, dinner], usedSideQuestIds, 2);

              // Don't require minimum side quests to ensure enough plans can be created

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

              candidatePlans.push(plan);
              planIndex++;
            }
          }
        }
      }
    }
  }

  // Sort all candidate plans by rating
  candidatePlans.sort((a, b) => {
    const ratingA = a.steps.reduce((sum, step) => sum + (step.place.rating || 0), 0);
    const ratingB = b.steps.reduce((sum, step) => sum + (step.place.rating || 0), 0);
    return ratingB - ratingA;
  });

  // Try to select plans with unique dining AND hangout venues first
  let finalPlans: Plan[] = [];
  let usedBreakfastIds = new Set<string>();
  let usedLunchIds = new Set<string>();
  let usedDinnerIds = new Set<string>();
  let usedHangoutIds = new Set<string>();

  for (const plan of candidatePlans) {
    if (finalPlans.length >= numberOfPlans) break;

    const breakfastId = plan.steps[0].place.id;
    const hangout1Id = plan.steps[1].place.id;
    const lunchId = plan.steps[2].place.id;
    const hangout2Id = plan.steps[3].place.id;
    const hangout3Id = plan.steps[4].place.id;
    const dinnerId = plan.steps[5].place.id;

    // Skip if any venue is already used
    if (usedBreakfastIds.has(breakfastId) || usedLunchIds.has(lunchId) || usedDinnerIds.has(dinnerId) ||
        usedHangoutIds.has(hangout1Id) || usedHangoutIds.has(hangout2Id) || usedHangoutIds.has(hangout3Id)) {
      continue;
    }

    finalPlans.push(plan);
    usedBreakfastIds.add(breakfastId);
    usedLunchIds.add(lunchId);
    usedDinnerIds.add(dinnerId);
    usedHangoutIds.add(hangout1Id);
    usedHangoutIds.add(hangout2Id);
    usedHangoutIds.add(hangout3Id);
  }

  // If we don't have enough plans with unique activities, fall back to only unique dining
  if (finalPlans.length < numberOfPlans) {
    finalPlans = [];
    usedBreakfastIds = new Set<string>();
    usedLunchIds = new Set<string>();
    usedDinnerIds = new Set<string>();

    for (const plan of candidatePlans) {
      if (finalPlans.length >= numberOfPlans) break;

      const breakfastId = plan.steps[0].place.id;
      const lunchId = plan.steps[2].place.id;
      const dinnerId = plan.steps[5].place.id;

      if (usedBreakfastIds.has(breakfastId) || usedLunchIds.has(lunchId) || usedDinnerIds.has(dinnerId)) {
        continue;
      }

      finalPlans.push(plan);
      usedBreakfastIds.add(breakfastId);
      usedLunchIds.add(lunchId);
      usedDinnerIds.add(dinnerId);
    }
  }

  return finalPlans;
}

function findSideQuests(
  sideQuestPlaces: Place[],
  mainPlaces: Place[],
  usedIds: Set<string>,
  maxQuests: number
): ActivityStep[] {
  const sideQuests: ActivityStep[] = [];

  // First, find close side quests (within 2km of any main location)
  const closeSideQuests = sideQuestPlaces.filter(quest => {
    if (usedIds.has(quest.id)) return false;
    return mainPlaces.some(place => {
      const distance = calculateDistance(quest, place);
      return distance <= 2000;
    });
  });

  // Then, find farther side quests for variety (2-5km from main locations)
  const farSideQuests = sideQuestPlaces.filter(quest => {
    if (usedIds.has(quest.id)) return false;
    if (closeSideQuests.some(close => close.id === quest.id)) return false;
    return mainPlaces.some(place => {
      const distance = calculateDistance(quest, place);
      return distance > 2000 && distance <= 5000;
    });
  });

  // Take 1-2 side quests: prioritize close, but include 1 farther one for variety
  const numClose = Math.min(closeSideQuests.length, 1);
  const numFar = numClose < maxQuests ? Math.min(farSideQuests.length, 1) : 0;

  const selectedQuests = [
    ...closeSideQuests.slice(0, numClose),
    ...farSideQuests.slice(0, numFar)
  ];

  selectedQuests.forEach(quest => {
    sideQuests.push({
      type: 'hangout',
      place: quest,
      duration: 20,
    });
    usedIds.add(quest.id);
  });

  return sideQuests;
}

function sortAndLimitPlans(plans: Plan[], numberOfPlans: number): Plan[] {
  plans.sort((a, b) => {
    const ratingA = a.steps.reduce((sum, step) => sum + (step.place.rating || 0), 0);
    const ratingB = b.steps.reduce((sum, step) => sum + (step.place.rating || 0), 0);
    return ratingB - ratingA;
  });

  return plans.slice(0, numberOfPlans);
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

// Generate dining-only plans (multiple restaurants without activities)
export function generateDiningOnlyPlans(params: {
  breakfastPlaces?: Place[];
  lunchPlaces?: Place[];
  dinnerPlaces?: Place[];
  partySize: string;
  sideQuestPlaces?: Place[];
  numberOfPlans: number;
}): Plan[] {
  const { breakfastPlaces = [], lunchPlaces = [], dinnerPlaces = [], partySize, sideQuestPlaces = [], numberOfPlans } = params;
  const plans: Plan[] = [];
  const usedSideQuestIds = new Set<string>();

  // Combine all dining options
  const allDiningPlaces = [...breakfastPlaces, ...lunchPlaces, ...dinnerPlaces];
  if (allDiningPlaces.length === 0) return [];

  // Take top restaurants
  const topRestaurants = allDiningPlaces.slice(0, 30);

  let planIndex = 0;
  // Generate plans with 2-3 dining stops
  for (let i = 0; i < topRestaurants.length - 1; i++) {
    for (let j = i + 1; j < topRestaurants.length; j++) {
      const restaurant1 = topRestaurants[i];
      const restaurant2 = topRestaurants[j];

      // Check for duplicates
      if (restaurant1.id === restaurant2.id) continue;

      // Check distance between restaurants
      const distance = calculateDistance(restaurant1, restaurant2);
      if (distance > 8000) continue; // Max 8km between restaurants

      const steps: ActivityStep[] = [
        { type: 'dining', place: restaurant1, duration: getDiningDuration(partySize) },
        { type: 'dining', place: restaurant2, duration: getDiningDuration(partySize) },
      ];

      // Find side quests
      const sideQuests = findSideQuests(sideQuestPlaces, [restaurant1, restaurant2], usedSideQuestIds, 2);

      const avgCost = Math.round(((restaurant1.priceLevel || 2) + (restaurant2.priceLevel || 2)) / 2);
      const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0) + 20 + (sideQuests.length * 25);

      const plan: Plan = {
        id: `dining-${planIndex}`,
        name: `Dining Tour: ${restaurant1.name.split(' ')[0]} & ${restaurant2.name.split(' ')[0]}`,
        description: `Enjoy dining at ${restaurant1.name} and ${restaurant2.name}.`,
        steps,
        totalDuration,
        estimatedCost: avgCost,
        vibe: 'culinary',
        distance,
        distanceCategory: categorizeDistance(distance),
        sideQuests: sideQuests.length > 0 ? sideQuests : undefined,
      };

      plans.push(plan);
      planIndex++;

      if (plans.length >= numberOfPlans) break;
    }
    if (plans.length >= numberOfPlans) break;
  }

  return sortAndLimitPlans(plans, numberOfPlans);
}

// Generate activity-only plans (multiple activities without dining)
export function generateActivityOnlyPlans(params: {
  hangoutPlaces: Place[];
  hangoutType: string;
  partySize: string;
  sideQuestPlaces?: Place[];
  numberOfPlans: number;
}): Plan[] {
  const { hangoutPlaces, hangoutType, partySize, sideQuestPlaces = [], numberOfPlans } = params;
  const plans: Plan[] = [];
  const usedSideQuestIds = new Set<string>();

  if (hangoutPlaces.length === 0) return [];

  const topHangouts = hangoutPlaces.slice(0, 25);

  let planIndex = 0;
  // Generate plans with 2-3 activities
  for (let i = 0; i < topHangouts.length - 1; i++) {
    for (let j = i + 1; j < topHangouts.length; j++) {
      const activity1 = topHangouts[i];
      const activity2 = topHangouts[j];

      // Check for duplicates
      if (activity1.id === activity2.id) continue;

      // Check distance between activities
      const distance = calculateDistance(activity1, activity2);
      if (distance > 10000) continue; // Max 10km between activities

      const steps: ActivityStep[] = [
        { type: 'hangout', place: activity1, duration: getHangoutDuration(activity1.types?.[0] || 'entertainment') },
        { type: 'hangout', place: activity2, duration: getHangoutDuration(activity2.types?.[0] || 'entertainment') },
      ];

      // Find side quests
      const sideQuests = findSideQuests(sideQuestPlaces, [activity1, activity2], usedSideQuestIds, 2);

      const avgCost = Math.round(((activity1.priceLevel || 2) + (activity2.priceLevel || 2)) / 2);
      const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0) + 20 + (sideQuests.length * 25);
      const vibe = getVibeFromHangout(activity1.types?.[0] || 'entertainment', hangoutType);

      const plan: Plan = {
        id: `activity-${planIndex}`,
        name: `Activity Day: ${activity1.name.split(' ')[0]} & ${activity2.name.split(' ')[0]}`,
        description: `Explore ${activity1.name} and ${activity2.name}.`,
        steps,
        totalDuration,
        estimatedCost: avgCost,
        vibe,
        distance,
        distanceCategory: categorizeDistance(distance),
        sideQuests: sideQuests.length > 0 ? sideQuests : undefined,
      };

      plans.push(plan);
      planIndex++;

      if (plans.length >= numberOfPlans) break;
    }
    if (plans.length >= numberOfPlans) break;
  }

  return sortAndLimitPlans(plans, numberOfPlans);
}
