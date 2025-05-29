import React from 'react';
import { motion } from 'framer-motion';
import { useWeatherStore } from '../../store/weatherStore';
import { useCurrentTime } from '../../hooks/useCurrentTime';
import type { WeatherData } from '../../types/weather';

const HourlyForecast = () => {
  const { currentWeather, temperatureUnit } = useWeatherStore();
  const { timestamp } = useCurrentTime();

  if (!currentWeather) {
    return null;
  }

  const currentHour = Math.floor(timestamp / 1000);
  const next24Hours = currentWeather.hourly
    .filter(hour => hour.dt >= currentHour)
    .slice(0, 24);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900
                rounded-xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
        24-Hour Forecast
      </h3>
      <div className="relative">
        <div className="flex overflow-x-auto pb-4 hide-scrollbar -mx-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <div className="flex space-x-2 sm:space-x-4 px-2">
            {next24Hours.map((hour, index) => (
              <HourlyCard 
                key={hour.dt} 
                forecast={hour} 
                isNow={index === 0}
                temperatureUnit={temperatureUnit} 
              />
            ))}
          </div>
        </div>
        <div className="absolute left-0 top-0 bottom-4 w-4 sm:w-8 bg-gradient-to-r from-white to-transparent dark:from-gray-800 dark:to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-4 w-4 sm:w-8 bg-gradient-to-l from-white to-transparent dark:from-gray-800 dark:to-transparent pointer-events-none" />
      </div>
    </motion.div>
  );
};

interface HourlyCardProps {
  forecast: WeatherData['hourly'][0];
  isNow: boolean;
  temperatureUnit: 'celsius' | 'fahrenheit';
}

const HourlyCard = ({ forecast, isNow, temperatureUnit }: HourlyCardProps) => {
  const temp = temperatureUnit === 'fahrenheit' 
    ? (forecast.temp * 9/5) + 32 
    : forecast.temp;

  const time = isNow 
    ? 'Now' 
    : new Date(forecast.dt * 1000).toLocaleTimeString([], { 
        hour: 'numeric',
        hour12: true
      });

  return (
    <div className="flex flex-col items-center min-w-[70px] sm:min-w-[90px] p-3 sm:p-4 rounded-lg 
                    bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm
                    border border-gray-100 dark:border-gray-700
                    hover:bg-white/80 dark:hover:bg-gray-700/80 transition-colors duration-200">
      <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
        {time}
      </span>
      <span className="text-2xl sm:text-3xl my-2 sm:my-3">
        {getWeatherIcon(forecast.weather[0].icon)}
      </span>
      <span className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white">
        {Math.round(temp)}°
      </span>
      {forecast.pop > 0 && (
        <div className="flex items-center gap-1 mt-1 sm:mt-2">
          <span className="text-xs sm:text-sm">💧</span>
          <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">
            {Math.round(forecast.pop * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};

const getWeatherIcon = (iconCode: string) => {
  const iconMap: { [key: string]: string } = {
    '01d': '☀️',
    '01n': '🌙',
    '02d': '⛅',
    '02n': '☁️',
    '03d': '☁️',
    '03n': '☁️',
    '04d': '☁️',
    '04n': '☁️',
    '09d': '🌧️',
    '09n': '🌧️',
    '10d': '🌦️',
    '10n': '🌧️',
    '11d': '⛈️',
    '11n': '⛈️',
    '13d': '🌨️',
    '13n': '🌨️',
    '50d': '🌫️',
    '50n': '🌫️',
  };
  return iconMap[iconCode] || '☁️';
};

export const HourlyForecastComponent = HourlyForecast;
export default HourlyForecast; 