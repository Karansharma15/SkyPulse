import React from 'react';
import { Clock, Droplets } from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import { getWeatherCondition, formatTemp } from '../utils/weatherUtils';

export const HourlyForecast = ({ weather, unit }) => {
  if (!weather || !weather.hourly) return null;

  const { hourly, current } = weather;
  const currentTime = current?.time ? new Date(current.time) : new Date();

  // Find index of current hour
  let startIndex = 0;
  if (hourly.time && hourly.time.length > 0) {
    const idx = hourly.time.findIndex((t) => new Date(t) >= currentTime);
    if (idx !== -1) {
      startIndex = Math.max(0, idx);
    }
  }

  // Slice next 24 hours
  const next24Hours = hourly.time.slice(startIndex, startIndex + 24).map((time, i) => {
    const actualIndex = startIndex + i;
    const temp = hourly.temperature_2m[actualIndex];
    const code = hourly.weather_code[actualIndex];
    const isDay = hourly.is_day ? hourly.is_day[actualIndex] : 1;
    const precipProb = hourly.precipitation_probability ? hourly.precipitation_probability[actualIndex] : 0;
    const condition = getWeatherCondition(code, isDay);

    const hourDate = new Date(time);
    const isNow = i === 0;
    const hourLabel = isNow
      ? 'Now'
      : hourDate.toLocaleTimeString([], { hour: 'numeric', hour12: true });

    return {
      time,
      hourLabel,
      temp,
      code,
      condition,
      precipProb,
      isNow,
    };
  });

  return (
    <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 sm:p-6 text-white shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-sky-300" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">
          24-Hour Forecast
        </h3>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 scrollbar-thin scroll-smooth -mx-2 px-2">
        {next24Hours.map((item, idx) => (
          <div
            key={item.time || idx}
            className={`flex flex-col items-center justify-between min-w-[76px] sm:min-w-[84px] py-3.5 px-2.5 rounded-2xl border transition-all duration-200 shrink-0 ${
              item.isNow
                ? 'bg-white/25 border-white/40 shadow-lg scale-102 ring-1 ring-white/50'
                : 'bg-white/5 hover:bg-white/15 border-white/10'
            }`}
          >
            {/* Time label */}
            <span
              className={`text-xs font-semibold ${
                item.isNow ? 'text-white' : 'text-white/80'
              }`}
            >
              {item.hourLabel}
            </span>

            {/* Weather icon */}
            <div className="my-2.5">
              <WeatherIcon
                name={item.condition.iconName}
                className="w-7 h-7 text-white drop-shadow"
              />
            </div>

            {/* Temperature */}
            <span className="text-sm font-bold tracking-tight">
              {formatTemp(item.temp, unit)}
            </span>

            {/* Precipitation probability */}
            <div className="flex items-center gap-0.5 mt-2 text-[10px] font-semibold text-cyan-300 h-4">
              {item.precipProb > 5 ? (
                <>
                  <Droplets className="w-2.5 h-2.5" />
                  <span>{item.precipProb}%</span>
                </>
              ) : (
                <span className="text-transparent">0%</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HourlyForecast;
