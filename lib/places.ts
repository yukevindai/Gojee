export interface Place {
  id: string;
  name: string;
  address: string;
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  photos?: string[];
  location: {
    lat: number;
    lng: number;
  };
  types?: string[];
  openNow?: boolean;
}

export interface SearchFilters {
  partySize: string;
  dining: string[];
  hangout: string;
  location: {
    lat: number;
    lng: number;
  };
  planType?: 'morning' | 'afternoon' | 'fullday' | 'single';
  cuisines?: string[]; // cuisine IDs
}

export function getPlaceType(diningOptions: string[]): string[] {
  const typeMap: Record<string, string[]> = {
    'Breakfast': ['restaurant', 'cafe', 'bakery'],
    'Lunch': ['restaurant', 'cafe'],
    'Dinner': ['restaurant', 'bar'],
    'Quick bite': ['fast_food', 'cafe', 'sandwich_shop'],
    'Snack': ['cafe', 'bakery', 'convenience_store'],
    'Dessert': ['bakery', 'cafe', 'ice_cream_shop'],
  };

  const types = new Set<string>();

  if (diningOptions.length === 0) {
    return ['restaurant', 'cafe', 'bar'];
  }

  diningOptions.forEach(option => {
    const mappedTypes = typeMap[option] || ['restaurant'];
    mappedTypes.forEach(type => types.add(type));
  });

  return Array.from(types);
}

export function getSearchKeyword(filters: SearchFilters): string {
  const { dining, hangout } = filters;

  // Build keyword based on filters
  const keywords: string[] = [];

  if (dining.length > 0) {
    keywords.push(...dining);
  }

  if (hangout && hangout !== 'N/A') {
    if (hangout === 'Formal') {
      keywords.push('fine dining', 'upscale');
    } else if (hangout === 'Chill') {
      keywords.push('casual', 'relaxed');
    } else if (hangout === 'Date') {
      keywords.push('romantic', 'intimate');
    }
  }

  return keywords.join(' ') || 'restaurant';
}
