<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const showDropdown = ref(false);
const searchQuery = ref('');
const dropdownRef = ref<HTMLDivElement | null>(null);

// List of countries with their codes and flags
const countries = [
  { code: '+1', name: 'United States', flag: '🇺🇸' },
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+34', name: 'Spain', flag: '🇪🇸' },
  { code: '+31', name: 'Netherlands', flag: '🇳🇱' },
  { code: '+32', name: 'Belgium', flag: '🇧🇪' },
  { code: '+39', name: 'Italy', flag: '🇮🇹' },
  { code: '+41', name: 'Switzerland', flag: '🇨🇭' },
  { code: '+43', name: 'Austria', flag: '🇦🇹' },
  { code: '+45', name: 'Denmark', flag: '🇩🇰' },
  { code: '+46', name: 'Sweden', flag: '🇸🇪' },
  { code: '+47', name: 'Norway', flag: '🇳🇴' },
  { code: '+351', name: 'Portugal', flag: '🇵🇹' },
  { code: '+353', name: 'Ireland', flag: '🇮🇪' },
  { code: '+358', name: 'Finland', flag: '🇫🇮' },
  { code: '+420', name: 'Czech Republic', flag: '🇨🇿' },
  { code: '+48', name: 'Poland', flag: '🇵🇱' },
  { code: '+36', name: 'Hungary', flag: '🇭🇺' },
  { code: '+30', name: 'Greece', flag: '🇬🇷' }
];

// Get the selected country based on the model value
const selectedCountry = computed(() => {
  return countries.find(country => country.code === props.modelValue) || countries[0];
});

// Filter countries based on search query
const filteredCountries = computed(() => {
  if (!searchQuery.value) return countries;
  
  const query = searchQuery.value.toLowerCase();
  return countries.filter(country => 
    country.name.toLowerCase().includes(query) || 
    country.code.includes(query)
  );
});

// Toggle dropdown visibility
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
  if (showDropdown.value) {
    searchQuery.value = '';
    // Focus the search input when dropdown opens
    setTimeout(() => {
      const searchInput = document.getElementById('country-search');
      if (searchInput) searchInput.focus();
    }, 100);
  }
};

// Select a country and close dropdown
const selectCountry = (countryCode: string) => {
  emit('update:modelValue', countryCode);
  showDropdown.value = false;
};

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showDropdown.value = false;
  }
};

// Setup and cleanup event listeners
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div class="relative" ref="dropdownRef">
    <!-- Selected country button -->
    <button 
      type="button"
      @click="toggleDropdown"
      class="flex items-center justify-between w-full px-3 py-2.5 border border-gray-300 rounded-md bg-white text-gray-900 text-left focus:outline-none focus:ring-2 focus:ring-green-500"
    >
      <div class="flex items-center">
        <span class="text-xl mr-2">{{ selectedCountry.flag }}</span>
        <span class="font-medium">{{ selectedCountry.code }}</span>
      </div>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        class="h-5 w-5 text-gray-400" 
        viewBox="0 0 20 20" 
        fill="currentColor"
        :class="{ 'transform rotate-180': showDropdown }"
      >
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
      </svg>
    </button>
    
    <!-- Dropdown menu - positioned differently on mobile vs desktop -->
    <div 
      v-if="showDropdown" 
      class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center md:bg-transparent md:block md:inset-auto md:absolute md:z-10 md:mt-1"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-sm mx-4 md:w-auto md:min-w-full md:max-h-60 md:overflow-y-auto">
        <!-- Mobile header with close button -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200 md:hidden">
          <h3 class="text-lg font-medium text-gray-900">Select Country Code</h3>
          <button 
            @click="showDropdown = false"
            class="text-gray-400 hover:text-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Search input -->
        <div class="sticky top-0 bg-white p-2 border-b border-gray-200">
          <input
            id="country-search"
            type="text"
            v-model="searchQuery"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
            placeholder="Search country..."
          />
        </div>
        
        <!-- Country list -->
        <div class="py-1 max-h-60 overflow-y-auto md:max-h-none">
          <button
            v-for="country in filteredCountries"
            :key="country.code"
            @click="selectCountry(country.code)"
            class="flex items-center w-full px-3 py-3 md:py-2 text-sm text-gray-700 hover:bg-gray-100"
            :class="{ 'bg-gray-100': country.code === modelValue }"
          >
            <span class="text-xl mr-2">{{ country.flag }}</span>
            <span class="font-medium mr-2">{{ country.code }}</span>
            <span class="text-gray-600">{{ country.name }}</span>
          </button>
        </div>
        
        <!-- Empty state -->
        <div v-if="filteredCountries.length === 0" class="px-3 py-2 text-sm text-gray-500 text-center">
          No countries found
        </div>
      </div>
    </div>
  </div>
</template>