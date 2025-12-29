export interface Filters {
  partySize: string;
  dining: string[];
  hangout: string;
}

export interface Place {
  placeId: string;
  name: string;
  address: string;
  rating: number;
  userRatingsTotal: number;
  priceLevel?: number;
  location: {
    lat: number;
    lng: number;
  };
  types: string[];
  photos?: string[];
  reviews?: Array<{
    text: string;
    rating: number;
  }>;
  openingHours?: {
    openNow: boolean;
    weekdayText?: string[];
  };
}

export interface Plan {
  id: string;
  diningSpot: Place;
  activity: Place;
  filters: Filters;
  createdAt: Date;
  totalDistance: number; // in km
}

export interface GrassMaxResponse {
  success: boolean;
  plan?: Plan;
  error?: string;
}
