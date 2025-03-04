<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();

// State for site data
const areaName = ref('');
const email = ref('');
const areaInfo = ref('');
const isLoading = ref(true);
const error = ref('');

// Determine if the back button should be shown
// Show back button only if we have a referrer from within our app
const showBackButton = computed(() => {
  // Check if we have a referrer and it's from our app
  return document.referrer && document.referrer.includes(window.location.origin);
});

// Get the 'site' parameter from the URL
const getSiteParam = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('site');
};

// Fetch site data from Firestore
const fetchSiteData = async () => {
  const siteParam = getSiteParam();
  
  if (!siteParam) {
    error.value = 'No site parameter provided in URL';
    isLoading.value = false;
    return;
  }
  
  try {
    // Query the sites collection where siteID equals the URL parameter
    const sitesQuery = query(
      collection(db, 'sites'),
      where('siteID', '==', siteParam),
      limit(1)
    );
    
    const querySnapshot = await getDocs(sitesQuery);
    
    if (!querySnapshot.empty) {
      const siteDoc = querySnapshot.docs[0];
      const siteData = siteDoc.data();
      
      // Update the site data
      areaName.value = siteData.name || '';
      email.value = siteData.email || '';
      
      console.log('Site data loaded:', { areaName: areaName.value, email: email.value });
      
      // Fetch area info after site data is loaded
      await fetchAreaInfo(siteParam);
    } else {
      error.value = `Site with siteID ${siteParam} not found`;
      isLoading.value = false;
    }
  } catch (err) {
    console.error('Error fetching site data:', err);
    error.value = 'Error loading site data';
    isLoading.value = false;
  }
};

// Fetch area info from Firestore
const fetchAreaInfo = async (siteID: string) => {
  try {
    // Query the areaInfo collection where siteID equals the site ID and language matches the current locale
    const infoQuery = query(
      collection(db, 'areaInfo'),
      where('siteID', '==', siteID),
      where('language', '==', locale.value),
      limit(1)
    );
    
    const querySnapshot = await getDocs(infoQuery);
    
    if (!querySnapshot.empty) {
      const infoDoc = querySnapshot.docs[0];
      const infoData = infoDoc.data();
      
      // Update the area info
      areaInfo.value = infoData.info || '';
      
      console.log('Area info loaded for language:', locale.value);
    } else {
      console.log(`No area info found for site ${siteID} with language ${locale.value}`);
      
      // If no info found for the specific language, try to fetch English info as fallback
      if (locale.value !== 'en') {
        console.log('Trying to fetch English info as fallback');
        
        const fallbackQuery = query(
          collection(db, 'areaInfo'),
          where('siteID', '==', siteID),
          where('language', '==', 'en'),
          limit(1)
        );
        
        const fallbackSnapshot = await getDocs(fallbackQuery);
        
        if (!fallbackSnapshot.empty) {
          const fallbackDoc = fallbackSnapshot.docs[0];
          const fallbackData = fallbackDoc.data();
          
          areaInfo.value = fallbackData.info || '';
          
          console.log('Fallback English info loaded');
        } else {
          console.log('No fallback English info found');
          areaInfo.value = '';
        }
      } else {
        areaInfo.value = '';
      }
    }
  } catch (err) {
    console.error('Error fetching area info:', err);
    areaInfo.value = '';
  } finally {
    isLoading.value = false;
  }
};

// Go back function
const goBack = () => {
  router.back();
};

// Send message function
const sendMessage = () => {
  // Navigate to the SendMailPage with the site name and email as query parameters
  router.push({
    name: 'SendMail',
    query: {
      site: getSiteParam(),
      areaName: areaName.value,
      email: email.value
    }
  });
};

// Fetch site data on component mount
onMounted(() => {
  fetchSiteData();
});

// Watch for language changes to update area info
watch(locale, () => {
  if (areaName.value) {
    isLoading.value = true;
    const siteParam = getSiteParam();
    if (siteParam) {
      fetchAreaInfo(siteParam);
    }
  }
});
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- Header with back button and language switcher -->
    <div class="flex justify-between items-center p-4">
      <div>
        <!-- Only show back button if we have a referrer from our app -->
        <button 
          v-if="showBackButton" 
          @click="goBack" 
          class="text-gray-800" 
          aria-label="Go back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <!-- Empty div to maintain layout when back button is hidden -->
        <div v-else class="w-6"></div>
      </div>
      <LanguageSwitcher />
    </div>

    <!-- Main content - Using a fixed layout with header, scrollable content, and footer -->
    <div class="flex flex-col h-[calc(100vh-8rem)]">
      <!-- Title section - fixed at top -->
      <div class="px-5 py-2">
        <!-- Loading state -->
        <div v-if="isLoading" class="flex justify-center items-center h-64">
          <LoadingSpinner size="md" color="green" />
        </div>
        
        <!-- Error state -->
        <div v-else-if="error" class="p-4 bg-red-100 text-red-700 rounded-md">
          <p>{{ error }}</p>
          <p class="text-sm mt-2">
            Please add the site parameter to the URL (e.g., ?site=your-site-id)
          </p>
        </div>
        
        <!-- Title section -->
        <div v-else class="mb-4">
          <span class="text-3xl" aria-label="Tent">⛺</span>
          <h2 class="text-xl font-medium text-gray-700 mt-2">{{ t('areaHome.welcomeTo') }}</h2>
          <h1 class="text-3xl font-bold text-gray-900">{{ areaName }}</h1>
        </div>
      </div>
      
      <!-- Scrollable content area -->
      <div v-if="!isLoading && !error" class="flex-1 overflow-y-auto px-5 pb-4">
        <!-- Area info content - rendered as HTML from the database -->
        <div v-if="areaInfo" class="text-gray-800 area-info" v-html="areaInfo"></div>
        
        <!-- Fallback content if no area info is available -->
        <div v-else class="text-gray-800 space-y-3">
          <p class="text-gray-500 italic">{{ t('areaHome.noInfoAvailable') }}</p>
        </div>
      </div>
    </div>

    <!-- Footer with button - fixed at bottom -->
    <div class="p-4 mt-auto sticky bottom-0 bg-white border-t border-gray-100">
      <button 
        @click="sendMessage"
        class="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-md transition-colors"
      >
        {{ t('areaHome.sendMessage') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.area-info :deep(a) {
  color: #3b82f6;
  text-decoration: none;
}

.area-info :deep(a:hover) {
  text-decoration: underline;
}

.area-info :deep(strong) {
  font-weight: 600;
}

.area-info :deep(p) {
  margin-bottom: 0.75rem;
}

.area-info :deep(ul), .area-info :deep(ol) {
  margin-left: 1.5rem;
  margin-bottom: 0.75rem;
}

.area-info :deep(li) {
  margin-bottom: 0.25rem;
}
</style>