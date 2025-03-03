<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { currentSite } from '../store';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import CountController from '../components/CountController.vue';
import ToggleSwitch from '../components/ToggleSwitch.vue';

const { t } = useI18n();
const router = useRouter();

// State for the form
const nights = ref(1);
const people = ref(4);
const useElectricity = ref(false);

// Computed properties
const maxNights = computed(() => {
  return currentSite.value?.maxNrOfNights || 7;
});

// Navigation functions
const goBack = () => {
  router.back();
};

const goNext = () => {
  // For now, just go back to welcome page
  // In a real app, this would navigate to the next step
  router.push({ name: 'Welcome' });
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
              :max="maxNights" 
              :label="t('nights.nights')" 
            />
          </div>
          <p class="text-sm text-gray-600 italic">
            {{ t('nights.maxStay', { nights: maxNights }) }}
          </p>
        </div>

        <!-- People selection -->
        <div class="space-y-1">
          <p class="text-gray-700">{{ t('nights.with') }}</p>
          <div class="flex items-center">
            <CountController 
              v-model="people" 
              :min="1" 
              :max="10" 
              :label="t('nights.people')" 
            />
          </div>
          <p class="text-sm text-gray-600 italic">
            {{ t('nights.peopleAgeRestriction') }}
          </p>
        </div>

        <!-- Electricity toggle -->
        <div v-if="currentSite.electricityOption" class="pt-4">
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