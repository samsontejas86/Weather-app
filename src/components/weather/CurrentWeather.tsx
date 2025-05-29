import React from 'react';
import { motion } from 'framer-motion';
import { useWeatherStore } from '../../store/weatherStore';
import { useCurrentTime } from '../../hooks/useCurrentTime';

const CurrentWeather = () => {
  const { currentWeather, selectedLocation, temperatureUnit } = useWeatherStore();
  const { time, date } = useCurrentTime();

  if (!currentWeather || !selectedLocation) {
    return null;
  }

  const { current } = currentWeather;
  const temp = temperatureUnit === 'fahrenheit' 
    ? (current.temp * 9/5) + 32 
    : current.temp;
  const feelsLike = temperatureUnit === 'fahrenheit'
    ? (current.feels_like * 9/5) + 32
    : current.feels_like;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900
                rounded-xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-100 dark:border-gray-700"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 truncate">
            {selectedLocation.name}
            {selectedLocation.country && (
              <span className="text-gray-500 dark:text-gray-400 ml-2 text-xl sm:text-2xl">
                {selectedLocation.country}
              </span>
            )}
          </h2>
          <div className="space-y-1">
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
              {date}
            </p>
            <p className="text-xl sm:text-2xl font-medium text-gray-700 dark:text-gray-200">
              {time}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-4xl sm:text-6xl font-bold bg-clip-text text-transparent 
                        bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500">
            {Math.round(temp)}°{temperatureUnit === 'celsius' ? 'C' : 'F'}
          </div>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 mt-2">
            Feels like {Math.round(feelsLike)}°
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
        <WeatherDetail
          label="Humidity"
          value={`${current.humidity}%`}
          icon="💧"
        />
        <WeatherDetail
          label="Wind"
          value={`${Math.round(current.wind_speed)} m/s`}
          icon="💨"
        />
        <WeatherDetail
          label="Pressure"
          value={`${current.pressure} hPa`}
          icon="📊"
        />
        <WeatherDetail
          label="Visibility"
          value={`${(current.visibility / 1000).toFixed(1)} km`}
          icon="👁️"
        />
      </div>

      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div className="flex items-center">
          <span className="text-4xl sm:text-6xl mr-4">
            {getWeatherIcon(current.weather[0].icon)}
          </span>
          <span className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 capitalize">
            {current.weather[0].description}
          </span>
        </div>
        {current.sunrise && current.sunset && (
          <div className="text-gray-600 dark:text-gray-300 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">🌅</span>
              <span className="text-base sm:text-lg">{formatTime(current.sunrise)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">🌇</span>
              <span className="text-base sm:text-lg">{formatTime(current.sunset)}</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const WeatherDetail = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
  <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg 
                  bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
    <span className="text-2xl sm:text-3xl">{icon}</span>
    <div>
      <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const formatTime = (timestamp: number) => {
  return new Date(timestamp * 1000).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
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

export const CurrentWeatherComponent = CurrentWeather;
export default CurrentWeather; 