import { useState, useEffect } from 'react';

interface TimeFormat {
  time: string;
  date: string;
  dateTime: string;
  hour: string;
  timestamp: number;
}

export const useCurrentTime = (): TimeFormat => {
  const [timeFormat, setTimeFormat] = useState<TimeFormat>({
    time: '',
    date: '',
    dateTime: '',
    hour: '',
    timestamp: Date.now(),
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      setTimeFormat({
        time: now.toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit',
          hour12: true 
        }),
        date: now.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        dateTime: now.toLocaleDateString(undefined, {
          weekday: 'long',
          hour: 'numeric',
          minute: 'numeric'
        }),
        hour: now.toLocaleTimeString([], { hour: 'numeric' }),
        timestamp: now.getTime(),
      });
    };

    updateTime(); // Initial update
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return timeFormat;
}; 