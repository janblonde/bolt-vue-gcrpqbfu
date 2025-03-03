<script setup lang="ts">
import { currentSite, areaRules } from '../store';
import { useI18n } from 'vue-i18n';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';

const { t } = useI18n();
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-4">
        <span class="text-3xl" aria-label="Waving hand">👋</span>
        <LanguageSwitcher />
      </div>
      
      <div class="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mt-8">
        <h1 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Choice Page</h1>
        
        <div v-if="currentSite" class="space-y-4">
          <p class="text-gray-700 dark:text-gray-300">
            {{ t('welcome.greeting') }} {{ currentSite.name }}!
          </p>
          
          <div class="bg-blue-50 dark:bg-blue-900 p-4 rounded-md">
            <p class="text-blue-800 dark:text-blue-200">
              This is a placeholder for the Choice Page.
            </p>
            <p class="text-blue-700 dark:text-blue-300 mt-2">
              You are seeing this page because:
            </p>
            <ul class="list-disc ml-5 mt-2 text-blue-700 dark:text-blue-300">
              <li v-if="currentSite.reservationsAllowed">Reservations are allowed</li>
              <li v-if="currentSite.onlyWaterOption">Water option is available</li>
            </ul>
          </div>
          
          <div class="mt-6">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-2">Site Details</h2>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="text-gray-600 dark:text-gray-400">Site ID:</div>
              <div class="text-gray-800 dark:text-gray-200">{{ currentSite.siteID }}</div>
              
              <div class="text-gray-600 dark:text-gray-400">Price per night:</div>
              <div class="text-gray-800 dark:text-gray-200">€{{ currentSite.pricePerNight }}</div>
            </div>
          </div>
        </div>
        
        <div v-else class="text-center py-4">
          <p class="text-red-500">No site data available</p>
        </div>
      </div>
    </div>
  </div>
</template>