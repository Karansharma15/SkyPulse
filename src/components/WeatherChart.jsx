import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Droplets,
  Wind,
  SunMedium,
} from 'lucide-react';
import {
  formatTemp,
  formatTempNumber,
  formatSpeed,
  formatPrecipitation,
} from '../utils/weatherUtils';

export const WeatherChart = ({ weather, unit }) => {
  const [activeMetric, setActiveMetric] = useState('temp'); // 'temp' | 'precip' | 'wind' | 'uv'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const hourly = weather?.hourly;
  const current = weather?.current;

  // Prepare next 24 data points
  const chartData = useMemo(() => {
    if (!hourly || !hourly.time) return [];

    const currentTime = current?.time ? new Date(current.time) : new Date();
    let startIndex = hourly.time.findIndex((t) => new Date(t) >= currentTime);
    if (startIndex === -1) startIndex = 0;

    const points = [];
    const count = 24;

    for (let i = 0; i < count; i++) {
      const idx = startIndex + i;
      if (idx >= hourly.time.length) break;

      const timeStr = hourly.time[idx];
      const date = new Date(timeStr);
      const hourLabel = i === 0 ? 'Now' : date.toLocaleTimeString([], { hour: 'numeric', hour12: true });

      const tempC = hourly.temperature_2m[idx];
      const tempVal = formatTempNumber(tempC, unit);
      const precipProb = hourly.precipitation_probability ? hourly.precipitation_probability[idx] : 0;
      const rainMm = hourly.precipitation ? hourly.precipitation[idx] : 0;
      const windKmh = hourly.wind_speed_10m ? hourly.wind_speed_10m[idx] : 0;
      const windVal = unit === 'F' ? Math.round(windKmh * 0.621371) : Math.round(windKmh);
      const uv = hourly.uv_index ? hourly.uv_index[idx] : 0;

      points.push({
        index: i,
        time: timeStr,
        hourLabel,
        tempVal,
        tempC,
        precipProb,
        rainMm,
        windVal,
        windKmh,
        uv,
      });
    }

    return points;
  }, [hourly, current, unit]);

  // Metric configuration
  const metricConfig = {
    temp: {
      label: 'Temperature',
      unitLabel: `°${unit}`,
      icon: TrendingUp,
      color: '#38bdf8', // sky-400
      gradientId: 'tempGrad',
      fromColor: 'rgba(56, 189, 248, 0.45)',
      toColor: 'rgba(56, 189, 248, 0.0)',
      getValue: (p) => p.tempVal,
      formatDisplay: (p) => formatTemp(p.tempC, unit),
    },
    precip: {
      label: 'Rain Probability',
      unitLabel: '%',
      icon: Droplets,
      color: '#60a5fa', // blue-400
      gradientId: 'precipGrad',
      fromColor: 'rgba(96, 165, 250, 0.45)',
      toColor: 'rgba(96, 165, 250, 0.0)',
      getValue: (p) => p.precipProb,
      formatDisplay: (p) => `${p.precipProb}% (${formatPrecipitation(p.rainMm, unit)})`,
    },
    wind: {
      label: 'Wind Speed',
      unitLabel: unit === 'F' ? 'mph' : 'km/h',
      icon: Wind,
      color: '#34d399', // emerald-400
      gradientId: 'windGrad',
      fromColor: 'rgba(52, 211, 153, 0.45)',
      toColor: 'rgba(52, 211, 153, 0.0)',
      getValue: (p) => p.windVal,
      formatDisplay: (p) => formatSpeed(p.windKmh, unit),
    },
    uv: {
      label: 'UV Index',
      unitLabel: 'UV',
      icon: SunMedium,
      color: '#fbbf24', // amber-400
      gradientId: 'uvGrad',
      fromColor: 'rgba(251, 191, 36, 0.45)',
      toColor: 'rgba(251, 191, 36, 0.0)',
      getValue: (p) => p.uv,
      formatDisplay: (p) => `${p.uv.toFixed(1)} UV`,
    },
  };

  const currentConfig = metricConfig[activeMetric];

  // SVG Chart Geometry
  const width = 800;
  const height = 220;
  const paddingX = 40;
  const paddingTop = 30;
  const paddingBottom = 40;

  const values = chartData.map((d) => currentConfig.getValue(d));
  let minVal = Math.min(...(values.length ? values : [0]));
  let maxVal = Math.max(...(values.length ? values : [1]));

  if (activeMetric === 'precip') {
    minVal = 0;
    maxVal = Math.max(100, maxVal);
  } else if (activeMetric === 'uv') {
    minVal = 0;
    maxVal = Math.max(10, maxVal);
  } else {
    // Add small buffer
    const range = maxVal - minVal || 1;
    minVal = Math.floor(minVal - range * 0.1);
    maxVal = Math.ceil(maxVal + range * 0.1);
  }

  const rangeSpan = Math.max(1, maxVal - minVal);

  const getCoordinates = (index, val) => {
    const totalPoints = chartData.length;
    const x = paddingX + (index / (totalPoints - 1 || 1)) * (width - paddingX * 2);
    const normalizedY = (val - minVal) / rangeSpan;
    const y = height - paddingBottom - normalizedY * (height - paddingTop - paddingBottom);
    return { x, y };
  };

  // Generate cubic bezier curve path
  const pathD = useMemo(() => {
    if (chartData.length < 2) return '';
    const coords = chartData.map((d, i) => getCoordinates(i, currentConfig.getValue(d)));

    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? i : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [chartData, activeMetric, minVal, maxVal]);

  // Area path for gradient fill
  const areaD = useMemo(() => {
    if (!pathD || chartData.length < 2) return '';
    const first = getCoordinates(0, currentConfig.getValue(chartData[0]));
    const last = getCoordinates(chartData.length - 1, currentConfig.getValue(chartData[chartData.length - 1]));
    const bottomY = height - paddingBottom;
    return `${pathD} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  }, [pathD, chartData, activeMetric, minVal, maxVal]);

  const handleMouseMove = (e) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - svgRect.left;
    const chartWidth = svgRect.width;

    const ratio = Math.max(0, Math.min(1, clientX / chartWidth));
    const closestIdx = Math.round(ratio * (chartData.length - 1));
    if (chartData[closestIdx]) {
      setHoveredPoint(chartData[closestIdx]);
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-5 sm:p-6 text-white shadow-xl">
      {/* Metric Selector Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-sky-300" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">
            Interactive Forecast Trends (24h)
          </h3>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-black/25 p-1 rounded-2xl border border-white/15 overflow-x-auto max-w-full">
          {Object.entries(metricConfig).map(([key, config]) => {
            const Icon = config.icon;
            const isActive = activeMetric === key;
            return (
              <button
                key={key}
                onClick={() => {
                  setActiveMetric(key);
                  setHoveredPoint(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-md font-bold'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-900' : 'text-white/70'}`} />
                <span>{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-hidden select-none">
        {/* Floating Tooltip if hovered */}
        {hoveredPoint && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-4 z-20 flex items-center gap-2.5 px-4 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-white/25 shadow-2xl pointer-events-none text-xs"
          >
            <span className="font-semibold text-white/70">{hoveredPoint.hourLabel}:</span>
            <span className="font-bold text-white text-sm" style={{ color: currentConfig.color }}>
              {currentConfig.formatDisplay(hoveredPoint)}
            </span>
          </div>
        )}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 sm:h-56 touch-none cursor-crosshair overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onTouchMove={(e) => {
            if (e.touches[0]) {
              handleMouseMove(e.touches[0]);
            }
          }}
          onTouchEnd={handleMouseLeave}
        >
          <defs>
            <linearGradient id={currentConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={currentConfig.fromColor} />
              <stop offset="100%" stopColor={currentConfig.toColor} />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={width - paddingX}
            y2={paddingTop}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={(paddingTop + height - paddingBottom) / 2}
            x2={width - paddingX}
            y2={(paddingTop + height - paddingBottom) / 2}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingBottom}
            x2={width - paddingX}
            y2={height - paddingBottom}
            stroke="rgba(255, 255, 255, 0.15)"
          />

          {/* Area fill */}
          {areaD && <path d={areaD} fill={`url(#${currentConfig.gradientId})`} />}

          {/* Smooth Line curve */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={currentConfig.color}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* X-axis labels (every 3-4 hours) */}
          {chartData.map((d, i) => {
            if (i % 3 !== 0 && i !== chartData.length - 1) return null;
            const { x } = getCoordinates(i, currentConfig.getValue(d));
            return (
              <text
                key={d.time || i}
                x={x}
                y={height - paddingBottom + 20}
                fill="rgba(255, 255, 255, 0.65)"
                fontSize="11"
                textAnchor="middle"
                fontWeight="500"
              >
                {d.hourLabel}
              </text>
            );
          })}

          {/* Interactive Hover Point and Crosshair */}
          {hoveredPoint && (() => {
            const { x, y } = getCoordinates(hoveredPoint.index, currentConfig.getValue(hoveredPoint));
            return (
              <g>
                {/* Vertical Crosshair line */}
                <line
                  x1={x}
                  y1={paddingTop}
                  x2={x}
                  y2={height - paddingBottom}
                  stroke="rgba(255, 255, 255, 0.4)"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
                {/* Hover circle ring */}
                <circle
                  cx={x}
                  cy={y}
                  r="7"
                  fill="#ffffff"
                  stroke={currentConfig.color}
                  strokeWidth="3"
                />
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
};

export default WeatherChart;
