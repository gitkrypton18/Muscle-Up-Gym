import { useState, useEffect } from 'react';
import { GYM_DETAILS as DEFAULT_GYM_DETAILS } from '@/lib/constants';

export function useGymSettings() {
  const [gymDetails, setGymDetails] = useState(DEFAULT_GYM_DETAILS);

  useEffect(() => {
    const saved = localStorage.getItem('gym_settings');
    if (saved) {
      try {
        setGymDetails(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse gym settings', e);
      }
    }
  }, []);

  const saveGymDetails = (newDetails) => {
    setGymDetails(newDetails);
    localStorage.setItem('gym_settings', JSON.stringify(newDetails));
  };

  return { gymDetails, saveGymDetails };
}
