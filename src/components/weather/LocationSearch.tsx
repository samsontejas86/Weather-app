import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useWeather } from '../../hooks/useWeather';
import { useWeatherStore } from '../../store/weatherStore';
import type { Location } from '../../types/weather';

const LocationSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { searchLocation, getCurrentLocation, selectLocation } = useWeather();
  const { savedLocations, recentLocations } = useWeatherStore();

  const performSearch = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const locations = await searchLocation(searchQuery);
      setResults(locations);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setError('Failed to search locations. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      performSearch(query);
    }
  };

  const handleSearchClick = () => {
    performSearch(query);
  };

  const handleLocationSelect = (location: Location) => {
    selectLocation(location);
    setQuery('');
    setResults([]);
    setIsSearching(false);
    setError(null);
    inputRef.current?.focus();
  };

  const handleGetCurrentLocation = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      const location = await getCurrentLocation();
      if (location) {
        selectLocation(location);
        setQuery('');
        setResults([]);
        inputRef.current?.focus();
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'Failed to get current location. Please make sure location access is enabled.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Search for a city..."
                className="w-full pl-10 pr-24 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-200"
                disabled={isLoading}
                autoComplete="off"
                autoFocus
              />
              <button
                onClick={handleSearchClick}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5
                         bg-blue-500 hover:bg-blue-600 active:bg-blue-700
                         text-white rounded-md flex items-center gap-1
                         transition-all duration-200 disabled:opacity-50"
                disabled={isLoading || query.length < 2}
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>
          </div>
          <button
            onClick={handleGetCurrentLocation}
            className="px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 active:bg-blue-700
                     text-white flex items-center gap-2 min-w-[140px] justify-center
                     transition-all duration-200 disabled:opacity-50"
            disabled={isLoading}
            type="button"
          >
            <MapPinIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {isLoading ? 'Getting...' : 'Current Location'}
            </span>
          </button>
        </div>

        {error && (
          <div className="text-red-500 dark:text-red-400 text-sm px-2 animate-fade-in">
            {error}
          </div>
        )}
      </div>

      <AnimatePresence>
        {(isSearching || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg
                     border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {isSearching ? (
              <div className="p-4 text-center">
                <div className="animate-shimmer h-8 w-3/4 mx-auto rounded-md bg-gray-200 dark:bg-gray-700"></div>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((location) => (
                  <button
                    key={`${location.lat}-${location.lon}`}
                    onClick={() => handleLocationSelect(location)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700
                             flex items-center gap-3 transition-colors duration-150"
                    type="button"
                  >
                    <MapPinIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <span className="truncate text-gray-900 dark:text-white">
                      {location.name}, {location.country}
                    </span>
                  </button>
                ))}
              </div>
            ) : query.length >= 2 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No results found
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {(savedLocations.length > 0 || recentLocations.length > 0) && !query && (
        <div className="mt-8 space-y-6">
          {savedLocations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Saved Locations
              </h4>
              <div className="flex flex-wrap gap-2">
                {savedLocations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium
                             bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-100
                             hover:bg-blue-200 dark:hover:bg-blue-800
                             transition-colors duration-150"
                    type="button"
                  >
                    {location.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {recentLocations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                Recent Searches
              </h4>
              <div className="flex flex-wrap gap-2">
                {recentLocations.map((location, index) => (
                  <button
                    key={`${location.lat}-${location.lon}-${index}`}
                    onClick={() => handleLocationSelect(location)}
                    className="px-3 py-1.5 rounded-full text-sm font-medium
                             bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300
                             hover:bg-gray-200 dark:hover:bg-gray-700
                             transition-colors duration-150"
                    type="button"
                  >
                    {location.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Add TypeScript declaration for the window object
declare global {
  interface Window {
    searchTimeout: number | undefined;
  }
}

export const LocationSearchComponent = LocationSearch;
export default LocationSearch; 