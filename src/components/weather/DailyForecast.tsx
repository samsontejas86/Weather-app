import React from 'react';
import { motion } from 'framer-motion';
import { useWeatherStore } from '../../store/weatherStore';
import { useCurrentTime } from '../../hooks/useCurrentTime';
import type { WeatherData } from '../../types/weather';

const DailyForecast = () => {
  const { currentWeather, temperatureUnit } = useWeatherStore();
  const { timestamp } = useCurrentTime();

  if (!currentWeather) {
    return null;
  }

  // Filter to show only future days from current time
  const currentDay = Math.floor(timestamp / (1000 * 60 * 60 * 24));
  const next7Days = currentWeather.daily
    .filter(day => Math.floor(day.dt / (60 * 60 * 24)) >= currentDay)
    .slice(0, 7);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900
                rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        7-Day Forecast
      </h3>
      <div className="space-y-3">
        {next7Days.map((day, index) => (
          <DailyCard 
            key={day.dt} 
            forecast={day} 
            isToday={index === 0}
            temperatureUnit={temperatureUnit} 
          />
        ))}
      </div>
    </motion.div>
  );
};

interface DailyCardProps {
  forecast: WeatherData['daily'][0];
  isToday: boolean;
  temperatureUnit: 'celsius' | 'fahrenheit';
}

const DailyCard = ({ forecast, isToday, temperatureUnit }: DailyCardProps) => {
  const maxTemp = temperatureUnit === 'fahrenheit'
    ? (forecast.temp.max * 9/5) + 32
    : forecast.temp.max;

  const minTemp = temperatureUnit === 'fahrenheit'
    ? (forecast.temp.min * 9/5) + 32
    : forecast.temp.min;

  const dayName = isToday 
    ? 'Today' 
    : new Date(forecast.dt * 1000).toLocaleDateString(undefined, {
        weekday: 'long',
      });

  return (
    <div className="flex items-center justify-between p-4 rounded-lg 
                    bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm
                    border border-gray-100 dark:border-gray-700
                    hover:bg-white/80 dark:hover:bg-gray-700/80 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <span className="text-3xl">
          {getWeatherIcon(forecast.weather[0].icon)}
        </span>
        <div>
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {dayName}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
            {forecast.weather[0].description}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        {forecast.pop > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-sm">💧</span>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {Math.round(forecast.pop * 100)}%
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {Math.round(maxTemp)}°
          </span>
          <span className="text-lg text-gray-500 dark:text-gray-400">
            {Math.round(minTemp)}°
          </span>
        </div>
      </div>
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

export const DailyForecastComponent = DailyForecast;
export default DailyForecast; 