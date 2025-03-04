<script setup lang="ts">
import { currentSite } from '../store';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';

const { t } = useI18n();
const router = useRouter();

// Navigation functions
const goToWelcomePage = () => {
  console.log('Navigating to Welcome page');
  router.push('/welcome');
};

const goToNightsPage = () => {
  router.push({ name: 'Nights' });
};

const goToReservation = () => {
  // This would navigate to a reservation page in the future
  // For now, just log that it was clicked
  console.log('Reservation button clicked');
};
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- Header with icons -->
    <div class="flex justify-between items-center p-4">
      <div>
        <span class="text-3xl" aria-label="Waving hand">👋</span>
      </div>
      <div>
        <LanguageSwitcher />
      </div>
    </div>

    <!-- Main content -->
    <div class="flex-grow px-5 py-4">
      <div v-if="currentSite" class="space-y-6">
        <!-- Welcome heading -->
        <div>
          <h2 class="text-xl font-medium text-gray-700">{{ t('welcome.greeting') }}</h2>
          <h1 class="text-3xl font-bold text-gray-900">{{ currentSite.name }}</h1>
        </div>

        <!-- Buttons section -->
        <div class="space-y-4 mt-8">
          <!-- Spend the night button -->
          <button 
            @click="goToWelcomePage"
            class="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center"
          >
            <span class="mr-2">🛏️</span>
            <span>{{ t('choice.spendNight', { price: currentSite.pricePerNight }) }}</span>
          </button>
          
          <!-- Water only button -->
          <button 
            v-if="currentSite.onlyWaterOption"
            @click="goToNightsPage"
            class="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center"
          >
            <span class="mr-2">💧</span>
            <span>{{ t('choice.onlyWater', { price: currentSite.priceForWater }) }}</span>
          </button>
          
          <!-- Reservation button -->
          <button 
            v-if="currentSite.reservationsAllowed"
            @click="goToReservation"
            class="w-full border border-green-500 text-green-500 hover:bg-green-50 font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center"
          >
            <span class="mr-2">📅</span>
            <span>{{ t('choice.haveReservation') }}</span>
          </button>
        </div>
      </div>

      <div v-else class="flex justify-center items-center h-full">
        <p class="text-red-500">No site data available</p>
      </div>
    </div>
  </div>
</template>