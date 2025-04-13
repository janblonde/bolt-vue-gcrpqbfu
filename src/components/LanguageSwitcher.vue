<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const showDropdown = ref(false);

const languages = [
  { code: 'en', name: 'English', flag: '/src/assets/uk.png' },
  { code: 'de', name: 'Deutsch', flag: '/src/assets/de.png' },
  { code: 'fr', name: 'Français', flag: '/src/assets/fr.png' },
  { code: 'es', name: 'Español', flag: '/src/assets/es.png' },
  { code: 'nl', name: 'Nederlands', flag: '/src/assets/nl.png' }
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
      <img :src="currentLanguage.flag" :alt="currentLanguage.name" class="w-8 h-8" />
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
          <img :src="lang.flag" :alt="lang.name" class="w-5 h-5 mr-3" />
          {{ lang.name }}
        </button>
      </div>
    </div>
  </div>
</template>