const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';
const GEOCODING_BASE = 'https://geocoding-api.open-meteo.com/v1/search';
const AIR_QUALITY_BASE = 'https://air-quality-api.open-meteo.com/v1/air-quality';

// Search locations by city or place name
export const searchLocations = async (query) => {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(`${GEOCODING_BASE}?name=${encodeURIComponent(query.trim())}&count=8&language=en&format=json`);
    if (!res.ok) throw new Error('Failed to search locations');
    const data = await res.json();
    return (data.results || []).map((item) => ({
      id: `${item.latitude}_${item.longitude}_${item.name}`,
      name: item.name,
      admin1: item.admin1 || '',
      country: item.country || '',
      countryCode: item.country_code || '',
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone || 'auto',
      elevation: item.elevation,
    }));
  } catch (err) {
    console.error('Error searching locations:', err);
    return [];
  }
};

// Reverse geocode lat/lng to city name
export const reverseGeocode = async (lat, lon) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'WeatherAppReact/1.0',
        },
      }
    );
    if (!res.ok) throw new Error('Failed to reverse geocode');
    const data = await res.json();
    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.municipality ||
      data.address?.county ||
      'Current Location';
    const country = data.address?.country || '';
    const admin1 = data.address?.state || data.address?.region || '';
    return {
      name: city,
      admin1,
      country,
      latitude: lat,
      longitude: lon,
    };
  } catch (err) {
    console.warn('Reverse geocode fallback:', err);
    return {
      name: 'Current Location',
      latitude: lat,
      longitude: lon,
    };
  }
};

// Fetch full weather forecast
export const fetchWeatherData = async (latitude, longitude, timezone = 'auto') => {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'rain',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'dew_point_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'surface_pressure',
      'cloud_cover',
      'visibility',
      'wind_speed_10m',
      'wind_direction_10m',
      'uv_index',
      'is_day',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
      'wind_direction_10m_dominant',
    ].join(','),
    timezone: timezone || 'auto',
  });

  const res = await fetch(`${OPEN_METEO_BASE}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Weather service returned ${res.status}`);
  }
  return await res.json();
};

// Fetch Air Quality data
export const fetchAirQuality = async (latitude, longitude, timezone = 'auto') => {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: [
        'european_aqi',
        'us_aqi',
        'pm10',
        'pm2_5',
        'carbon_monoxide',
        'nitrogen_dioxide',
        'sulphur_dioxide',
        'ozone',
        'dust',
        'uv_index',
      ].join(','),
      timezone: timezone || 'auto',
    });

    const res = await fetch(`${AIR_QUALITY_BASE}?${params.toString()}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Air quality data unavailable:', err);
    return null;
  }
};
