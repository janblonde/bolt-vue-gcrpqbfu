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
        <!-- Success icon -->
        <div class="flex justify-center">
          <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <!-- Success message -->
        <h1 class="text-2xl font-bold text-gray-900">{{ t('registration.success') }}</h1>
        
        <p class="text-gray-700">
          {{ t('registration.thankYou') }}
        </p>
        
        <!-- Registration details -->
        <div class="bg-gray-50 p-4 rounded-lg text-left">
          <h2 class="font-medium text-gray-800 mb-2">{{ t('registration.details') }}</h2>
          
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">{{ t('registration.site') }}:</span>
              <span class="font-medium">{{ currentSite.name }}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-600">{{ t('registration.licensePlate') }}:</span>
              <span class="font-medium">{{ bookingDetails.licensePlate }}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-600">{{ t('registration.nights') }}:</span>
              <span class="font-medium">{{ bookingDetails.nrOfNights }}</span>
            </div>
            
            <div v-if="bookingDetails.useElectricity" class="flex justify-between">
              <span class="text-gray-600">{{ t('registration.electricity') }}:</span>
              <span class="font-medium">{{ t('registration.yes') }}</span>
            </div>
          </div>
        </div>
        
        <p class="text-gray-700">
          {{ t('registration.emailSent') }}
        </p>
      </div>

      <div v-else class="flex justify-center items-center h-full">
        <p class="text-red-500">No site data available</p>
      </div>
    </div>

    <!-- Footer with button -->
    <div class="p-4 mt-auto">
      <button 
        @click="goToHome"
        class="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-md transition-colors"
      >
        {{ t('registration.done') }}
      </button>
    </div>
  </div>
</template>