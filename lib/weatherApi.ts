/**
 * Weather API integration using free services:
 * - Weather.gov (NWS) for U.S. regions (no API key required)
 * - Open-Meteo for international regions (no API key required)
 */

export interface WeatherData {
  temperatureF: number;
  temperatureC: number;
  snowedToday: boolean;
  snowedYesterday: boolean;
  conditions: string;
  location: {
    lat: number;
    lng: number;
  };
}

/**
 * Check if coordinates are within the United States
 */
function isUSLocation(lat: number, lng: number): boolean {
  // Rough bounds for continental US, Alaska, and Hawaii
  const continentalUS = lat >= 24.396308 && lat <= 49.384358 && lng >= -125.0 && lng <= -66.93457;
  const alaska = lat >= 51.0 && lat <= 71.5 && lng >= -179.0 && lng <= -129.0;
  const hawaii = lat >= 18.0 && lat <= 23.0 && lng >= -161.0 && lng <= -154.0;

  return continentalUS || alaska || hawaii;
}

/**
 * Fetch weather data from Weather.gov (NWS) API for U.S. locations
 */
async function fetchWeatherFromNWS(lat: number, lng: number): Promise<WeatherData> {
  try {
    // Step 1: Get the grid point for this location
    const pointResponse = await fetch(
      `https://api.weather.gov/points/${lat.toFixed(4)},${lng.toFixed(4)}`,
      {
        headers: {
          'User-Agent': '(GrassMaxxing App, contact@grassmaxxing.com)', // NWS requires User-Agent
        },
      }
    );

    if (!pointResponse.ok) {
      throw new Error(`NWS point API error: ${pointResponse.status}`);
    }

    const pointData = await pointResponse.json();
    const forecastUrl = pointData.properties.forecast;
    const observationStationsUrl = pointData.properties.observationStations;

    // Step 2: Get observation stations
    const stationsResponse = await fetch(observationStationsUrl, {
      headers: {
        'User-Agent': '(GrassMaxxing App, contact@grassmaxxing.com)',
      },
    });

    if (!stationsResponse.ok) {
      throw new Error(`NWS stations API error: ${stationsResponse.status}`);
    }

    const stationsData = await stationsResponse.json();
    const firstStation = stationsData.features?.[0]?.id;

    if (!firstStation) {
      throw new Error('No observation station found');
    }

    // Step 3: Get current observations from the nearest station
    const obsResponse = await fetch(`${firstStation}/observations/latest`, {
      headers: {
        'User-Agent': '(GrassMaxxing App, contact@grassmaxxing.com)',
      },
    });

    if (!obsResponse.ok) {
      throw new Error(`NWS observations API error: ${obsResponse.status}`);
    }

    const obsData = await obsResponse.json();
    const props = obsData.properties;

    // Get temperature in Celsius and convert to Fahrenheit
    const tempC = props.temperature?.value || 15; // Default 15°C if not available
    const tempF = (tempC * 9) / 5 + 32;

    // Check for snow/precipitation
    const textDescription = props.textDescription?.toLowerCase() || '';
    const precipitationLast6Hours = props.precipitationLast6Hours?.value || 0;

    // Check if it's currently snowing or there was snow recently
    const snowedToday = textDescription.includes('snow') ||
                        (precipitationLast6Hours > 0 && tempF <= 35);

    // For yesterday's snow, we'd need historical data which NWS doesn't provide easily
    // We'll approximate by checking if there's snow accumulation
    const snowedYesterday = (props.snowDepth?.value || 0) > 0;

    return {
      temperatureF: Math.round(tempF),
      temperatureC: Math.round(tempC),
      snowedToday,
      snowedYesterday,
      conditions: props.textDescription || 'Unknown',
      location: { lat, lng },
    };
  } catch (error) {
    console.error('Error fetching NWS weather:', error);
    throw error;
  }
}

/**
 * Fetch weather data from Open-Meteo API for international locations
 */
async function fetchWeatherFromOpenMeteo(lat: number, lng: number): Promise<WeatherData> {
  try {
    // Get current weather and today's forecast
    const currentUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,snowfall,weather_code&daily=precipitation_sum,snowfall_sum&timezone=auto&forecast_days=2`;

    const response = await fetch(currentUrl);

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data = await response.json();

    // Current temperature
    const tempC = data.current.temperature_2m;
    const tempF = (tempC * 9) / 5 + 32;

    // Current snowfall
    const currentSnowfall = data.current.snowfall || 0;
    const currentPrecipitation = data.current.precipitation || 0;

    // Daily snowfall/precipitation (index 0 = today, index 1 = tomorrow)
    const todaySnowfall = data.daily.snowfall_sum?.[0] || 0;
    const yesterdaySnowfall = data.daily.snowfall_sum?.[1] || 0; // Note: we only get today and tomorrow, not yesterday

    // Determine snow conditions
    const snowedToday = currentSnowfall > 0 || todaySnowfall > 0;

    // For yesterday, we approximate using current conditions
    // If there's current snowfall and temp is cold, assume it may have snowed yesterday too
    const snowedYesterday = (currentSnowfall > 0 && tempF <= 35) || yesterdaySnowfall > 0;

    // Weather code to description (simplified)
    const weatherCode = data.current.weather_code;
    let conditions = 'Clear';
    if (weatherCode >= 71 && weatherCode <= 77) conditions = 'Snowing';
    else if (weatherCode >= 61 && weatherCode <= 67) conditions = 'Raining';
    else if (weatherCode >= 51 && weatherCode <= 57) conditions = 'Drizzle';
    else if (weatherCode >= 80 && weatherCode <= 82) conditions = 'Rain Showers';
    else if (weatherCode >= 95 && weatherCode <= 99) conditions = 'Thunderstorm';
    else if (weatherCode >= 1 && weatherCode <= 3) conditions = 'Partly Cloudy';
    else if (weatherCode === 45 || weatherCode === 48) conditions = 'Foggy';

    return {
      temperatureF: Math.round(tempF),
      temperatureC: Math.round(tempC),
      snowedToday,
      snowedYesterday,
      conditions,
      location: { lat, lng },
    };
  } catch (error) {
    console.error('Error fetching Open-Meteo weather:', error);
    throw error;
  }
}

/**
 * Fetch current weather data for a location
 * Automatically selects the appropriate API based on location
 */
export async function fetchWeatherData(lat: number, lng: number): Promise<WeatherData | null> {
  try {
    // Check if location is in the U.S.
    if (isUSLocation(lat, lng)) {
      console.log('Using Weather.gov (NWS) for U.S. location');
      return await fetchWeatherFromNWS(lat, lng);
    } else {
      console.log('Using Open-Meteo for international location');
      return await fetchWeatherFromOpenMeteo(lat, lng);
    }
  } catch (error) {
    console.error('Error fetching weather data:', error);

    // Return null on error - weather features will gracefully degrade
    return null;
  }
}

/**
 * Get weather data with caching to avoid excessive API calls
 * Cache expires after 1 hour
 */
const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export async function getWeatherData(lat: number, lng: number): Promise<WeatherData | null> {
  // Create cache key based on rounded coordinates (to ~1km precision)
  const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;

  // Check cache
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Using cached weather data');
    return cached.data;
  }

  // Fetch fresh data
  const weatherData = await fetchWeatherData(lat, lng);

  // Cache the result
  if (weatherData) {
    weatherCache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now(),
    });
  }

  return weatherData;
}
