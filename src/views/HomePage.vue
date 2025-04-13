<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { db } from '../firebase';
import { currentSite } from '../store';
import type { Site } from '../types';
import LoadingSpinner from '../components/LoadingSpinner.vue';

const router = useRouter();
const siteLoading = ref(false);
const site = reactive<Site>({
  id: '',
  siteID: '',
  name: '',
  maxPeriod: false,
  addressRegistrationRequired: false,
  algoVersion: '',
  applyMaxNrOfNights: false,
  automaticGate: false,
  automaticGatePIN: false,
  automaticGatePhoneNumber: '',
  availablePlaces: 0,
  checkAvailablePlaces: false,
  checkoutTime: 0,
  creationDate: { __time__: '' },
  electricityOption: false,
  email: '',
  emailCopy: false,
  freeVisitors: 0,
  hasCheckoutTime: false,
  location: { __lat__: 0, __lon__: 0 },
  lowSeasonEnd: 0,
  lowSeasonPrice: 0,
  lowSeasonStart: 0,
  maxNrOfNights: 0,
  maxPeriodPeriod: 0,
  minDaysReservationCancellationRefund: 0,
  onlyWaterOption: false,
  passportNumberRegistrationRequired: false,
  payingSite: false,
  priceForElectricity: 0,
  priceForWater: 0,
  pricePerNight: 0,
  pricePerVisitor: 0,
  reservationsAllowed: false,
  reservationsCancellationAllowed: false,
  seasonalPricing: false,
  splitAccount: '',
  splitAmount: 0,
  status: '',
  tourismTax: false,
  tourismTaxOnlyAdults: false,
  tourismTaxPerVisitor: 0,
  visitorRegistrationRequired: false,
  waterDevice: '',
  wifiCodes: false
});
const siteError = ref('');

// Get the 'site' parameter from the URL
const getSiteParam = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('site');
};

// Fetch site data from Firestore
const fetchSiteData = async () => {
  const siteParam = getSiteParam();
  
  if (!siteParam) {
    siteError.value = 'No site parameter provided in URL';
    return;
  }
  
  siteLoading.value = true;
  try {
    // Query the sites collection where siteID equals the URL parameter
    const sitesQuery = query(
      collection(db, 'sites'),
      where('siteID', '==', siteParam),
      limit(1)
    );
    
    const querySnapshot = await getDocs(sitesQuery);
    
    if (!querySnapshot.empty) {
      const siteDoc = querySnapshot.docs[0];
      const siteData = siteDoc.data();
      
      // Update the site reactive object
      site.id = siteDoc.id;
      
      // Copy all properties from the document to the site object
      Object.keys(siteData).forEach(key => {
        if (key in site) {
          // @ts-ignore - We know these properties exist
          site[key] = siteData[key];
        }
      });
      
      // Update the global site reference
      currentSite.value = { ...site };
      
      // Route based on site properties
      if (site.reservationsAllowed || site.onlyWaterOption) {
        router.push({ name: 'Choice' });
      } else {
        router.push({ name: 'Welcome' });
      }
    } else {
      siteError.value = `Site with siteID ${siteParam} not found`;
    }
  } catch (error) {
    console.error('Error fetching site data:', error);
    siteError.value = 'Error loading site data';
  } finally {
    siteLoading.value = false;
  }
};

onMounted(() => {
  fetchSiteData();
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <!-- Loading Spinner -->
      <div v-if="siteLoading" class="flex flex-col items-center justify-center min-h-[70vh]">
        <LoadingSpinner size="lg" color="green" />
        <p class="mt-4 text-gray-600 dark:text-gray-400">Loading site data...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="siteError" class="max-w-md mx-auto mt-8">
        <div class="p-4 bg-red-100 text-red-700 rounded-md">
          <p>{{ siteError }}</p>
          <p class="text-sm mt-2">
            Please add the site parameter to the URL (e.g., ?site=your-site-id)
          </p>
        </div>
      </div>
    </div>
  </div>
</template>