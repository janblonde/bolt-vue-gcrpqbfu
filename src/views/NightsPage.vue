<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { currentSite, bookingDetails } from '../store';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import CountController from '../components/CountController.vue';
import ToggleSwitch from '../components/ToggleSwitch.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';

const { t } = useI18n();
const router = useRouter();

// State for the form
const nights = ref(bookingDetails.value.nrOfNights);
const people = ref(bookingDetails.value.nrOfVisitors);
const useElectricity = ref(bookingDetails.value.useElectricity);
const isLoadingAvailability = ref(false);
const availabilityMaxNights = ref<number | null>(null);

// Watch for changes in bookingDetails and update local state
onMounted(() => {
  // Ensure form values match bookingDetails on mount
  nights.value = bookingDetails.value.nrOfNights;
  people.value = bookingDetails.value.nrOfVisitors;
  useElectricity.value = bookingDetails.value.useElectricity;
});

// Computed properties for max nights
const siteMaxNights = computed(() => {
  return currentSite.value?.maxNrOfNights || 7;
});

// Check if max nights should be applied
const shouldApplyMaxNights = computed(() => {
  return currentSite.value?.applyMaxNrOfNights || false;
});

// Determine the effective maximum nights (minimum of site max and availability max)
const effectiveMaxNights = computed(() => {
  if (!shouldApplyMaxNights.value) return undefined;
  
  if (availabilityMaxNights.value !== null) {
    return Math.min(siteMaxNights.value, availabilityMaxNights.value);
  }
  
  return siteMaxNights.value;
});

// Check if reservations are allowed
const reservationsAllowed = computed(() => {
  return currentSite.value?.reservationsAllowed || false;
});

// Check if people selection should be visible
const shouldShowPeopleSelection = computed(() => {
  if (!currentSite.value) return false;
  return currentSite.value.pricePerVisitor > 0 || currentSite.value.tourismTax;
});

// Check if age restriction text should be shown
const shouldShowAgeRestriction = computed(() => {
  return currentSite.value?.tourismTaxOnlyAdults || false;
});

// Check if electricity option should be shown
const shouldShowElectricityOption = computed(() => {
  return currentSite.value?.electricityOption || false;
});

// Fetch availability data from API
const fetchAvailabilityData = async () => {
  if (!reservationsAllowed.value || !currentSite.value) return;
  
  isLoadingAvailability.value = true;
  try {
    // Add the siteID query parameter to the API call
    const siteID = currentSite.value.siteID;
    const response = await fetch(`https://checks-checkfutureavailability-2ox4dfqmkq-uc.a.run.app?siteID=${siteID}`);
    const data = await response.json();
    console.log(data);
    
    if (data && data.response) {
      availabilityMaxNights.value = data.response;
      console.log('Availability max nights:', availabilityMaxNights.value);
      
      // If current nights value exceeds the new max, adjust it
      if (shouldApplyMaxNights.value && nights.value > effectiveMaxNights.value) {
        nights.value = effectiveMaxNights.value;
      }
    }
  } catch (error) {
    console.error('Error fetching availability data:', error);
  } finally {
    isLoadingAvailability.value = false;
  }
};

// Navigation functions
const goBack = () => {
  // Update bookingDetails before navigating back
  updateBookingDetails();
  router.back();
};

const goNext = () => {
  // Store the form values in the global state
  updateBookingDetails();
  
  // Navigate to the LicensePage
  router.push({ name: 'License' });
};

// Update booking details with current form values
const updateBookingDetails = () => {
  bookingDetails.value = {
    ...bookingDetails.value,
    nrOfNights: nights.value,
    nrOfVisitors: people.value,
    useElectricity: useElectricity.value
  };
};

// Watch for changes in form values and update bookingDetails
watch([nights, people, useElectricity], () => {
  updateBookingDetails();
});

// Fetch availability data on component mount
onMounted(() => {
  fetchAvailabilityData();
});
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

    <!-- Main content -->
    <div class="flex-grow px-5 py-4">
      <div v-if="currentSite" class="space-y-8">
        <!-- Bed emoji and title -->
        <div class="space-y-2">
          <span class="text-3xl" aria-label="Bed">🛏️</span>
          <h1 class="text-2xl font-bold text-gray-900">{{ t('nights.title') }}</h1>
        </div>

        <!-- Nights selection -->
        <div class="space-y-1">
          <p class="text-gray-700">{{ t('nights.planToStay') }}</p>
          <div class="flex items-center">
            <CountController 
              v-model="nights" 
              :min="1" 
              :max="shouldApplyMaxNights ? effectiveMaxNights : undefined" 
              :label="t('nights.nights')" 
            />
            <LoadingSpinner v-if="isLoadingAvailability" size="sm" class="ml-2" />
          </div>
          <!-- Only show max nights warning if applyMaxNrOfNights is true -->
          <p v-if="shouldApplyMaxNights" class="text-sm text-gray-600 italic">
            {{ t('nights.maxStay', { nights: effectiveMaxNights }) }}
          </p>
        </div>

        <!-- People selection - only show when pricePerVisitor > 0 OR tourismTax is true -->
        <div v-if="shouldShowPeopleSelection" class="space-y-1">
          <p class="text-gray-700">{{ t('nights.with') }}</p>
          <div class="flex items-center">
            <CountController 
              v-model="people" 
              :min="1" 
              :max="10" 
              :label="t('nights.people')" 
            />
          </div>
          <!-- Only show age restriction text when tourismTaxOnlyAdults is true -->
          <p v-if="shouldShowAgeRestriction" class="text-sm text-gray-600 italic">
            {{ t('nights.peopleAgeRestriction') }}
          </p>
        </div>

        <!-- Electricity toggle - only show when electricityOption is true -->
        <div v-if="shouldShowElectricityOption" class="pt-4">
          <ToggleSwitch 
            v-model="useElectricity" 
            :label="t('nights.useElectricity', { price: currentSite.priceForElectricity })" 
          />
        </div>
      </div>

      <div v-else class="flex justify-center items-center h-full">
        <p class="text-red-500">No site data available</p>
      </div>
    </div>

    <!-- Footer with button -->
    <div class="p-4 mt-auto">
      <button 
        @click="goNext"
        class="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-md transition-colors"
      >
        {{ t('nights.next') }}
      </button>
    </div>
  </div>
</template>