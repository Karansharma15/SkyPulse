import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import CurrentWeather from './components/CurrentWeather';
import HourlyForecast from './components/HourlyForecast';
import DailyForecast from './components/DailyForecast';
import WeatherChart from './components/WeatherChart';
import WeatherMetricsGrid from './components/WeatherMetricsGrid';
import {
  fetchWeatherData,
  fetchAirQuality,
  reverseGeocode,
} from './services/weatherApi';
import {
  getWeatherCondition,
  getWeatherBackground,
} from './utils/weatherUtils';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

const DEFAULT_CITIES = [
  { name: 'Tokyo', country: 'Japan', countryCode: 'JP', latitude: 35.6895, longitude: 139.6917, timezone: 'Asia/Tokyo' },
  { name: 'New York', admin1: 'New York', country: 'United States', countryCode: 'US', latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York' },
  { name: 'London', country: 'United Kingdom', countryCode: 'GB', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { name: 'Paris', country: 'France', countryCode: 'FR', latitude: 48.8566, longitude: 2.3522, timezone: 'Europe/Paris' },
];

export function App() {
  const [currentLocation, setCurrentLocation] = useState(() => {
    const saved = localStorage.getItem('skypulse_last_loc');
    return saved ? JSON.parse(saved) : DEFAULT_CITIES[0];
  });

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('skypulse_favorites');
    return saved ? JSON.parse(saved) : DEFAULT_CITIES;
  });

  const [unit, setUnit] = useState(() => {
    return localStorage.getItem('skypulse_unit') || 'C';
  });

  const [weather, setWeather] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load weather & air quality data
  const loadWeatherData = useCallback(async (loc) => {
    setLoading(true);
    setError(null);
    try {
      const [weatherRes, aqiRes] = await Promise.all([
        fetchWeatherData(loc.latitude, loc.longitude, loc.timezone),
        fetchAirQuality(loc.latitude, loc.longitude, loc.timezone),
      ]);
      setWeather(weatherRes);
      setAirQuality(aqiRes);
      localStorage.setItem('skypulse_last_loc', JSON.stringify(loc));
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError(err.message || 'Unable to retrieve weather forecast. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadWeatherData(currentLocation);
  }, [currentLocation, loadWeatherData]);

  // Geolocation trigger
  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const geoInfo = await reverseGeocode(latitude, longitude);
        const newLoc = {
          ...geoInfo,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto',
        };
        setCurrentLocation(newLoc);
      },
      (geoErr) => {
        console.warn('Geolocation denied or failed:', geoErr);
        alert('Could not access current location. Please check browser permissions.');
        setLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Toggle unit
  const handleToggleUnit = (newUnit) => {
    setUnit(newUnit);
    localStorage.setItem('skypulse_unit', newUnit);
  };

  // Toggle favorite location
  const isCurrentFavorite = favorites.some(
    (f) =>
      Math.abs(f.latitude - currentLocation.latitude) < 0.05 &&
      Math.abs(f.longitude - currentLocation.longitude) < 0.05
  );

  const handleToggleFavorite = () => {
    let updated;
    if (isCurrentFavorite) {
      updated = favorites.filter(
        (f) =>
          Math.abs(f.latitude - currentLocation.latitude) >= 0.05 ||
          Math.abs(f.longitude - currentLocation.longitude) >= 0.05
      );
    } else {
      updated = [...favorites, currentLocation];
    }
    setFavorites(updated);
    localStorage.setItem('skypulse_favorites', JSON.stringify(updated));
  };

  // Dynamic background classes based on current condition & day/night
  const isDay = weather?.current?.is_day ?? 1;
  const condition = weather?.current
    ? getWeatherCondition(weather.current.weather_code, isDay)
    : { type: 'clear-day' };
  const bgGradient = getWeatherBackground(condition.type, isDay);

  return (
    <div
      className={`min-h-screen w-full bg-gradient-to-br ${bgGradient} transition-all duration-1000 text-slate-100 flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8 selection:bg-white/30`}
    >
      <div className="w-full max-w-6xl space-y-6 flex-1">
        {/* Header & Controls */}
        <Header
          currentLocation={currentLocation}
          onSelectLocation={(loc) => setCurrentLocation(loc)}
          onUseGeolocation={handleUseGeolocation}
          unit={unit}
          onToggleUnit={handleToggleUnit}
          onRefresh={() => loadWeatherData(currentLocation)}
          loading={loading}
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={isCurrentFavorite}
        />

        {/* Error State */}
        {error && (
          <div className="rounded-3xl bg-rose-500/20 backdrop-blur-xl border border-rose-400/30 p-6 text-white flex items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-rose-300 shrink-0" />
              <div>
                <h4 className="font-bold text-sm">Failed to Load Weather Data</h4>
                <p className="text-xs text-white/80">{error}</p>
              </div>
            </div>
            <button
              onClick={() => loadWeatherData(currentLocation)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 text-xs font-semibold border border-white/20 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Loading Spinner Indicator */}
        {loading && !weather && (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-white drop-shadow" />
            <p className="text-sm font-medium text-white/80 animate-pulse">
              Gathering atmospheric data for {currentLocation.name}...
            </p>
          </div>
        )}

        {/* Weather Dashboard Content */}
        {weather && (
          <main className="space-y-6 animate-in fade-in duration-500">
            {/* Current Weather Hero Card */}
            <CurrentWeather
              weather={weather}
              location={currentLocation}
              unit={unit}
            />

            {/* 24-Hour Forecast Slider */}
            <HourlyForecast
              weather={weather}
              unit={unit}
            />

            {/* Interactive Visual Forecast Charts */}
            <WeatherChart
              weather={weather}
              unit={unit}
            />

            {/* Detailed Atmospheric Metrics Grid */}
            <WeatherMetricsGrid
              weather={weather}
              airQuality={airQuality}
              unit={unit}
            />

            {/* 7-Day Forecast */}
            <DailyForecast
              weather={weather}
              unit={unit}
            />
          </main>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full max-w-6xl mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60">
        <div>
          Powered by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="underline hover:text-white">Open-Meteo</a> & <a href="https://lucide.dev" target="_blank" rel="noreferrer" className="underline hover:text-white">Lucide Icons</a>
        </div>
        <div className="flex items-center gap-4">
          <span>Accurate Global ECMWF & GFS Weather Models</span>
          <span>•</span>
          <span>Live Updates</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
