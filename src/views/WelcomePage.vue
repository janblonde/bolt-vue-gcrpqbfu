<script setup lang="ts">
import { currentSite, areaRules } from '../store';
import { useI18n } from 'vue-i18n';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import { computed, watch, onMounted } from 'vue';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useRouter } from 'vue-router';
import type { AreaRule } from '../types';

const { t, locale } = useI18n();
const router = useRouter();

// Split the rules string into an array of rules by newline character
const rulesList = computed(() => {
  if (areaRules.value && areaRules.value.rules) {
    return areaRules.value.rules.split('\n').filter(rule => rule.trim() !== '');
  }
  return [];
});

// Fetch area rules from Firestore
const fetchAreaRules = async () => {
  if (!currentSite.value) return;
  
  try {
    // Query the areaRules collection where siteID equals the site ID and language matches the current locale
    const rulesQuery = query(
      collection(db, 'areaRules'),
      where('siteID', '==', currentSite.value.siteID),
      where('language', '==', locale.value),
      limit(1)
    );
    
    const querySnapshot = await getDocs(rulesQuery);
    
    if (!querySnapshot.empty) {
      const ruleDoc = querySnapshot.docs[0];
      const ruleData = ruleDoc.data() as AreaRule;
      
      // Update the global areaRules reference
      areaRules.value = {
        id: ruleDoc.id,
        ...ruleData
      };
      
      console.log('Area rules loaded:', areaRules.value);
    } else {
      console.log(`No area rules found for site ${currentSite.value.siteID} with language ${locale.value}`);
      
      // If no rules found for the specific language, try to fetch English rules as fallback
      if (locale.value !== 'en') {
        console.log('Trying to fetch English rules as fallback');
        
        const fallbackQuery = query(
          collection(db, 'areaRules'),
          where('siteID', '==', currentSite.value.siteID),
          where('language', '==', 'en'),
          limit(1)
        );
        
        const fallbackSnapshot = await getDocs(fallbackQuery);
        
        if (!fallbackSnapshot.empty) {
          const fallbackDoc = fallbackSnapshot.docs[0];
          const fallbackData = fallbackDoc.data() as AreaRule;
          
          areaRules.value = {
            id: fallbackDoc.id,
            ...fallbackData
          };
          
          console.log('Fallback English rules loaded:', areaRules.value);
        } else {
          console.log('No fallback English rules found');
          areaRules.value = null;
        }
      } else {
        areaRules.value = null;
      }
    }
  } catch (error) {
    console.error('Error fetching area rules:', error);
    areaRules.value = null;
  }
};

// Navigate to NightsPage when button is clicked
const navigateToNightsPage = () => {
  router.push({ name: 'Nights' });
};

// Watch for language changes to update area rules
watch(locale, () => {
  fetchAreaRules();
});

// Fetch area rules when component is mounted
onMounted(() => {
  if (currentSite.value) {
    fetchAreaRules();
  }
});
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

    <!-- Main content - Using a fixed layout with scrollable content -->
    <div class="flex-grow overflow-y-auto px-5 py-4 pb-20">
      <div v-if="currentSite" class="space-y-6">
        <!-- Welcome heading -->
        <div>
          <h2 class="text-xl font-medium text-gray-700">{{ t('welcome.greeting') }}</h2>
          <h1 class="text-3xl font-bold text-gray-900">{{ currentSite.name }}</h1>
        </div>

        <!-- Area rules section -->
        <div>
          <h3 class="text-lg font-medium text-gray-800 mb-2">{{ t('welcome.areaRules') }}</h3>
          
          <!-- Display fetched area rules if available -->
          <ul v-if="rulesList.length > 0" class="space-y-1 text-gray-700">
            <li v-for="(rule, index) in rulesList" :key="index" class="flex items-start">
              <span class="text-green-500 mr-2 mt-1">•</span>
              <span>{{ rule }}</span>
            </li>
          </ul>
          
          <!-- Fallback to default rules if no area rules are available -->
          <ul v-else class="space-y-1 text-gray-700">
            <li class="flex items-start">
              <span class="text-green-500 mr-2 mt-1">•</span>
              <span>{{ t('welcome.rules.registration') }}</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-500 mr-2 mt-1">•</span>
              <span>{{ t('welcome.rules.maxStay', { nights: currentSite.maxNrOfNights, price: currentSite.pricePerNight }) }}</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-500 mr-2 mt-1">•</span>
              <span>{{ t('welcome.rules.noise') }}</span>
            </li>
            <li class="flex items-start">
              <span class="text-green-500 mr-2 mt-1">•</span>
              <span>{{ t('welcome.rules.camping') }}</span>
            </li>
          </ul>
        </div>
      </div>

      <div v-else class="flex justify-center items-center h-full">
        <p class="text-red-500">No site data available</p>
      </div>
    </div>

    <!-- Footer with button - fixed at bottom -->
    <div class="p-4 fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
      <button 
        class="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-md transition-colors"
        @click="navigateToNightsPage"
      >
        {{ currentSite && currentSite.payingSite ? t('welcome.registerPay') : t('welcome.register') }}
      </button>
    </div>
  </div>
</template>