import type { Place } from './places';

export interface SavedLocation {
  id: string;
  place: Place;
  savedAt: number; // timestamp
  category: 'restaurant' | 'activity' | 'park' | 'cafe' | 'other';
}

const SAVED_LOCATIONS_KEY = 'grassmaxxing_saved_locations';

export function getSavedLocations(): SavedLocation[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(SAVED_LOCATIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading saved locations:', error);
  }

  return [];
}

export function saveLocation(place: Place, category?: SavedLocation['category']): SavedLocation {
  const savedLocations = getSavedLocations();

  // Check if location already saved (by place ID)
  const existingIndex = savedLocations.findIndex(sl => sl.place.id === place.id);

  if (existingIndex !== -1) {
    // Already saved, just update timestamp
    savedLocations[existingIndex] = {
      ...savedLocations[existingIndex],
      savedAt: Date.now(),
    };
  } else {
    // Determine category from place types if not provided
    const autoCategory = category || inferCategory(place);

    // Add new saved location
    const newSavedLocation: SavedLocation = {
      id: `saved-loc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      place,
      savedAt: Date.now(),
      category: autoCategory,
    };
    savedLocations.unshift(newSavedLocation); // Add to beginning
  }

  try {
    localStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(savedLocations));
  } catch (error) {
    console.error('Error saving location:', error);
  }

  return savedLocations[0];
}

export function unsaveLocation(placeId: string): boolean {
  const savedLocations = getSavedLocations();
  const filteredLocations = savedLocations.filter(sl => sl.place.id !== placeId);

  if (filteredLocations.length === savedLocations.length) {
    return false; // Location not found
  }

  try {
    localStorage.setItem(SAVED_LOCATIONS_KEY, JSON.stringify(filteredLocations));
    return true;
  } catch (error) {
    console.error('Error unsaving location:', error);
    return false;
  }
}

export function isLocationSaved(placeId: string): boolean {
  const savedLocations = getSavedLocations();
  return savedLocations.some(sl => sl.place.id === placeId);
}

function inferCategory(place: Place): SavedLocation['category'] {
  const types = place.types || [];

  // Restaurant/dining
  if (types.some(t => ['restaurant', 'cafe', 'bakery', 'meal_delivery', 'meal_takeaway'].includes(t))) {
    if (types.includes('cafe') || types.includes('bakery')) {
      return 'cafe';
    }
    return 'restaurant';
  }

  // Parks
  if (types.some(t => ['park', 'natural_feature'].includes(t))) {
    return 'park';
  }

  // Activities (museums, entertainment, etc.)
  if (types.some(t => [
    'museum', 'art_gallery', 'amusement_park', 'aquarium', 'zoo',
    'movie_theater', 'bowling_alley', 'gym', 'spa', 'stadium',
    'night_club', 'bar', 'casino', 'arcade', 'tourist_attraction'
  ].includes(t))) {
    return 'activity';
  }

  return 'other';
}
