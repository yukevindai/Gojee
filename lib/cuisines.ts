export interface Cuisine {
  id: string;
  name: string;
  keywords: string[]; // For Google Places API search
  emoji?: string;
}

export const CUISINES: Cuisine[] = [
  { id: 'japanese', name: 'Japanese', keywords: ['japanese', 'sushi', 'ramen', 'izakaya'], emoji: '🍱' },
  { id: 'korean', name: 'Korean', keywords: ['korean', 'kbbq', 'bibimbap'], emoji: '🍜' },
  { id: 'chinese', name: 'Chinese', keywords: ['chinese', 'dim sum', 'cantonese', 'szechuan'], emoji: '🥟' },
  { id: 'thai', name: 'Thai', keywords: ['thai', 'pad thai', 'curry'], emoji: '🍛' },
  { id: 'vietnamese', name: 'Vietnamese', keywords: ['vietnamese', 'pho', 'banh mi'], emoji: '🍲' },
  { id: 'indian', name: 'Indian', keywords: ['indian', 'curry', 'tandoori', 'biryani'], emoji: '🍛' },
  { id: 'mexican', name: 'Mexican', keywords: ['mexican', 'taco', 'burrito', 'enchilada'], emoji: '🌮' },
  { id: 'italian', name: 'Italian', keywords: ['italian', 'pizza', 'pasta', 'trattoria'], emoji: '🍝' },
  { id: 'mediterranean', name: 'Mediterranean', keywords: ['mediterranean', 'greek', 'falafel', 'hummus'], emoji: '🥙' },
  { id: 'middle-eastern', name: 'Middle Eastern', keywords: ['middle eastern', 'lebanese', 'shawarma', 'kebab'], emoji: '🥙' },
  { id: 'french', name: 'French', keywords: ['french', 'bistro', 'brasserie', 'crepe'], emoji: '🥐' },
  { id: 'american', name: 'American', keywords: ['american', 'burger', 'bbq', 'steakhouse'], emoji: '🍔' },
  { id: 'seafood', name: 'Seafood', keywords: ['seafood', 'fish', 'oyster', 'sushi'], emoji: '🦞' },
  { id: 'vegetarian', name: 'Vegetarian', keywords: ['vegetarian', 'vegan', 'plant-based'], emoji: '🥗' },
  { id: 'bakery', name: 'Bakery & Cafe', keywords: ['bakery', 'cafe', 'coffee', 'pastry'], emoji: '🥐' },
  { id: 'fusion', name: 'Fusion', keywords: ['fusion', 'modern', 'contemporary'], emoji: '🍽️' },
];

export const DIETARY_PREFERENCES = [
  { id: 'vegetarian', name: 'Vegetarian', emoji: '🥗' },
  { id: 'vegan', name: 'Vegan', emoji: '🌱' },
  { id: 'halal', name: 'Halal', emoji: '☪️' },
  { id: 'kosher', name: 'Kosher', emoji: '✡️' },
  { id: 'gluten-free', name: 'Gluten-Free', emoji: '🌾' },
];

export const SPICE_LEVELS = [
  { id: 'none', name: 'No Spice', emoji: '😊' },
  { id: 'mild', name: 'Mild', emoji: '🌶️' },
  { id: 'medium', name: 'Medium', emoji: '🌶️🌶️' },
  { id: 'hot', name: 'Hot', emoji: '🌶️🌶️🌶️' },
];

export interface UserPreferences {
  cuisines: string[]; // cuisine IDs
  dietary: string[]; // dietary restriction IDs
  spiceLevel?: string; // spice level ID
}

// Helper function to get cuisine keywords for search
export function getCuisineKeywords(cuisineIds: string[]): string {
  if (cuisineIds.length === 0) return '';

  const keywords = cuisineIds
    .map(id => CUISINES.find(c => c.id === id))
    .filter(Boolean)
    .flatMap(c => c!.keywords);

  return keywords.join(' ');
}

// Helper function to check if a place matches dietary preferences
export function matchesDietaryPreferences(
  placeTypes: string[] | undefined,
  dietary: string[]
): boolean {
  if (dietary.length === 0) return true;
  if (!placeTypes) return false;

  // Check if place has tags matching dietary preferences
  const dietaryKeywords = dietary
    .map(d => DIETARY_PREFERENCES.find(pref => pref.id === d)?.name.toLowerCase())
    .filter((keyword): keyword is string => keyword !== undefined);

  // Check if any place type matches dietary keywords
  return dietaryKeywords.some(keyword =>
    placeTypes.some(type => type.includes(keyword))
  );
}
