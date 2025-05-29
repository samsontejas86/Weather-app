import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useWeatherStore } from '../../store/weatherStore';
import { useCurrentTime } from '../../hooks/useCurrentTime';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { LatLngTuple } from 'leaflet';

// Fix for default marker icon in react-leaflet
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to handle map updates
function MapUpdater({ position }: { position: LatLngTuple }) {
  const map = useMap();
  
  React.useEffect(() => {
    map.flyTo(position, map.getZoom(), {
      duration: 2
    });
  }, [map, position]);

  return null;
}

// Component to handle weather marker
function WeatherMarker({ position }: { position: LatLngTuple }) {
  const { currentWeather, selectedLocation, temperatureUnit } = useWeatherStore();
  const { time } = useCurrentTime();

  if (!currentWeather || !selectedLocation) return null;

  const temp = temperatureUnit === 'fahrenheit'
    ? (currentWeather.current.temp * 9/5) + 32
    : currentWeather.current.temp;

  return (
    <Marker position={position}>
      <Popup>
        <div className="text-center py-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedLocation.name}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {time}
          </p>
          <div className="mt-2 space-y-1">
            <p className="text-3xl">
              {getWeatherIcon(currentWeather.current.weather[0].icon)}
            </p>
            <p className="text-base text-gray-700">
              {Math.round(temp)}°{temperatureUnit === 'celsius' ? 'C' : 'F'}
            </p>
            <p className="text-sm text-gray-600 capitalize">
              {currentWeather.current.weather[0].description}
            </p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

const WeatherMap = () => {
  const { selectedLocation, currentWeather } = useWeatherStore();

  if (!selectedLocation || !currentWeather) return null;

  const position: LatLngTuple = [selectedLocation.lat, selectedLocation.lon];

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900
                    rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Weather Map
      </h2>
      <div className="h-[400px] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <MapContainer
          center={position}
          zoom={10}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapUpdater position={position} />
          <WeatherMarker position={position} />
        </MapContainer>
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

export default WeatherMap; 