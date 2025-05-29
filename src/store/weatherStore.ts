import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WeatherData, Location, TemperatureUnit, SavedLocation } from '../types/weather';
import { getWeatherData, getReverseGeocoding } from '../services/weatherApi';

interface WeatherStore {
  currentWeather: WeatherData | null;
  selectedLocation: Location | null;
  savedLocations: SavedLocation[];
  recentLocations: Location[];
  temperatureUnit: TemperatureUnit;
  isLoading: boolean;
  error: string | null;
  getCurrentLocation: () => Promise<void>;
  setCurrentWeather: (weather: WeatherData) => void;
  setSelectedLocation: (location: Location) => void;
  addSavedLocation: (location: Location) => void;
  removeSavedLocation: (id: string) => void;
  addRecentLocation: (location: Location) => void;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useWeatherStore = create<WeatherStore>()(
  persist(
    (set, get) => ({
      currentWeather: null,
      selectedLocation: null,
      savedLocations: [],
      recentLocations: [],
      temperatureUnit: 'celsius',
      isLoading: false,
      error: null,

      getCurrentLocation: async () => {
        const store = get();
        store.setLoading(true);
        store.setError(null);
        
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });

          const { latitude: lat, longitude: lon } = position.coords;
          const location = await getReverseGeocoding(lat, lon);
          
          if (location) {
            store.setSelectedLocation(location);
            store.addRecentLocation(location);
            
            const weatherData = await getWeatherData(lat, lon);
            store.setCurrentWeather(weatherData);
          }
        } catch (error) {
          store.setError(error instanceof Error ? error.message : 'Failed to get current location');
        } finally {
          store.setLoading(false);
        }
      },

      setCurrentWeather: (weather) => set({ currentWeather: weather }),
      setSelectedLocation: (location) => set({ selectedLocation: location }),
      
      addSavedLocation: (location) => set((state) => ({
        savedLocations: [
          ...state.savedLocations,
          { ...location, id: crypto.randomUUID(), timestamp: Date.now() }
        ]
      })),
      
      removeSavedLocation: (id) => set((state) => ({
        savedLocations: state.savedLocations.filter((loc) => loc.id !== id)
      })),
      
      addRecentLocation: (location) => set((state) => ({
        recentLocations: [
          location,
          ...state.recentLocations.filter(
            (loc) => !(loc.lat === location.lat && loc.lon === location.lon)
          )
        ].slice(0, 5)
      })),
      
      setTemperatureUnit: (unit) => set({ temperatureUnit: unit }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'weather-store',
      partialize: (state) => ({
        savedLocations: state.savedLocations,
        recentLocations: state.recentLocations,
        temperatureUnit: state.temperatureUnit,
      }),
    }
  )
); 