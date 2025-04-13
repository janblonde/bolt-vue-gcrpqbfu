import { ref, watch } from 'vue';
import type { Site, AreaRule, BookingDetails } from '../types';

// Create reactive stores that can be accessed globally
export const currentSite = ref<Site | null>(null);
export const areaRules = ref<AreaRule | null>(null);
export const bookingDetails = ref<BookingDetails>({
  nrOfNights: 1,
  nrOfVisitors: 1,
  useElectricity: false
});

// Load site data from localStorage on initialization
const savedSite = localStorage.getItem('currentSite');
if (savedSite) {
  try {
    currentSite.value = JSON.parse(savedSite);
  } catch (error) {
    console.error('Error parsing saved site data:', error);
    localStorage.removeItem('currentSite');
  }
}

// Watch for changes to currentSite and persist to localStorage
watch(currentSite, (newValue) => {
  if (newValue) {
    localStorage.setItem('currentSite', JSON.stringify(newValue));
  } else {
    localStorage.removeItem('currentSite');
  }
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
  localStorage.removeItem('currentSite');
};