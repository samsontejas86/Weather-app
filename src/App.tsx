import React, { useEffect } from 'react';
import { useWeatherStore } from './store/weatherStore';
import LocationSearch from './components/weather/LocationSearch';
import CurrentWeather from './components/weather/CurrentWeather';
import HourlyForecast from './components/weather/HourlyForecast';
import DailyForecast from './components/weather/DailyForecast';
import WeatherMap from './components/weather/WeatherMap';
import { Scene3D } from './components/3d/Scene3D';

function App() {
  const { getCurrentLocation } = useWeatherStore();

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Left side - Weather Information */}
          <div className="space-y-4 sm:space-y-6">
            <LocationSearch />
            <CurrentWeather />
            <HourlyForecast />
            <DailyForecast />
          </div>

          {/* Right side - Globe and Map */}
          <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-4 lg:self-start">
            {/* 3D Globe */}
            <div className="h-[300px] sm:h-[400px] rounded-lg overflow-hidden bg-gray-800 shadow-xl">
              <Scene3D />
            </div>

            {/* Weather Map */}
            <div className="h-[300px] sm:h-[400px] rounded-lg overflow-hidden shadow-xl">
              <WeatherMap />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App; 