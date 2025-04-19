<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { currentSite } from '../store';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';

const { t } = useI18n();
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- Header with language switcher -->
    <div class="flex justify-end p-4">
      <LanguageSwitcher />
    </div>

    <!-- Main content -->
    <div class="flex-grow flex flex-col items-center justify-center px-4">
      <div class="max-w-md w-full space-y-6 text-center">
        <!-- Error icon -->
        <div class="text-5xl">⚠️</div>
        
        <!-- Error title -->
        <h1 class="text-2xl font-bold text-gray-900">
          {{ t('error.maxNights.title') }}
        </h1>
        
        <!-- Error message -->
        <p class="text-gray-600">
          {{ t('error.maxNights.message', {
            maxNights: currentSite?.maxNrOfNights,
            maxPeriod: currentSite?.maxPeriodPeriod
          }) }}
        </p>
      </div>
    </div>
  </div>
</template>