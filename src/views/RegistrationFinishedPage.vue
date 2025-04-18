<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { currentSite } from '../store';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';

const { t } = useI18n();
const router = useRouter();
const registrationId = ref('');

// Function to go back to home
// const goToHome = () => {
//   router.push({ name: 'Home' });
// };

// Function to register visitors
const registerVisitors = () => {
  if (registrationId.value) {
    // Open the visitor registration page in a new tab
    window.open(`https://camprea-dev-app.web.app/addVisitorPage?id=${registrationId.value}`, '_blank');
  } else {
    console.error('No registration ID available');
    // Fallback to home if no registration ID is available
    router.push({ name: 'Home' });
  }
};

// Function to discover the camper area
const discoverCamperArea = () => {
  if (currentSite.value && currentSite.value.siteID) {
    // Navigate to the AreaHomePage with the current site ID as a URL parameter
    router.push({
      name: 'AreaHome',
      query: { site: currentSite.value.siteID }
    });
  } else {
    console.error('No site ID available');
    // Fallback to home if no site ID is available
    router.push({ name: 'Home' });
  }
};

// Get registration ID from URL parameters when the component is mounted
const urlParams = new URLSearchParams(window.location.search);
registrationId.value = urlParams.get('registrationId') || '';
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- Header with language switcher -->
    <div class="flex justify-end items-center p-4">
      <LanguageSwitcher />
    </div>

    <!-- Main content - Using a fixed layout with scrollable content -->
    <div class="flex-grow overflow-y-auto px-5 py-4 pb-20">
      <div v-if="currentSite" class="text-center space-y-6 max-w-md mx-auto">
        <!-- Vehicle emoji will be supplied by the user -->
        <div class="flex justify-center">
          <span class="text-6xl">🚐</span>
        </div>
        
        <!-- Success message -->
        <div class="space-y-1">
          <h1 class="text-2xl font-bold text-gray-900">{{ t('registration.vehicleRegistrationSuccess') }}</h1>
          <p class="text-gray-700">{{ t('registration.enjoyStay') }}</p>
        </div>
        
        <p class="text-gray-700">
          {{ t('registration.emailSent') }}
        </p>
      </div>

      <div v-else class="flex justify-center items-center h-full">
        <p class="text-red-500">No site data available</p>
      </div>
    </div>

    <!-- Footer with button - fixed at bottom -->
    <div class="p-4 fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
      <button 
        v-if="currentSite && currentSite.visitorRegistrationRequired"
        @click="registerVisitors"
        class="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-md transition-colors"
      >
        Register your visitors
      </button>
      
      <button 
        v-else
        @click="discoverCamperArea"
        class="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-md transition-colors"
      >
        Discover the camper area
      </button>
    </div>
  </div>
</template>