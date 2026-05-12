/**
 * Weather utility for FoamDial Pro.
 * Uses Open-Meteo (free, no API key) as primary source.
 * Falls back to realistic mock data if API fails.
 */

import { calculateDewPoint } from "@/lib/foam-calc";

export interface WeatherData {
  temp: number; // Fahrenheit
  humidity: number; // percentage 0-100
  conditions: string;
  windSpeed: number; // mph
  dewPoint: number; // Fahrenheit (calculated via Magnus formula)
  location: string;
  source: "open-meteo" | "mock";
}

/**
 * Fetch weather from Open-Meteo API (free, no API key needed).
 * Supports location-based lookup via geocoding.
 */
async function fetchOpenMeteo(lat: number, lon: number, locationName: string): Promise<WeatherData | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FChicago`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();
    const current = data.current;
    if (!current) return null;
    const temp = Math.round(current.temperature_2m);
    const humidity = Math.round(current.relative_humidity_2m);
    const windSpeed = Math.round(current.wind_speed_10m);
    const dewPoint = calculateDewPoint(temp, humidity);
    const conditions = weatherCodeToText(current.weather_code);
    return {
      temp,
      humidity,
      conditions,
      windSpeed,
      dewPoint: Math.round(dewPoint * 10) / 10,
      location: locationName,
      source: "open-meteo",
    };
  } catch {
    return null;
  }
}

/**
 * Geocode a location name using Open-Meteo geocoding API.
 */
export async function geocodeLocation(query: string): Promise<{ lat: number; lon: number; name: string } | null> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const result = data.results?.[0];
    if (!result) return null;
    return {
      lat: result.latitude,
      lon: result.longitude,
      name: `${result.name}, ${result.admin1 || result.country}`,
    };
  } catch {
    return null;
  }
}

function weatherCodeToText(code: number): string {
  const codes: Record<number, string> = {
    0: "Clear Skies",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing Rime Fog",
    51: "Light Drizzle",
    53: "Moderate Drizzle",
    55: "Dense Drizzle",
    61: "Slight Rain",
    63: "Moderate Rain",
    65: "Heavy Rain",
    71: "Slight Snow",
    73: "Moderate Snow",
    75: "Heavy Snow",
    77: "Snow Grains",
    80: "Slight Rain Showers",
    81: "Moderate Rain Showers",
    82: "Violent Rain Showers",
    85: "Slight Snow Showers",
    86: "Heavy Snow Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Slight Hail",
    99: "Thunderstorm with Heavy Hail",
  };
  return codes[code] || "Unknown";
}

/**
 * Generate realistic mock weather based on season/time for Tulsa.
 */
function getMockWeather(): WeatherData {
  const now = new Date();
  const month = now.getMonth();
  const hour = now.getHours();

  const seasonalBase: Record<number, { low: number; high: number; humidity: number }> = {
    0: { low: 28, high: 48, humidity: 62 },
    1: { low: 32, high: 53, humidity: 58 },
    2: { low: 40, high: 62, humidity: 55 },
    3: { low: 50, high: 72, humidity: 58 },
    4: { low: 59, high: 80, humidity: 65 },
    5: { low: 68, high: 90, humidity: 62 },
    6: { low: 73, high: 95, humidity: 55 },
    7: { low: 72, high: 96, humidity: 52 },
    8: { low: 63, high: 86, humidity: 58 },
    9: { low: 51, high: 74, humidity: 56 },
    10: { low: 39, high: 60, humidity: 60 },
    11: { low: 30, high: 49, humidity: 64 },
  };

  const season = seasonalBase[month] || seasonalBase[3];

  let timeFactor: number;
  if (hour >= 6 && hour <= 15) {
    timeFactor = (hour - 6) / 9;
  } else if (hour > 15) {
    timeFactor = 1 - (hour - 15) / 9;
  } else {
    timeFactor = 0.1;
  }

  const temp = Math.round(Math.max(season.low + (season.high - season.low) * timeFactor, 15));
  const humidityVariance = 15;
  const humidity = Math.round(
    Math.min(Math.max(season.humidity + humidityVariance * (1 - timeFactor) - humidityVariance * 0.3, 25), 95)
  );
  const windSpeed = Math.round(7 + (now.getMinutes() % 8));
  const dewPoint = calculateDewPoint(temp, humidity);

  const minute = now.getMinutes();
  let conditions: string;
  if (humidity > 75) {
    conditions = minute % 3 === 0 ? "Overcast" : "Cloudy with light rain";
  } else if (humidity > 60) {
    conditions = minute % 2 === 0 ? "Partly Cloudy" : "Mostly Cloudy";
  } else if (month >= 5 && month <= 8) {
    conditions = minute % 3 === 0 ? "Sunny and Hot" : "Clear Skies";
  } else if (month >= 11 || month <= 1) {
    conditions = minute % 2 === 0 ? "Cold and Clear" : "Partly Cloudy";
  } else {
    conditions = "Clear Skies";
  }

  return {
    temp,
    humidity,
    conditions,
    windSpeed,
    dewPoint: Math.round(dewPoint * 10) / 10,
    location: "Tulsa, OK",
    source: "mock",
  };
}

// Tulsa, OK coordinates
const TULSA_LAT = 36.154;
const TULSA_LON = -95.993;

/**
 * Get current weather for a location.
 * Defaults to Tulsa, OK. Supports custom lat/lon/name.
 */
export async function getCurrentWeather(
  lat: number = TULSA_LAT,
  lon: number = TULSA_LON,
  locationName: string = "Tulsa, OK"
): Promise<WeatherData> {
  const meteoData = await fetchOpenMeteo(lat, lon, locationName);
  if (meteoData) return meteoData;

  // Fall back to mock
  return getMockWeather();
}
