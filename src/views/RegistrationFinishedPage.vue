<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { currentSite, bookingDetails } from '../store';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';

const { t } = useI18n();
const router = useRouter();

// Function to go back to home
const goToHome = () => {
  router.push({ name: 'Home' });
};

// Function to register visitors
const registerVisitors = () => {
  // This would navigate to a visitor registration page in the future
  console.log('Register visitors button clicked');
  // For now, just go back to home
  router.push({ name: 'Home' });
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
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- Header with language switcher -->
    <div class="flex justify-end items-center p-4">
      <LanguageSwitcher />
    </div>

    <!-- Main content -->
    <div class="flex-grow px-5 py-4 flex flex-col items-center justify-center">
      <div v-if="currentSite" class="text-center space-y-6 max-w-md mx-auto">
        <!-- Vehicle emoji will be supplied by the user -->
        <div class="flex justify-center">
          <span class="text-6xl">🚐</span>
        </div>
        
        <!-- Success message -->
        <div class="space-y-1">
          <h1 class="text-2xl font-bold text-gray-900">Vehicle Registration successful</h1>
          <p class="text-gray-700">Enjoy your stay!</p>
        </div>
        
        <!-- Button - only shown if visitorRegistrationRequired is true -->
        <div class="mt-8 w-full">
          <button 
            v-if="currentSite.visitorRegistrationRequired"
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

      <div v-else class="flex justify-center items-center h-full">
        <p class="text-red-500">No site data available</p>
      </div>
    </div>
  </div>
</template>