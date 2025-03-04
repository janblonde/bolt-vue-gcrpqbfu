import { ref } from 'vue';
import type { Site, AreaRule, BookingDetails } from '../types';

// Create reactive stores that can be accessed globally
export const currentSite = ref<Site | null>(null);
export const areaRules = ref<AreaRule | null>(null);
export const bookingDetails = ref<BookingDetails>({
  nrOfNights: 1,
  nrOfVisitors: 1,
  useElectricity: false
});