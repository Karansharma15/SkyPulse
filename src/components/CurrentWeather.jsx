import React from 'react';
import {
  ArrowDown,
  ArrowUp,
  Droplets,
  Wind,
  CloudRain,
  Eye,
  Clock,
} from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import {
  getWeatherCondition,
  formatTemp,
  formatSpeed,
} from '../utils/weatherUtils';

export const CurrentWeather = ({
  weather,
  location,
  unit,
}) => {
  if (!weather || !weather.current) return null;

  const current = weather.current;
  const daily = weather.daily;
  const isDay = current.is_day ?? 1;
  const condition = getWeatherCondition(current.weather_code, isDay);

  const todayMax = daily?.temperature_2m_max?.[0];
  const todayMin = daily?.temperature_2m_min?.[0];
  const rainProb = daily?.precipitation_probability_max?.[0] ?? 0;

  // Local time from current.time
  const localTime = current.time
    ? new Date(current.time).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const localDate = current.time
    ? new Date(current.time).toLocaleDateString([], {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-6 sm:p-8 text-white shadow-2xl transition-all">
      {/* Decorative ambient background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left Side: Location, Date & Weather Details */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20">
              Current Conditions
            </span>
            <div className="flex items-center gap-1 text-xs text-white/80 bg-black/20 px-2.5 py-1 rounded-full">
              <Clock className="w-3.5 h-3.5" />
              <span>{localTime} • {localDate}</span>
            </div>
          </div>

          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
              {location.name}
            </h2>
            {(location.admin1 || location.country) && (
              <p className="text-sm sm:text-base text-white/80 font-medium mt-1">
                {[location.admin1, location.country].filter(Boolean).join(', ')}
              </p>
            )}
          </div>

          {/* Condition Name & Description */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-lg sm:text-xl font-semibold text-white/95">
              {condition.label}
            </span>
            <span className="text-white/50">•</span>
            <span className="text-xs sm:text-sm text-white/80">
              {condition.description}
            </span>
          </div>

          {/* Today's High & Low & Feels Like */}
          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/90 pt-1">
            <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-xl">
              <ArrowUp className="w-3.5 h-3.5 text-rose-300" />
              <span>High: {formatTemp(todayMax, unit)}</span>
            </div>
            <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-xl">
              <ArrowDown className="w-3.5 h-3.5 text-sky-300" />
              <span>Low: {formatTemp(todayMin, unit)}</span>
            </div>
            <div className="bg-white/10 px-2.5 py-1 rounded-xl">
              <span>Feels like <strong>{formatTemp(current.apparent_temperature, unit)}</strong></span>
            </div>
          </div>
        </div>

        {/* Right Side: Giant Temperature & Visual Icon */}
        <div className="flex items-center justify-between sm:justify-end gap-6 w-full md:w-auto">
          {/* Weather Icon with gentle float animation */}
          <div className="relative flex items-center justify-center p-4 rounded-3xl bg-white/15 backdrop-blur-md border border-white/25 shadow-xl">
            <WeatherIcon
              name={condition.iconName}
              className="w-16 h-16 sm:w-20 sm:h-20 text-white drop-shadow-lg animate-pulse"
            />
          </div>

          {/* Big Temperature Display */}
          <div className="text-right">
            <div className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white drop-shadow-md">
              {formatTemp(current.temperature_2m, unit)}
            </div>
            <div className="text-xs sm:text-sm text-white/70 font-medium">
              Humidity: {current.relative_humidity_2m}%
            </div>
          </div>
        </div>
      </div>

      {/* Quick Status Bar */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15">
        <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white/5 border border-white/10">
          <Wind className="w-4 h-4 text-sky-300" />
          <div>
            <div className="text-[11px] text-white/60 uppercase">Wind</div>
            <div className="text-xs sm:text-sm font-semibold">{formatSpeed(current.wind_speed_10m, unit)}</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white/5 border border-white/10">
          <Droplets className="w-4 h-4 text-blue-300" />
          <div>
            <div className="text-[11px] text-white/60 uppercase">Humidity</div>
            <div className="text-xs sm:text-sm font-semibold">{current.relative_humidity_2m}%</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white/5 border border-white/10">
          <CloudRain className="w-4 h-4 text-cyan-300" />
          <div>
            <div className="text-[11px] text-white/60 uppercase">Rain Chance</div>
            <div className="text-xs sm:text-sm font-semibold">{rainProb}%</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-white/5 border border-white/10">
          <Eye className="w-4 h-4 text-amber-300" />
          <div>
            <div className="text-[11px] text-white/60 uppercase">Cloud Cover</div>
            <div className="text-xs sm:text-sm font-semibold">{current.cloud_cover}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;
