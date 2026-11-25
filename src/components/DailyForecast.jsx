import React from 'react';
import { Calendar, Droplets } from 'lucide-react';
import WeatherIcon from './WeatherIcon';
import {
  getWeatherCondition,
  formatTemp,
  formatDayName,
} from '../utils/weatherUtils';

export const DailyForecast = ({ weather, unit }) => {
  if (!weather || !weather.daily) return null;

  const { daily } = weather;
  const daysCount = Math.min(7, daily.time?.length || 0);

  // Calculate weekly overall min and max for proportional range bar
  const allMins = daily.temperature_2m_min.slice(0, daysCount);
  const allMaxs = daily.temperature_2m_max.slice(0, daysCount);
  const globalMin = Math.min(...allMins);
  const globalMax = Math.max(...allMaxs);
  const tempSpan = Math.max(1, globalMax - globalMin);

  const days = [];
  for (let i = 0; i < daysCount; i++) {
    const time = daily.time[i];
    const code = daily.weather_code[i];
    const minTemp = daily.temperature_2m_min[i];
    const maxTemp = daily.temperature_2m_max[i];
    const precipProb = daily.precipitation_probability_max?.[i] ?? 0;
    const condition = getWeatherCondition(code, 1);

    // Percentage coordinates for range bar
    const leftPercent = Math.max(0, Math.min(100, ((minTemp - globalMin) / tempSpan) * 100));
    const rightPercent = Math.max(0, Math.min(100, ((maxTemp - globalMin) / tempSpan) * 100));
    const widthPercent = Math.max(8, rightPercent - leftPercent);

    days.push({
      time,
      dayName: formatDayName(time),
      code,
      condition,
      minTemp,
      maxTemp,
      precipProb,
      leftPercent,
      widthPercent,
    });
  }

  return (
    <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 sm:p-6 text-white shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-sky-300" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">
          7-Day Forecast
        </h3>
      </div>

      <div className="space-y-3">
        {days.map((day, idx) => (
          <div
            key={day.time || idx}
            className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            {/* Day name */}
            <div className="w-16 font-semibold text-sm text-white/90">
              {day.dayName}
            </div>

            {/* Condition Icon & Chance of rain */}
            <div className="flex items-center gap-2 w-28">
              <WeatherIcon
                name={day.condition.iconName}
                className="w-6 h-6 text-white shrink-0 drop-shadow"
              />
              {day.precipProb > 10 ? (
                <div className="flex items-center text-[11px] font-semibold text-cyan-300 gap-0.5">
                  <Droplets className="w-2.5 h-2.5" />
                  <span>{day.precipProb}%</span>
                </div>
              ) : (
                <span className="text-xs text-white/60 truncate">
                  {day.condition.label}
                </span>
              )}
            </div>

            {/* Min Temp */}
            <div className="w-12 text-right text-xs sm:text-sm font-medium text-white/70">
              {formatTemp(day.minTemp, unit)}
            </div>

            {/* Visual Temperature Range Bar */}
            <div className="flex-1 max-w-[140px] sm:max-w-[200px] h-2 bg-black/25 rounded-full relative overflow-hidden">
              <div
                className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-amber-300 to-rose-400"
                style={{
                  left: `${day.leftPercent}%`,
                  width: `${day.widthPercent}%`,
                }}
              />
            </div>

            {/* Max Temp */}
            <div className="w-12 text-left text-xs sm:text-sm font-bold text-white">
              {formatTemp(day.maxTemp, unit)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyForecast;
