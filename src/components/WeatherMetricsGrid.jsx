import React from 'react';
import {
  Wind,
  Sun,
  Sunrise,
  Sunset,
  Droplets,
  Eye,
  Gauge,
  Compass,
  Sparkles,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import {
  getAqiInfo,
  getUvInfo,
  getWindDirectionName,
  formatSpeed,
  formatTemp,
  formatVisibility,
  formatPressure,
} from '../utils/weatherUtils';

export const WeatherMetricsGrid = ({
  weather,
  airQuality,
  unit,
}) => {
  if (!weather || !weather.current) return null;

  const current = weather.current;
  const daily = weather.daily;
  const hourly = weather.hourly;

  // Air Quality data
  const aqiValue = airQuality?.current?.us_aqi ?? airQuality?.current?.european_aqi ?? null;
  const aqiInfo = getAqiInfo(aqiValue);
  const pm25 = airQuality?.current?.pm2_5;
  const pm10 = airQuality?.current?.pm10;
  const ozone = airQuality?.current?.ozone;
  const no2 = airQuality?.current?.nitrogen_dioxide;

  // UV Index data (from current or daily max or hourly)
  const currentUv =
    airQuality?.current?.uv_index ??
    daily?.uv_index_max?.[0] ??
    0;
  const uvInfo = getUvInfo(currentUv);

  // Wind & Direction
  const windSpeed = current.wind_speed_10m ?? 0;
  const windGusts = current.wind_gusts_10m ?? 0;
  const windDeg = current.wind_direction_10m ?? 0;
  const windDir = getWindDirectionName(windDeg);

  // Sunrise & Sunset
  const sunriseStr = daily?.sunrise?.[0];
  const sunsetStr = daily?.sunset?.[0];
  const sunriseTime = sunriseStr
    ? new Date(sunriseStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
    : '--:--';
  const sunsetTime = sunsetStr
    ? new Date(sunsetStr).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
    : '--:--';

  // Calculate daylight duration & current sun progress
  let daylightHours = '';
  let sunProgress = 0.5;
  if (sunriseStr && sunsetStr) {
    const rise = new Date(sunriseStr).getTime();
    const set = new Date(sunsetStr).getTime();
    const totalDaylightMs = set - rise;
    if (totalDaylightMs > 0) {
      const hours = Math.floor(totalDaylightMs / (1000 * 60 * 60));
      const mins = Math.round((totalDaylightMs % (1000 * 60 * 60)) / (1000 * 60));
      daylightHours = `${hours}h ${mins}m`;

      const now = new Date(current.time || Date.now()).getTime();
      if (now < rise) sunProgress = 0;
      else if (now > set) sunProgress = 1;
      else sunProgress = Math.max(0, Math.min(1, (now - rise) / totalDaylightMs));
    }
  }

  // Dew point from hourly
  const dewPoint = hourly?.dew_point_2m?.[0] ?? null;

  // Visibility from hourly or default 10km
  const visibilityMeters = hourly?.visibility?.[0] ?? 10000;

  // Pressure
  const pressureHpa = current.pressure_msl ?? current.surface_pressure ?? 1013;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-white">
      {/* 1. Air Quality Index Card */}
      <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-white/80">
              <Activity className="w-4 h-4 text-emerald-300" />
              <span className="text-xs font-bold uppercase tracking-wider">Air Quality (AQI)</span>
            </div>
            {aqiValue !== null && (
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${aqiInfo.bg} ${aqiInfo.color} border ${aqiInfo.border || 'border-transparent'}`}>
                {aqiInfo.label}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-3 my-2">
            <span className="text-4xl font-extrabold tracking-tight">
              {aqiValue !== null ? Math.round(aqiValue) : 'N/A'}
            </span>
            <span className="text-xs text-white/70">US AQI Standard</span>
          </div>

          {/* AQI Progress Meter */}
          <div className="w-full h-2 rounded-full bg-black/25 overflow-hidden my-3">
            <div
              className={`h-full transition-all duration-500 ${aqiInfo.badge || 'bg-emerald-400'}`}
              style={{ width: `${Math.min(100, (Math.max(0, aqiValue || 20) / 300) * 100)}%` }}
            />
          </div>

          <p className="text-xs text-white/80 leading-relaxed mb-4">
            {aqiInfo.advice}
          </p>
        </div>

        {/* Pollutants Chips */}
        {(pm25 !== undefined || pm10 !== undefined) && (
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-[11px]">
            {pm25 !== undefined && (
              <div className="bg-white/5 rounded-xl p-2 border border-white/10">
                <span className="text-white/60">PM2.5: </span>
                <span className="font-semibold text-white">{pm25.toFixed(1)} µg/m³</span>
              </div>
            )}
            {pm10 !== undefined && (
              <div className="bg-white/5 rounded-xl p-2 border border-white/10">
                <span className="text-white/60">PM10: </span>
                <span className="font-semibold text-white">{pm10.toFixed(1)} µg/m³</span>
              </div>
            )}
            {ozone !== undefined && (
              <div className="bg-white/5 rounded-xl p-2 border border-white/10">
                <span className="text-white/60">Ozone: </span>
                <span className="font-semibold text-white">{ozone.toFixed(1)} µg/m³</span>
              </div>
            )}
            {no2 !== undefined && (
              <div className="bg-white/5 rounded-xl p-2 border border-white/10">
                <span className="text-white/60">NO₂: </span>
                <span className="font-semibold text-white">{no2.toFixed(1)} µg/m³</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. UV Index Card */}
      <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-white/80">
              <Sun className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-bold uppercase tracking-wider">UV Index</span>
            </div>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase bg-white/15 ${uvInfo.color}`}>
              {uvInfo.label}
            </span>
          </div>

          <div className="flex items-baseline gap-3 my-2">
            <span className="text-4xl font-extrabold tracking-tight">
              {Math.round(currentUv)}
            </span>
            <span className="text-xs text-white/70">Peak UV today</span>
          </div>

          {/* UV Meter */}
          <div className="w-full h-2 rounded-full bg-black/25 overflow-hidden my-3">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 via-rose-500 to-purple-600 transition-all duration-500"
              style={{ width: `${Math.min(100, (currentUv / 11) * 100)}%` }}
            />
          </div>

          <p className="text-xs text-white/80 leading-relaxed mb-4">
            {uvInfo.advice}
          </p>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
          <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="text-white/80">Keep skin and eyes protected outdoors.</span>
        </div>
      </div>

      {/* 3. Wind & Compass Card */}
      <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-white/80">
              <Wind className="w-4 h-4 text-sky-300" />
              <span className="text-xs font-bold uppercase tracking-wider">Wind & Direction</span>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-white/15 text-white/90">
              {windDir} • {Math.round(windDeg)}°
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 my-2">
            <div>
              <div className="text-4xl font-extrabold tracking-tight">
                {formatSpeed(windSpeed, unit)}
              </div>
              <div className="text-xs text-white/70 mt-1">
                Gusts up to <span className="font-semibold text-white">{formatSpeed(windGusts, unit)}</span>
              </div>
            </div>

            {/* Compass Visual Gauge */}
            <div className="relative w-16 h-16 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center bg-black/20">
              <span className="absolute top-1 text-[9px] font-bold text-white/60">N</span>
              <span className="absolute bottom-1 text-[9px] font-bold text-white/60">S</span>
              <span className="absolute left-1 text-[9px] font-bold text-white/60">W</span>
              <span className="absolute right-1 text-[9px] font-bold text-white/60">E</span>
              {/* Rotating Arrow Needle */}
              <div
                className="w-1 h-8 rounded-full bg-gradient-to-t from-sky-400 to-rose-400 transition-transform duration-500 ease-out origin-center"
                style={{ transform: `rotate(${windDeg}deg)` }}
              />
            </div>
          </div>
        </div>

        <div className="text-xs text-white/70 pt-3 border-t border-white/10">
          Steady breeze blowing from {windDir} ({Math.round(windDeg)}°).
        </div>
      </div>

      {/* 4. Sunrise & Sunset Card */}
      <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-white/80">
              <Sunrise className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-bold uppercase tracking-wider">Sun & Daylight</span>
            </div>
            {daylightHours && (
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-white/15 text-white/90">
                {daylightHours}
              </span>
            )}
          </div>

          {/* Visual Arc of Daylight */}
          <div className="relative w-full h-16 my-2">
            <svg viewBox="0 0 200 80" className="w-full h-full overflow-visible">
              <path
                d="M 10 75 Q 100 -20 190 75"
                fill="none"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="2.5"
                strokeDasharray="4 4"
              />
              {/* Sun icon on the arc based on sunProgress */}
              {(() => {
                const t = sunProgress;
                // Quadratic bezier B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
                // P0=(10, 75), P1=(100, -20), P2=(190, 75)
                const sunX = (1 - t) * (1 - t) * 10 + 2 * (1 - t) * t * 100 + t * t * 190;
                const sunY = (1 - t) * (1 - t) * 75 + 2 * (1 - t) * t * (-20) + t * t * 75;
                return (
                  <circle
                    cx={sunX}
                    cy={sunY}
                    r="6"
                    fill="#fbbf24"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="drop-shadow-lg"
                  />
                );
              })()}
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10">
              <Sunrise className="w-4 h-4 text-amber-300" />
              <div>
                <div className="text-[10px] text-white/60 uppercase">Sunrise</div>
                <div className="text-xs sm:text-sm font-bold">{sunriseTime}</div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/5 p-2 rounded-2xl border border-white/10">
              <Sunset className="w-4 h-4 text-orange-400" />
              <div>
                <div className="text-[10px] text-white/60 uppercase">Sunset</div>
                <div className="text-xs sm:text-sm font-bold">{sunsetTime}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-white/70 pt-3 border-t border-white/10">
          {sunProgress >= 1 ? 'Sun has set for today.' : sunProgress <= 0 ? 'Before sunrise.' : 'Sun is currently above horizon.'}
        </div>
      </div>

      {/* 5. Humidity & Dew Point Card */}
      <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-white/80">
              <Droplets className="w-4 h-4 text-blue-300" />
              <span className="text-xs font-bold uppercase tracking-wider">Humidity & Dew Point</span>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-white/15 text-white/90">
              {current.relative_humidity_2m > 70
                ? 'Humid'
                : current.relative_humidity_2m < 30
                ? 'Dry'
                : 'Comfortable'}
            </span>
          </div>

          <div className="flex items-baseline gap-3 my-2">
            <span className="text-4xl font-extrabold tracking-tight">
              {current.relative_humidity_2m}%
            </span>
            <span className="text-xs text-white/70">Relative Humidity</span>
          </div>

          <div className="w-full h-2 rounded-full bg-black/25 overflow-hidden my-3">
            <div
              className="h-full bg-gradient-to-r from-sky-300 to-blue-500 transition-all duration-500"
              style={{ width: `${current.relative_humidity_2m}%` }}
            />
          </div>

          <div className="bg-white/5 p-2.5 rounded-2xl border border-white/10 text-xs">
            <span className="text-white/70">Dew point is </span>
            <span className="font-bold text-white">{formatTemp(dewPoint, unit)}</span>
            <span className="text-white/70"> right now.</span>
          </div>
        </div>

        <div className="text-xs text-white/70 pt-3 border-t border-white/10">
          Moisture levels in the air determine how sweat evaporates.
        </div>
      </div>

      {/* 6. Visibility & Barometric Pressure Card */}
      <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-white/80">
              <Gauge className="w-4 h-4 text-purple-300" />
              <span className="text-xs font-bold uppercase tracking-wider">Pressure & Visibility</span>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-white/15 text-white/90">
              Atmospheric
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-2">
            <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
              <div className="flex items-center gap-1.5 text-white/70 text-xs mb-1">
                <Eye className="w-3.5 h-3.5 text-cyan-300" />
                <span>Visibility</span>
              </div>
              <div className="text-lg sm:text-xl font-extrabold">
                {formatVisibility(visibilityMeters, unit)}
              </div>
              <div className="text-[10px] text-white/60">
                {visibilityMeters >= 10000 ? 'Crystal clear' : 'Hazy / Low'}
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
              <div className="flex items-center gap-1.5 text-white/70 text-xs mb-1">
                <Gauge className="w-3.5 h-3.5 text-purple-300" />
                <span>Pressure</span>
              </div>
              <div className="text-lg sm:text-xl font-extrabold">
                {formatPressure(pressureHpa, unit)}
              </div>
              <div className="text-[10px] text-white/60">
                {pressureHpa > 1013 ? 'High pressure' : 'Low pressure'}
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-white/70 pt-3 border-t border-white/10">
          Higher barometric pressure indicates fair, stable weather ahead.
        </div>
      </div>
    </div>
  );
};

export default WeatherMetricsGrid;
