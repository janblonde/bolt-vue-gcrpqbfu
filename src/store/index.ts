// import { ref } from 'vue';
// import type { Site, AreaRule, BookingDetails } from '../types';

// // Create reactive stores that can be accessed globally
// export const currentSite = ref<Site | null>(null);
// export const areaRules = ref<AreaRule | null>(null);
// export const bookingDetails = ref<BookingDetails>({
//   nrOfNights: 1,
//   nrOfVisitors: 1,
//   useElectricity: false
// });

// // Function to clear site data
// export const clearSiteData = () => {
//   currentSite.value = null;
//   areaRules.value = null;
//   bookingDetails.value = {
//     nrOfNights: 1,
//     nrOfVisitors: 1,
//     useElectricity: false
//   };
// };

import { ref, watch } from 'vue';
import type { Site, AreaRule, BookingDetails } from '../types';

// Initialize refs with data from localStorage if available
const getSavedData = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e);
    return defaultValue;
  }
};

// Create reactive stores that can be accessed globally
export const currentSite = ref<Site | null>(
  getSavedData('currentSite', null)
);

export const areaRules = ref<AreaRule | null>(
  getSavedData('areaRules', null)
);

export const bookingDetails = ref<BookingDetails>(
  getSavedData('bookingDetails', {
    nrOfNights: 1,
    nrOfVisitors: 1,
    useElectricity: false
  })
);

// Set up watchers to save data changes to localStorage
watch(currentSite, (newValue) => {
  localStorage.setItem('currentSite', JSON.stringify(newValue));
}, { deep: true });

watch(areaRules, (newValue) => {
  localStorage.setItem('areaRules', JSON.stringify(newValue));
}, { deep: true });

watch(bookingDetails, (newValue) => {
  localStorage.setItem('bookingDetails', JSON.stringify(newValue));
}, { deep: true });

// Function to clear site data
export const clearSiteData = () => {
  currentSite.value = null;
  areaRules.value = null;
  bookingDetails.value = {
    nrOfNights: 1,
    nrOfVisitors: 1,
    useElectricity: false
  };
  
  // Also clear localStorage
  localStorage.removeItem('currentSite');
  localStorage.removeItem('areaRules');
  localStorage.removeItem('bookingDetails');
};