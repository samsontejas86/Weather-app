export interface WeatherData {
  current: {
    dt: number;
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    pressure: number;
    visibility: number;
    sunrise?: number;
    sunset?: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
  };
  hourly: Array<{
    dt: number;
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    pop: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
  }>;
  daily: Array<{
    dt: number;
    temp: {
      min: number;
      max: number;
      day: number;
      night: number;
      eve: number;
      morn: number;
    };
    feels_like: {
      day: number;
      night: number;
      eve: number;
      morn: number;
    };
    humidity: number;
    wind_speed: number;
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    pop: number;
    uvi: number;
  }>;
  alerts?: WeatherAlert[];
}

export interface WeatherAlert {
  sender_name: string;
  event: string;
  start: number;
  end: number;
  description: string;
  tags: string[];
}

export interface Location {
  lat: number;
  lon: number;
  name: string;
  country: string;
  state?: string;
  id?: string;
  timestamp?: number;
}

export interface SavedLocation extends Location {
  id: string;
  timestamp: number;
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'ms' | 'kmh' | 'mph'; 