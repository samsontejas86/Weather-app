import axios from 'axios';
import type { WeatherData, Location } from '../types/weather';

const OPENWEATHER_API_KEY = 'f1c04d4ed282cc8760b3def298788efd';
const BASE_URL = 'https://api.openweathermap.org';

// Validate API key format
const isValidApiKey = (key: string | undefined): boolean => {
  return typeof key === 'string' && /^[a-f0-9]{32}$/i.test(key);
};

// Test API key function
const testApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await axios.get(`${BASE_URL}/data/2.5/weather`, {
      params: {
        q: 'London',
        appid: apiKey,
        units: 'metric'
      }
    });
    return response.status === 200;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Key Test Error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        code: error.code
      });
    }
    return false;
  }
};

// Log API key status (without exposing the full key)
console.log('API Key Status:', {
  exists: !!OPENWEATHER_API_KEY,
  length: OPENWEATHER_API_KEY?.length,
  isValid: isValidApiKey(OPENWEATHER_API_KEY),
  firstChars: OPENWEATHER_API_KEY?.substring(0, 4),
  lastChars: OPENWEATHER_API_KEY?.substring(OPENWEATHER_API_KEY?.length - 4)
});

if (!OPENWEATHER_API_KEY) {
  throw new Error('OpenWeather API key is not defined!');
}

if (!isValidApiKey(OPENWEATHER_API_KEY)) {
  throw new Error('OpenWeather API key appears to be invalid. It should be 32 characters long and contain only hexadecimal characters.');
}

// Test the API key on startup
testApiKey(OPENWEATHER_API_KEY).then(isWorking => {
  if (!isWorking) {
    console.error('API Key test failed. The key might be invalid or not yet activated (can take 2-4 hours after creation).');
  } else {
    console.log('API Key test successful!');
  }
});

const api = axios.create({
  baseURL: BASE_URL,
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    // Add API key to each request
    config.params = {
      ...config.params,
      appid: OPENWEATHER_API_KEY,
      units: 'metric'
    };
    
    // Log request details (without exposing the full API key)
    const logParams = { ...config.params };
    if (logParams.appid) {
      logParams.appid = `${logParams.appid.substring(0, 4)}...${logParams.appid.substring(logParams.appid.length - 4)}`;
    }
    
    console.log('API Request:', {
      method: config.method,
      url: `${config.baseURL}${config.url}`,
      params: logParams,
    });
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: `${response.config.baseURL}${response.config.url}`,
      data: response.data
    });
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      console.error('API Response Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message,
        url: error.config?.url,
        code: error.code
      });

      // Special handling for common API key issues
      if (error.response?.status === 401) {
        const message = error.response?.data?.message || '';
        if (message.includes('Invalid API key')) {
          throw new Error('Invalid API key. Please check if your API key is correct.');
        } else if (message.includes('subscription')) {
          throw new Error('API key subscription issue. Please check your OpenWeather account.');
        } else {
          throw new Error('API key not activated yet. Please wait 2-4 hours after creating a new key.');
        }
      }
    }
    return Promise.reject(error);
  }
);

export const getWeatherData = async (lat: number, lon: number): Promise<WeatherData> => {
  try {
    const [currentWeatherResponse, forecastResponse] = await Promise.all([
      api.get('/data/2.5/weather', {
        params: { lat, lon }
      }),
      api.get('/data/2.5/forecast', {
        params: { lat, lon }
      })
    ]);

    const currentData = currentWeatherResponse.data;
    const forecastData = forecastResponse.data;

    const current = {
      temp: currentData.main.temp,
      feels_like: currentData.main.feels_like,
      humidity: currentData.main.humidity,
      wind_speed: currentData.wind.speed,
      weather: currentData.weather,
      dt: currentData.dt,
      sunrise: currentData.sys.sunrise,
      sunset: currentData.sys.sunset,
      pressure: currentData.main.pressure,
      visibility: currentData.visibility,
      uvi: 0
    };

    const hourly = forecastData.list.slice(0, 24).map((item: any) => ({
      dt: item.dt,
      temp: item.main.temp,
      feels_like: item.main.feels_like,
      humidity: item.main.humidity,
      wind_speed: item.wind.speed,
      weather: item.weather,
      pop: item.pop || 0
    }));

    const daily = forecastData.list.reduce((acc: any[], item: any) => {
      const date = new Date(item.dt * 1000).getDate();
      const existingDay = acc.find(d => new Date(d.dt * 1000).getDate() === date);

      if (!existingDay && acc.length < 5) {
        acc.push({
          dt: item.dt,
          temp: {
            min: item.main.temp_min,
            max: item.main.temp_max,
            day: item.main.temp,
            night: item.main.temp,
            eve: item.main.temp,
            morn: item.main.temp
          },
          feels_like: {
            day: item.main.feels_like,
            night: item.main.feels_like,
            eve: item.main.feels_like,
            morn: item.main.feels_like
          },
          humidity: item.main.humidity,
          wind_speed: item.wind.speed,
          weather: item.weather,
          pop: item.pop || 0,
          uvi: 0
        });
      }
      return acc;
    }, []);

    return {
      current,
      hourly,
      daily,
      alerts: []
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

export const searchLocations = async (query: string): Promise<Location[]> => {
  try {
    const response = await api.get('/geo/1.0/direct', {
      params: {
        q: query,
        limit: 5
      }
    });

    return response.data.map((item: any) => ({
      lat: item.lat,
      lon: item.lon,
      name: item.name,
      country: item.country,
      state: item.state
    }));
  } catch (error) {
    console.error('Error searching locations:', error);
    throw error;
  }
};

export const getReverseGeocoding = async (lat: number, lon: number): Promise<Location | null> => {
  try {
    const response = await api.get('/geo/1.0/reverse', {
      params: { lat, lon, limit: 1 }
    });

    if (response.data.length === 0) {
      return null;
    }

    const item = response.data[0];
    return {
      lat: item.lat,
      lon: item.lon,
      name: item.name,
      country: item.country,
      state: item.state
    };
  } catch (error) {
    console.error('Error getting reverse geocoding:', error);
    throw error;
  }
}; 