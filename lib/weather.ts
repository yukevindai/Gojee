export type Season = 'winter' | 'spring' | 'summer' | 'fall';
export type TemperatureLevel = 'cold' | 'moderate' | 'warm' | 'hot' | 'extreme';

export interface WeatherPreferences {
  season: Season;
  temperature: TemperatureLevel;
  favorBeaches: boolean;
  favorParks: boolean;
  favorIndoor: boolean;
  reduceDistance: boolean;
}

/**
 * Get current season based on month (Northern Hemisphere)
 */
export function getCurrentSeason(): Season {
  const month = new Date().getMonth(); // 0-11

  if (month >= 2 && month <= 4) return 'spring'; // March-May
  if (month >= 5 && month <= 7) return 'summer'; // June-August
  if (month >= 8 && month <= 10) return 'fall'; // September-November
  return 'winter'; // December-February
}

/**
 * Categorize temperature into levels
 */
export function categorizeTemperature(tempF: number): TemperatureLevel {
  if (tempF >= 95) return 'extreme'; // 95°F+
  if (tempF >= 85) return 'hot'; // 85-94°F
  if (tempF >= 65) return 'warm'; // 65-84°F
  if (tempF >= 50) return 'moderate'; // 50-64°F
  return 'cold'; // Below 50°F
}

/**
 * Get weather-based preferences for plan generation
 * Can optionally use actual temperature if available
 */
export function getWeatherPreferences(actualTempF?: number): WeatherPreferences {
  const season = getCurrentSeason();

  // Use actual temperature if provided, otherwise estimate based on season
  let temperature: TemperatureLevel;
  if (actualTempF !== undefined) {
    temperature = categorizeTemperature(actualTempF);
  } else {
    // Estimate temperature based on season
    switch (season) {
      case 'summer':
        temperature = 'hot';
        break;
      case 'spring':
      case 'fall':
        temperature = 'moderate';
        break;
      case 'winter':
        temperature = 'cold';
        break;
    }
  }

  // Determine preferences based on season and temperature
  const favorBeaches = (season === 'summer' || season === 'spring') &&
                       (temperature === 'warm' || temperature === 'hot');

  const favorParks = (season === 'fall' || season === 'winter') ||
                     (temperature === 'moderate' || temperature === 'warm');

  const favorIndoor = temperature === 'extreme' || temperature === 'hot';

  const reduceDistance = temperature === 'extreme' || temperature === 'hot';

  return {
    season,
    temperature,
    favorBeaches,
    favorParks,
    favorIndoor,
    reduceDistance,
  };
}

/**
 * Get winter-specific side quest suggestions
 */
export function getWinterSideQuests(): Array<{ name: string; description: string; duration: number }> {
  return [
    {
      name: 'Build a Snowman',
      description: 'Find a snowy spot and build a snowman together',
      duration: 30,
    },
    {
      name: 'Snow Angels',
      description: 'Make snow angels in fresh powder',
      duration: 15,
    },
    {
      name: 'Hot Chocolate Stop',
      description: 'Warm up with hot chocolate at a cozy spot',
      duration: 20,
    },
    {
      name: 'Holiday Lights',
      description: 'Check out festive holiday light displays',
      duration: 25,
    },
  ];
}

/**
 * Check if a venue type is primarily indoor
 */
export function isIndoorVenue(types: string[]): boolean {
  const indoorTypes = [
    'museum', 'art_gallery', 'library', 'aquarium',
    'shopping_mall', 'movie_theater', 'bowling_alley',
    'gym', 'spa', 'arcade', 'performing_arts_theater',
    'casino', 'night_club', 'bar', 'restaurant', 'cafe',
  ];

  return types.some(type => indoorTypes.includes(type));
}

/**
 * Check if a venue type is primarily outdoor
 */
export function isOutdoorVenue(types: string[]): boolean {
  const outdoorTypes = [
    'park', 'beach', 'national_park', 'campground',
    'natural_feature', 'pier', 'stadium', 'zoo',
    'amusement_park', 'tourist_attraction',
  ];

  return types.some(type => outdoorTypes.includes(type));
}
