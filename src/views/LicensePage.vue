<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { currentSite, bookingDetails } from '../store';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';

const { t } = useI18n();
const router = useRouter();
const licensePlate = ref('');
const isChecking = ref(false);
const checkError = ref('');

// Load the license plate from bookingDetails on component mount
onMounted(() => {
  if (bookingDetails.value.licensePlate) {
    licensePlate.value = bookingDetails.value.licensePlate;
  }
});

// Watch for changes in bookingDetails.licensePlate
watch(() => bookingDetails.value.licensePlate, (newValue) => {
  if (newValue) {
    licensePlate.value = newValue;
  }
});

// Watch for changes in licensePlate and update bookingDetails
watch(licensePlate, (newValue) => {
  bookingDetails.value.licensePlate = newValue;
});

// Computed property to check if the form is valid
const isFormValid = computed(() => {
  return licensePlate.value.trim() !== '';
});

// Check if the number of nights is allowed
const checkNightsAllowed = async () => {
  if (!currentSite.value || !licensePlate.value) return false;
  
  isChecking.value = true;
  checkError.value = '';
  
  try {
    const url = new URL('https://checks-checknrofdaysinperiodokay-2ox4dfqmkq-uc.a.run.app');
    url.searchParams.append('siteID', currentSite.value.siteID);
    url.searchParams.append('licensePlate', licensePlate.value);
    url.searchParams.append('requestedDays', bookingDetails.value.nrOfNights.toString());
    
    const response = await fetch(url.toString());
    const data = await response.json();
    
    return data.response === true;
  } catch (error) {
    console.error('Error checking nights allowed:', error);
    checkError.value = 'Failed to verify stay duration. Please try again.';
    return false;
  } finally {
    isChecking.value = false;
  }
};

// Navigation functions
const goBack = () => {
  // Update bookingDetails before navigating back
  bookingDetails.value.licensePlate = licensePlate.value;
  router.back();
};

const goNext = async () => {
  if (!isFormValid.value) return;
  
  // Store the license plate in the booking details
  bookingDetails.value.licensePlate = licensePlate.value;
  
  // Only perform the check if maxPeriod is true
  if (currentSite.value?.maxPeriod) {
    const isAllowed = await checkNightsAllowed();
    if (!isAllowed) {
      // Navigate to the error page if check fails
      router.push({ name: 'ErrorMaxNights' });
      return;
    }
  }
  
  // Navigate to the AboutYouPage
  router.push({ name: 'AboutYou' });
};
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- Header with back button and language switcher -->
    <div class="flex justify-between items-center p-4">
      <button @click="goBack" class="text-gray-800" aria-label="Go back">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
      <LanguageSwitcher />
    </div>

    <!-- Main content - Using a fixed layout with scrollable content -->
    <div class="flex-grow overflow-y-auto px-5 py-4 pb-20">
      <div v-if="currentSite" class="space-y-6">
        <!-- License plate heading -->
        <div class="space-y-2">
          <span class="text-3xl" aria-label="Bus">🚌</span>
          <h1 class="text-2xl font-bold text-gray-900">{{ t('license.title') }}</h1>
        </div>

        <!-- License plate input -->
        <div class="space-y-2">
          <label for="license-plate" class="block text-sm font-medium text-gray-700">
            {{ t('license.enterPlate') }}
          </label>
          <input
            type="text"
            id="license-plate"
            v-model="licensePlate"
            placeholder="e.g., ABC-123"
            class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
          />
          <p class="text-sm text-gray-500">
            {{ t('license.plateHelp') }}
          </p>
          
          <!-- Error message -->
          <p v-if="checkError" class="text-sm text-red-500 mt-2">
            {{ checkError }}
          </p>
        </div>
      </div>

      <div v-else class="flex justify-center items-center h-full">
        <p class="text-red-500">No site data available</p>
      </div>
    </div>

    <!-- Footer with button - fixed at bottom -->
    <div class="p-4 fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
      <button 
        @click="goNext"
        class="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center"
        :disabled="!isFormValid || isChecking"
        :class="{ 'opacity-50 cursor-not-allowed': !isFormValid || isChecking }"
      >
        <span v-if="isChecking" class="mr-2">
          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
        {{ t('license.next') }}
      </button>
    </div>
  </div>
</template>