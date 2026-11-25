import React from 'react';
import {
  Sun,
  SunMedium,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  Snowflake,
  CloudHail,
  CloudLightning,
  Wind,
  Droplets,
  Eye,
  Compass,
  Sunrise,
  Sunset,
  Gauge,
  Thermometer,
  ShieldAlert,
  Sparkles,
  Umbrella,
} from 'lucide-react';

const iconMap = {
  Sun,
  SunMedium,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  Snowflake,
  CloudHail,
  CloudLightning,
  Wind,
  Droplets,
  Eye,
  Compass,
  Sunrise,
  Sunset,
  Gauge,
  Thermometer,
  ShieldAlert,
  Sparkles,
  Umbrella,
};

export const WeatherIcon = ({ name, className = 'w-6 h-6', ...props }) => {
  const IconComponent = iconMap[name] || Cloud;
  return <IconComponent className={className} {...props} />;
};

export default WeatherIcon;
