import { GYM_DETAILS } from '@/lib/constants';

export function useGymSettings() {
  return { 
    gymDetails: GYM_DETAILS, 
    saveGymDetails: () => {} 
  };
}
