// Custom Google Maps styling to de-emphasize the base map
// This makes app-specific elements (markers, routes) stand out more

export const deemphasizedMapStyle: google.maps.MapTypeStyle[] = [
  // Reduce saturation and lighten overall map
  {
    featureType: 'all',
    elementType: 'all',
    stylers: [
      { saturation: -80 },
      { lightness: 20 },
      { gamma: 0.8 }
    ]
  },
  // Simplify roads
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [
      { lightness: 30 },
      { saturation: -100 }
    ]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [
      { color: '#9ca3af' }
    ]
  },
  // De-emphasize POIs (points of interest)
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [
      { visibility: 'off' }
    ]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [
      { lightness: 40 },
      { saturation: -60 }
    ]
  },
  // Soften water
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [
      { color: '#e0f2fe' },
      { lightness: 10 }
    ]
  },
  // Reduce transit visibility
  {
    featureType: 'transit',
    elementType: 'labels',
    stylers: [
      { visibility: 'off' }
    ]
  },
  // Soften landscape
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [
      { lightness: 30 },
      { saturation: -40 }
    ]
  }
];
