/**
 * Creative and fun plan name generator
 */

// Name templates for different plan types and vibes
const dateNightNames = [
  'Romantic Rendezvous',
  'Love is in the Air',
  'Cupid\'s Adventure',
  'Hearts & Butterflies',
  'Moonlight Escapade',
  'Sweet Chemistry',
  'Sparks & Smiles',
  'Enchanted Evening',
  'Flirty & Thirty',
  'Date Night Magic',
  'Chemistry Check',
  'Lovebirds\' Journey',
  'First Kiss Vibes',
  'Dinner & Dazzle',
  'Romance Central',
];

const morningNames = [
  'Rise & Shine',
  'Early Bird Special',
  'Sunrise Seeker',
  'Morning Glory',
  'Breakfast Club',
  'AM Adventure',
  'Sunny Side Up',
  'Dawn Patrol',
  'Fresh Start',
  'Wakey Wakey',
  'Good Morning Sunshine',
  'Crack of Dawn',
  'Rooster\'s Revenge',
  'Coffee First',
  'Bright & Early',
];

const afternoonNames = [
  'Midday Madness',
  'Afternoon Delight',
  'Lunch Rush',
  'Golden Hour Hunt',
  'Siesta Skippers',
  'High Noon Hustle',
  'Daylight Darlings',
  'Sunshine Squad',
  'PM Power Move',
  'No Time to Snooze',
  'Afternoon Antics',
  'Sunny Side Quest',
  'Lunchtime Legends',
  'Midday Mischief',
  'Post-Lunch Party',
];

const fullDayNames = [
  'Epic Marathon',
  'All-Day Odyssey',
  'Sunrise to Sunset',
  'The Full Monty',
  'Dawn to Dusk',
  'Grand Adventure',
  'Ultimate Experience',
  'Full Send',
  'No Breaks Allowed',
  'From Zero to Hero',
  'All In',
  'Maximum Effort',
  'Non-Stop Action',
  'The Whole Shebang',
  'Extreme Edition',
  'Beast Mode',
  'Go Big or Go Home',
  'Champion\'s Journey',
];

const casualNames = [
  'Chill Vibes Only',
  'Laid Back Lane',
  'Easy Does It',
  'Low-Key Fun',
  'No Stress Express',
  'Relaxation Station',
  'Keep it Simple',
  'Casual Friday',
  'Comfort Zone',
  'Breeze Mode',
];

const formalNames = [
  'Fancy Pants',
  'Class Act',
  'Sophisticated Soirée',
  'Elite Experience',
  'VIP Treatment',
  'High Society',
  'Upscale Escape',
  'Bougie Brilliance',
  'Refined & Fabulous',
  'Luxury Lane',
];

const foodieNames = [
  'Flavor Town Express',
  'Taste Bud Safari',
  'Culinary Quest',
  'Food Coma Central',
  'Nom Nom Nation',
  'Feast Mode',
  'Yum Yum Adventure',
  'Belly Filler',
  'Snack Attack',
  'Foodie Paradise',
];

const activityFocusedNames = [
  'Adventure Awaits',
  'Thrill Seeker',
  'Explorer\'s Paradise',
  'Action Jackson',
  'Fun Run',
  'Wild Card',
  'Let\'s Get Lost',
  'Spontaneous Combustion',
  'YOLO Mode',
  'Bucket List Buster',
];

// Seasonal and weather-based additions
const summerNames = [
  'Beach Vibes',
  'Summer Lovin\'',
  'Sun-Kissed',
  'Hot Girl Summer',
  'Endless Summer',
];

const winterNames = [
  'Winter Wonderland',
  'Cozy Season',
  'Frosty Fun',
  'Snow Day',
  'Warm & Fuzzy',
];

const rainyNames = [
  'Rain or Shine',
  'Puddle Jumpers',
  'Indoor Warriors',
  'Cloudy with Fun',
];

const hotWeatherNames = [
  'Beat the Heat',
  'Cool Down Crew',
  'AC Appreciation',
  'Stay Chill',
];

interface PlanContext {
  planType: 'date' | 'morning' | 'afternoon' | 'fullday' | 'dining' | 'activity';
  vibe?: 'formal' | 'chill' | 'fun' | 'romantic';
  weather?: {
    season?: 'winter' | 'spring' | 'summer' | 'fall';
    temperature?: 'cold' | 'moderate' | 'warm' | 'hot' | 'extreme';
    favorIndoor?: boolean;
  };
  hasDining?: boolean;
  hasActivities?: boolean;
  index: number;
}

/**
 * Generate a creative plan name based on context
 */
export function generateCreativePlanName(context: PlanContext): string {
  const { planType, vibe, weather, hasDining, hasActivities, index } = context;

  let namePool: string[] = [];

  // Base names by plan type
  switch (planType) {
    case 'date':
      namePool = [...dateNightNames];
      if (vibe === 'formal') namePool.push(...formalNames);
      if (vibe === 'chill') namePool.push(...casualNames);
      break;
    case 'morning':
      namePool = [...morningNames];
      break;
    case 'afternoon':
      namePool = [...afternoonNames];
      break;
    case 'fullday':
      namePool = [...fullDayNames];
      break;
    case 'dining':
      namePool = [...foodieNames];
      break;
    case 'activity':
      namePool = [...activityFocusedNames];
      break;
  }

  // Add vibe-specific names
  if (vibe === 'formal' && !namePool.includes(formalNames[0])) {
    namePool.push(...formalNames.slice(0, 3));
  } else if (vibe === 'chill' && !namePool.includes(casualNames[0])) {
    namePool.push(...casualNames.slice(0, 3));
  }

  // Add food-focused if dining heavy
  if (hasDining && planType !== 'dining') {
    namePool.push(...foodieNames.slice(0, 2));
  }

  // Add activity-focused if activity heavy
  if (hasActivities && planType !== 'activity') {
    namePool.push(...activityFocusedNames.slice(0, 2));
  }

  // Add seasonal flavor
  if (weather?.season === 'summer') {
    namePool.push(...summerNames);
  } else if (weather?.season === 'winter') {
    namePool.push(...winterNames);
  }

  // Add weather-based names
  if (weather?.favorIndoor) {
    namePool.push(...hotWeatherNames);
  }

  // Use index to deterministically pick a name (so same filters = same name)
  // But ensure variety by using modulo
  const nameIndex = index % namePool.length;
  return namePool[nameIndex];
}

/**
 * Add a descriptive subtitle to the plan name
 */
export function addPlanSubtitle(baseName: string, venues: string[]): string {
  if (venues.length === 0) return baseName;

  // Create a short venue description
  const venueList = venues
    .slice(0, 2) // Max 2 venues in subtitle
    .map(v => v.split(' ')[0]) // First word of each venue
    .join(' → ');

  return `${baseName}: ${venueList}`;
}
