import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWeatherStore } from '../store/weatherStore';
import { getWeatherData, searchLocations, getReverseGeocoding } from '../services/weatherApi';
import type { Location } from '../types/weather';

export const useWeather = () => {
  const queryClient = useQueryClient();
  const {
    selectedLocation,
    setCurrentWeather,
    setSelectedLocation,
    addRecentLocation,
    setLoading,
    setError,
  } = useWeatherStore();

  const { data: weatherData, isLoading, error } = useQuery({
    queryKey: ['weather', selectedLocation?.lat, selectedLocation?.lon],
    queryFn: async () => {
      if (!selectedLocation) {
        throw new Error('No location selected');
      }
      console.log('Fetching weather data for:', selectedLocation);
      const data = await getWeatherData(selectedLocation.lat, selectedLocation.lon);
      console.log('Weather data fetched successfully:', data);
      setCurrentWeather(data);
      setError(null);
      return data;
    },
    enabled: !!selectedLocation,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const searchLocation = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Searching for location:', query);
      const locations = await searchLocations(query);
      console.log('Search results:', locations);
      return locations;
    } catch (error) {
      console.error('Search error:', error);
      setError(error instanceof Error ? error.message : 'Failed to search locations');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    return new Promise<Location>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            console.log('Got current position:', position.coords);
            const { latitude: lat, longitude: lon } = position.coords;
            const location = await getReverseGeocoding(lat, lon);
            if (location) {
              console.log('Got location name:', location);
              resolve(location);
            } else {
              reject(new Error('Could not find location name'));
            }
          } catch (error) {
            console.error('Error getting location name:', error);
            reject(error);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          reject(new Error('Failed to get current location'));
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    });
  };

  const selectLocation = (location: Location) => {
    console.log('Selecting location:', location);
    setSelectedLocation(location);
    addRecentLocation(location);
    queryClient.invalidateQueries({ queryKey: ['weather'] });
  };

  return {
    weatherData,
    isLoading,
    error,
    searchLocation,
    getCurrentLocation,
    selectLocation,
  };
}; 