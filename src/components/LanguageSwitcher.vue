<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ukFlag from '../assets/uk.svg';
import deFlag from '../assets/de.svg';
import frFlag from '../assets/fr.svg';
import esFlag from '../assets/es.svg';
import nlFlag from '../assets/nl.svg';

const { locale } = useI18n();
const showDropdown = ref(false);

const languages = [
  { code: 'en', name: 'English', flag: ukFlag },
  { code: 'de', name: 'Deutsch', flag: deFlag },
  { code: 'fr', name: 'Français', flag: frFlag },
  { code: 'es', name: 'Español', flag: esFlag },
  { code: 'nl', name: 'Nederlands', flag: nlFlag }
];

const currentLanguage = computed(() => {
  return languages.find(lang => lang.code === locale.value) || languages[0];
});

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const changeLanguage = (langCode: string) => {
  locale.value = langCode;
  showDropdown.value = false;
};
</script>

<template>
  <div class="relative">
    <button 
      @click="toggleDropdown" 
      class="flex items-center focus:outline-none"
      aria-label="Change language"
    >
      <img 
        :src="currentLanguage.flag" 
        :alt="currentLanguage.name" 
        class="w-8 h-8 rounded-full border-2 border-gray-200 object-cover"
      />
    </button>
    
    <div 
      v-if="showDropdown" 
      class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10"
    >
      <div class="py-1">
        <button
          v-for="lang in languages"
          :key="lang.code"
          @click="changeLanguage(lang.code)"
          class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          :class="{ 'bg-gray-100': lang.code === locale }"
        >
          <img 
            :src="lang.flag" 
            :alt="lang.name" 
            class="w-5 h-5 rounded-full border border-gray-200 object-cover mr-3" 
          />
          {{ lang.name }}
        </button>
      </div>
    </div>
  </div>
</template>