import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Star, RefreshCw, X } from 'lucide-react';
import { searchLocations } from '../services/weatherApi';

export const Header = ({
  currentLocation,
  onSelectLocation,
  onUseGeolocation,
  unit,
  onToggleUnit,
  onRefresh,
  loading,
  favorites,
  onToggleFavorite,
  isFavorite,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const locations = await searchLocations(query);
        setResults(locations);
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc) => {
    onSelectLocation(loc);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <header className="w-full flex flex-col gap-4">
      {/* Top navbar row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-lg text-white font-bold text-xl">
            ☁️
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              SkyPulse <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 font-medium text-white/90">LIVE</span>
            </h1>
            <p className="text-xs text-white/70">Real-time Weather & Global Forecast</p>
          </div>
        </div>

        {/* Action Controls: Refresh, Unit Switcher, Bookmark */}
        <div className="flex items-center gap-2">
          {/* Bookmark / Favorite current location */}
          <button
            onClick={onToggleFavorite}
            title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
            className={`p-2.5 rounded-xl border backdrop-blur-md transition-all duration-200 cursor-pointer ${
              isFavorite
                ? 'bg-amber-400/30 border-amber-300/60 text-amber-300 shadow-md shadow-amber-500/20'
                : 'bg-white/10 hover:bg-white/20 border-white/20 text-white/80 hover:text-white'
            }`}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-300' : ''}`} />
          </button>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            title="Refresh weather data"
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white backdrop-blur-md transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Unit Switcher */}
          <div className="flex items-center bg-black/20 backdrop-blur-md p-1 rounded-xl border border-white/20">
            <button
              onClick={() => unit !== 'C' && onToggleUnit('C')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                unit === 'C'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              °C
            </button>
            <button
              onClick={() => unit !== 'F' && onToggleUnit('F')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                unit === 'F'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              °F
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar & Auto-Geolocation Button */}
      <div className="relative w-full" ref={wrapperRef}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/60">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Search city, district, or coordinates (e.g. Tokyo, Paris, New York)..."
              className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white/15 hover:bg-white/20 focus:bg-white/25 text-white placeholder-white/60 backdrop-blur-lg border border-white/25 focus:border-white/50 focus:outline-none transition-all shadow-lg text-sm"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setResults([]);
                }}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Geolocation Button */}
          <button
            onClick={onUseGeolocation}
            disabled={loading}
            title="Use current GPS location"
            className="flex items-center gap-1.5 px-3.5 py-3 rounded-2xl bg-white/20 hover:bg-white/30 active:scale-95 border border-white/30 text-white backdrop-blur-lg shadow-lg transition-all cursor-pointer text-xs font-semibold whitespace-nowrap"
          >
            <MapPin className="w-4 h-4 text-emerald-300" />
            <span className="hidden sm:inline">My Location</span>
          </button>
        </div>

        {/* Dropdown Suggestions */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto">
            {searching ? (
              <div className="flex items-center justify-center gap-2 py-6 text-white/70 text-sm">
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                <span>Searching cities...</span>
              </div>
            ) : results.length > 0 ? (
              <ul className="divide-y divide-white/10">
                {results.map((loc) => (
                  <li key={loc.id}>
                    <button
                      onClick={() => handleSelect(loc)}
                      className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                        <div>
                          <span className="text-white font-medium text-sm">
                            {loc.name}
                          </span>
                          {(loc.admin1 || loc.country) && (
                            <span className="text-white/60 text-xs ml-2">
                              {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                      {loc.countryCode && (
                        <span className="text-xs uppercase px-2 py-0.5 rounded bg-white/10 text-white/70 font-mono">
                          {loc.countryCode}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            ) : query.trim().length >= 2 ? (
              <div className="py-6 text-center text-white/60 text-sm">
                No matching locations found for "{query}"
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Quick Location Chips / Saved Favorites Bar */}
      {favorites.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-white/60 font-medium whitespace-nowrap flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-300 fill-amber-300" /> Saved:
          </span>
          {favorites.map((fav) => {
            const isActive =
              Math.abs(fav.latitude - currentLocation.latitude) < 0.05 &&
              Math.abs(fav.longitude - currentLocation.longitude) < 0.05;
            return (
              <button
                key={fav.id || `${fav.latitude}_${fav.longitude}`}
                onClick={() => onSelectLocation(fav)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all border cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 border-white font-semibold shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white/90 border-white/20'
                }`}
              >
                {fav.name}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default Header;
