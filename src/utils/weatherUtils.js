// Mapping WMO Weather interpretation codes (WW) to descriptions and visual attributes
export const getWeatherCondition = (code, isDay = 1) => {
  switch (code) {
    case 0:
      return {
        label: isDay ? 'Clear Sky' : 'Clear Night',
        iconName: isDay ? 'Sun' : 'Moon',
        type: isDay ? 'clear-day' : 'clear-night',
        description: isDay ? 'Bright sunny skies' : 'Crisp starlit sky',
      };
    case 1:
      return {
        label: isDay ? 'Mainly Clear' : 'Mostly Clear',
        iconName: isDay ? 'SunMedium' : 'Moon',
        type: isDay ? 'clear-day' : 'clear-night',
        description: 'Scattered occasional clouds',
      };
    case 2:
      return {
        label: 'Partly Cloudy',
        iconName: isDay ? 'CloudSun' : 'CloudMoon',
        type: 'partly-cloudy',
        description: 'Sun alternating with cloud cover',
      };
    case 3:
      return {
        label: 'Overcast',
        iconName: 'Cloud',
        type: 'cloudy',
        description: 'Dense cloud ceiling blanket',
      };
    case 45:
    case 48:
      return {
        label: code === 48 ? 'Depositing Rime Fog' : 'Foggy',
        iconName: 'CloudFog',
        type: 'fog',
        description: 'Reduced visibility with lingering mist',
      };
    case 51:
    case 53:
    case 55:
      return {
        label: code === 51 ? 'Light Drizzle' : code === 53 ? 'Moderate Drizzle' : 'Dense Drizzle',
        iconName: 'CloudDrizzle',
        type: 'rain',
        description: 'Gentle mist and fine drops falling',
      };
    case 56:
    case 57:
      return {
        label: 'Freezing Drizzle',
        iconName: 'CloudHail',
        type: 'snow',
        description: 'Slick freezing drizzle surfaces',
      };
    case 61:
      return {
        label: 'Slight Rain',
        iconName: 'CloudRain',
        type: 'rain',
        description: 'Light passing rain showers',
      };
    case 63:
      return {
        label: 'Moderate Rain',
        iconName: 'CloudRain',
        type: 'rain',
        description: 'Steady raindrops with wet roads',
      };
    case 65:
      return {
        label: 'Heavy Rain',
        iconName: 'CloudRain',
        type: 'heavy-rain',
        description: 'Intense rainfall and water accumulation',
      };
    case 66:
    case 67:
      return {
        label: 'Freezing Rain',
        iconName: 'CloudHail',
        type: 'snow',
        description: 'Sub-zero liquid freezing upon impact',
      };
    case 71:
      return {
        label: 'Light Snow',
        iconName: 'CloudSnow',
        type: 'snow',
        description: 'Gentle flurries floating down',
      };
    case 73:
      return {
        label: 'Moderate Snow',
        iconName: 'CloudSnow',
        type: 'snow',
        description: 'Accumulating snowfall',
      };
    case 75:
      return {
        label: 'Heavy Snow',
        iconName: 'Snowflake',
        type: 'snow',
        description: 'Deep blizzard snow accumulation',
      };
    case 77:
      return {
        label: 'Snow Grains',
        iconName: 'Snowflake',
        type: 'snow',
        description: 'Small frozen ice particles',
      };
    case 80:
    case 81:
    case 82:
      return {
        label: code === 80 ? 'Light Rain Showers' : code === 81 ? 'Moderate Showers' : 'Violent Rain Showers',
        iconName: 'CloudRain',
        type: 'rain',
        description: 'Sudden burst of rain showers',
      };
    case 85:
    case 86:
      return {
        label: 'Snow Showers',
        iconName: 'CloudSnow',
        type: 'snow',
        description: 'Scattered intermittent snow bursts',
      };
    case 95:
      return {
        label: 'Thunderstorm',
        iconName: 'CloudLightning',
        type: 'thunderstorm',
        description: 'Electric storm with rumbling thunder',
      };
    case 96:
    case 99:
      return {
        label: 'Thunderstorm with Hail',
        iconName: 'CloudLightning',
        type: 'thunderstorm',
        description: 'Severe thunderstorm accompanied by hail',
      };
    default:
      return {
        label: 'Scattered Clouds',
        iconName: isDay ? 'CloudSun' : 'CloudMoon',
        type: 'partly-cloudy',
        description: 'Variable cloudiness across the sky',
      };
  }
};

// Background gradients matching atmospheric status
export const getWeatherBackground = (conditionType, isDay = 1) => {
  if (!isDay) {
    switch (conditionType) {
      case 'rain':
      case 'heavy-rain':
        return 'from-slate-950 via-slate-900 to-blue-950';
      case 'thunderstorm':
        return 'from-zinc-950 via-purple-950 to-slate-950';
      case 'snow':
        return 'from-slate-950 via-indigo-950 to-slate-900';
      case 'cloudy':
      case 'fog':
        return 'from-neutral-950 via-zinc-900 to-slate-950';
      default:
        return 'from-slate-950 via-indigo-950 to-blue-950';
    }
  }

  switch (conditionType) {
    case 'clear-day':
      return 'from-sky-400 via-blue-500 to-indigo-600';
    case 'partly-cloudy':
      return 'from-sky-500 via-blue-600 to-slate-700';
    case 'cloudy':
      return 'from-slate-600 via-slate-700 to-zinc-800';
    case 'fog':
      return 'from-slate-500 via-zinc-600 to-stone-700';
    case 'rain':
      return 'from-blue-700 via-slate-700 to-slate-800';
    case 'heavy-rain':
      return 'from-slate-800 via-blue-900 to-zinc-900';
    case 'snow':
      return 'from-sky-700 via-indigo-800 to-slate-800';
    case 'thunderstorm':
      return 'from-slate-900 via-purple-950 to-zinc-900';
    default:
      return 'from-sky-500 via-blue-600 to-indigo-700';
  }
};

// Unit conversion helpers
export const formatTemp = (celsius, unit = 'C') => {
  if (celsius === null || celsius === undefined || isNaN(celsius)) return '--';
  const val = unit === 'F' ? (celsius * 9) / 5 + 32 : celsius;
  return `${Math.round(val)}°${unit}`;
};

export const formatTempNumber = (celsius, unit = 'C') => {
  if (celsius === null || celsius === undefined || isNaN(celsius)) return 0;
  return Math.round(unit === 'F' ? (celsius * 9) / 5 + 32 : celsius);
};

export const formatSpeed = (kmh, unit = 'C') => {
  if (kmh === null || kmh === undefined || isNaN(kmh)) return '--';
  if (unit === 'F') {
    const mph = kmh * 0.621371;
    return `${Math.round(mph)} mph`;
  }
  return `${Math.round(kmh)} km/h`;
};

export const formatPrecipitation = (mm, unit = 'C') => {
  if (mm === null || mm === undefined || isNaN(mm)) return '--';
  if (unit === 'F') {
    const inches = mm * 0.03937;
    return `${inches.toFixed(2)} in`;
  }
  return `${mm.toFixed(1)} mm`;
};

export const formatVisibility = (meters, unit = 'C') => {
  if (meters === null || meters === undefined || isNaN(meters)) return '--';
  const km = meters / 1000;
  if (unit === 'F') {
    const miles = km * 0.621371;
    return `${miles.toFixed(1)} mi`;
  }
  return `${km.toFixed(1)} km`;
};

export const formatPressure = (hPa, unit = 'C') => {
  if (hPa === null || hPa === undefined || isNaN(hPa)) return '--';
  if (unit === 'F') {
    const inHg = hPa * 0.02953;
    return `${inHg.toFixed(2)} inHg`;
  }
  return `${Math.round(hPa)} hPa`;
};

// Air Quality Index interpretation
export const getAqiInfo = (aqi) => {
  if (aqi === null || aqi === undefined || isNaN(aqi)) {
    return { label: 'Unknown', color: 'text-gray-300', bg: 'bg-gray-500/20', advice: 'No air quality data available.' };
  }
  if (aqi <= 50) {
    return {
      label: 'Good',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-500/40',
      badge: 'bg-emerald-500',
      advice: 'Air quality is satisfactory and poses little or no risk.',
    };
  }
  if (aqi <= 100) {
    return {
      label: 'Moderate',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/40',
      badge: 'bg-yellow-500',
      advice: 'Acceptable quality; sensitive individuals should consider limiting heavy outdoor exertion.',
    };
  }
  if (aqi <= 150) {
    return {
      label: 'Sensitive',
      color: 'text-amber-400',
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/40',
      badge: 'bg-amber-500',
      advice: 'Members of sensitive groups may experience health effects. General public not likely affected.',
    };
  }
  if (aqi <= 200) {
    return {
      label: 'Unhealthy',
      color: 'text-rose-400',
      bg: 'bg-rose-500/20',
      border: 'border-rose-500/40',
      badge: 'bg-rose-500',
      advice: 'Everyone may begin to experience health effects; sensitive groups may experience more serious effects.',
    };
  }
  if (aqi <= 300) {
    return {
      label: 'Very Unhealthy',
      color: 'text-purple-400',
      bg: 'bg-purple-500/20',
      border: 'border-purple-500/40',
      badge: 'bg-purple-500',
      advice: 'Health alert: The risk of health effects is increased for everyone.',
    };
  }
  return {
    label: 'Hazardous',
    color: 'text-red-500',
    bg: 'bg-red-500/30',
    border: 'border-red-500/60',
    badge: 'bg-red-600',
    advice: 'Emergency conditions! Avoid outdoor activities completely.',
  };
};

// UV Index interpretation
export const getUvInfo = (uv) => {
  if (uv === null || uv === undefined || isNaN(uv)) {
    return { label: 'Low', color: 'text-emerald-400', advice: 'No protection required.' };
  }
  const rounded = Math.round(uv);
  if (rounded <= 2) {
    return { label: 'Low', color: 'text-emerald-400', advice: 'Low UV danger. Enjoy the outdoors safely.' };
  }
  if (rounded <= 5) {
    return { label: 'Moderate', color: 'text-yellow-400', advice: 'Wear sunglasses, hat, and SPF 30+ sunscreen.' };
  }
  if (rounded <= 7) {
    return { label: 'High', color: 'text-amber-500', advice: 'Protection required. Seek shade during midday.' };
  }
  if (rounded <= 10) {
    return { label: 'Very High', color: 'text-rose-500', advice: 'Extra protection needed. Limit sun 10am-4pm.' };
  }
  return { label: 'Extreme', color: 'text-purple-500', advice: 'Take full precautions. Unprotected skin burns fast.' };
};

// Compass cardinal directions
export const getWindDirectionName = (deg) => {
  if (deg === null || deg === undefined) return 'N';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((deg % 360) / 22.5) % 16;
  return directions[index];
};

// Date / Time formatting
export const formatHour = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
};

export const formatDayName = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return 'Today';
  return d.toLocaleDateString([], { weekday: 'short' });
};

export const formatDateFull = (isoString) => {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
};
