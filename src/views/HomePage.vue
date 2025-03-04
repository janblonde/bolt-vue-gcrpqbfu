<script setup lang="ts">
import { ref, onMounted, reactive, watch } from 'vue';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { db } from '../firebase';
import { currentSite, areaRules } from '../store';
import type { Site, AreaRule } from '../types';
import LoadingSpinner from '../components/LoadingSpinner.vue';

const router = useRouter();
const { locale } = useI18n();
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

// Fetch area rules from Firestore
const fetchAreaRules = async (siteID: string, language: string) => {
  try {
    // Query the areaRules collection where siteID equals the site ID and language matches the current locale
    const rulesQuery = query(
      collection(db, 'areaRules'),
      where('siteID', '==', siteID),
      where('language', '==', language),
      limit(1)
    );
    
    const querySnapshot = await getDocs(rulesQuery);
    
    if (!querySnapshot.empty) {
      const ruleDoc = querySnapshot.docs[0];
      const ruleData = ruleDoc.data() as AreaRule;
      
      // Update the global areaRules reference
      areaRules.value = {
        id: ruleDoc.id,
        ...ruleData
      };
      
      console.log('Area rules loaded:', areaRules.value);
    } else {
      console.log(`No area rules found for site ${siteID} with language ${language}`);
      
      // If no rules found for the specific language, try to fetch English rules as fallback
      if (language !== 'en') {
        console.log('Trying to fetch English rules as fallback');
        await fetchAreaRules(siteID, 'en');
      } else {
        areaRules.value = null;
      }
    }
  } catch (error) {
    console.error('Error fetching area rules:', error);
    areaRules.value = null;
  }
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
      
      // Fetch area rules for the site with the current language
      await fetchAreaRules(site.siteID, locale.value);
      
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
      
      <!-- Content (only shown when not loading) -->
      <div v-else>
        <div class="flex justify-center mb-8">
          <a href="https://vitejs.dev" target="_blank" class="mr-4">
            <img src="/vite.svg" class="h-16" alt="Vite logo" />
          </a>
          <a href="https://vuejs.org/" target="_blank">
            <img src="../assets/vue.svg" class="h-16" alt="Vue logo" />
          </a>
        </div>
        
        <h1 class="text-4xl font-bold text-center text-gray-900 dark:text-white mb-6">Campsite App</h1>
        
        <!-- Site Information Section -->
        <div class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-8">
          <h2 class="text-xl font-bold mb-4 text-gray-800 dark:text-white">Site Information</h2>
          
          <div v-if="siteError" class="p-4 bg-red-100 text-red-700 rounded-md mb-4">
            <p>{{ siteError }}</p>
            <p class="text-sm mt-2">
              Please add the site parameter to the URL (e.g., ?site=your-site-id)
            </p>
          </div>
          
          <div v-else-if="site.id" class="space-y-4">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-white">{{ site.name }}</h3>
            
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="text-gray-600 dark:text-gray-400">Site ID:</div>
              <div class="text-gray-800 dark:text-gray-200">{{ site.siteID }}</div>
              
              <div class="text-gray-600 dark:text-gray-400">Status:</div>
              <div class="text-gray-800 dark:text-gray-200">{{ site.status }}</div>
              
              <div class="text-gray-600 dark:text-gray-400">Price per night:</div>
              <div class="text-gray-800 dark:text-gray-200">€{{ site.pricePerNight }}</div>
              
              <div class="text-gray-600 dark:text-gray-400">Available places:</div>
              <div class="text-gray-800 dark:text-gray-200">{{ site.availablePlaces }}</div>
              
              <div class="text-gray-600 dark:text-gray-400">Checkout time:</div>
              <div class="text-gray-800 dark:text-gray-200">{{ site.checkoutTime }}:00</div>
              
              <div class="text-gray-600 dark:text-gray-400">Email:</div>
              <div class="text-gray-800 dark:text-gray-200">{{ site.email }}</div>
              
              <div class="text-gray-600 dark:text-gray-400">Max nights:</div>
              <div class="text-gray-800 dark:text-gray-200">{{ site.maxNrOfNights }}</div>
              
              <div class="text-gray-600 dark:text-gray-400">Tourism tax:</div>
              <div class="text-gray-800 dark:text-gray-200">
                {{ site.tourismTax ? `€${site.tourismTaxPerVisitor} per ${site.tourismTaxOnlyAdults ? 'adult' : 'visitor'}` : 'No' }}
              </div>
            </div>
            
            <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
              <h4 class="font-medium text-gray-700 dark:text-gray-300 mb-2">Options</h4>
              <ul class="space-y-1">
                <li v-if="site.electricityOption" class="flex items-center">
                  <span class="text-green-500 mr-2">✓</span>
                  <span class="text-gray-700 dark:text-gray-300">Electricity (€{{ site.priceForElectricity }})</span>
                </li>
                <li v-if="site.onlyWaterOption" class="flex items-center">
                  <span class="text-green-500 mr-2">✓</span>
                  <span class="text-gray-700 dark:text-gray-300">Water (€{{ site.priceForWater }})</span>
                </li>
                <li v-if="site.automaticGate" class="flex items-center">
                  <span class="text-green-500 mr-2">✓</span>
                  <span class="text-gray-700 dark:text-gray-300">Automatic gate</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>