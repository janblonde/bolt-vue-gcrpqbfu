<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { db } from '../firebase';
import { currentSite, clearSiteData } from '../store';
import type { Site } from '../types';
import LoadingSpinner from '../components/LoadingSpinner.vue';

const router = useRouter();
const siteLoading = ref(false);
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
    clearSiteData();
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
      const siteData = siteDoc.data() as Omit<Site, 'id'>;
      
      // Update the global site reference with properly typed data
      currentSite.value = {
        id: siteDoc.id,
        siteID: siteData.siteID,
        name: siteData.name,
        description: siteData.description,
        maxPeriod: siteData.maxPeriod,
        addressRegistrationRequired: siteData.addressRegistrationRequired,
        algoVersion: siteData.algoVersion,
        applyMaxNrOfNights: siteData.applyMaxNrOfNights,
        automaticGate: siteData.automaticGate,
        automaticGatePIN: siteData.automaticGatePIN,
        automaticGatePhoneNumber: siteData.automaticGatePhoneNumber,
        availablePlaces: siteData.availablePlaces,
        checkAvailablePlaces: siteData.checkAvailablePlaces,
        checkoutTime: siteData.checkoutTime,
        creationDate: siteData.creationDate,
        electricityOption: siteData.electricityOption,
        email: siteData.email,
        emailCopy: siteData.emailCopy,
        freeVisitors: siteData.freeVisitors,
        hasCheckoutTime: siteData.hasCheckoutTime,
        location: siteData.location,
        lowSeasonEnd: siteData.lowSeasonEnd,
        lowSeasonPrice: siteData.lowSeasonPrice,
        lowSeasonStart: siteData.lowSeasonStart,
        maxNrOfNights: siteData.maxNrOfNights,
        maxPeriodPeriod: siteData.maxPeriodPeriod,
        minDaysReservationCancellationRefund: siteData.minDaysReservationCancellationRefund,
        onlyWaterOption: siteData.onlyWaterOption,
        passportNumberRegistrationRequired: siteData.passportNumberRegistrationRequired,
        payingSite: siteData.payingSite,
        priceForElectricity: siteData.priceForElectricity,
        priceForWater: siteData.priceForWater,
        pricePerNight: siteData.pricePerNight,
        pricePerVisitor: siteData.pricePerVisitor,
        reservationsAllowed: siteData.reservationsAllowed,
        reservationsCancellationAllowed: siteData.reservationsCancellationAllowed,
        seasonalPricing: siteData.seasonalPricing,
        splitAccount: siteData.splitAccount,
        splitAmount: siteData.splitAmount,
        status: siteData.status,
        tourismTax: siteData.tourismTax,
        tourismTaxOnlyAdults: siteData.tourismTaxOnlyAdults,
        tourismTaxPerVisitor: siteData.tourismTaxPerVisitor,
        visitorRegistrationRequired: siteData.visitorRegistrationRequired,
        waterDevice: siteData.waterDevice,
        wifiCodes: siteData.wifiCodes
      };
      
      // Route based on site properties
      if (siteData.reservationsAllowed || siteData.onlyWaterOption) {
        router.push({ name: 'Choice' });
      } else {
        router.push({ name: 'Welcome' });
      }
    } else {
      siteError.value = `Site with siteID ${siteParam} not found`;
      clearSiteData();
    }
  } catch (error) {
    console.error('Error fetching site data:', error);
    siteError.value = 'Error loading site data';
    clearSiteData();
  } finally {
    siteLoading.value = false;
  }
};

onMounted(() => {
  // Clear any existing site data when the home page loads
  clearSiteData();
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