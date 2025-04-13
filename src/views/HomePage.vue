<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { useRouter } from 'vue-router';
import { db } from '../firebase';
import { currentSite, clearSiteData } from '../store';
import LoadingSpinner from '../components/LoadingSpinner.vue';

const router = useRouter();
const siteLoading = ref(false);
const siteError = ref('');

// Get the 'site' parameter from the URL
const getSiteParam = (): string | null => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('site');
};

// Fetch site data from Firestore
const fetchSiteData = async () => {
  const siteParam = getSiteParam();
  
  if (!siteParam) {
    siteError.value = 'No site parameter provided in URL';
    clearSiteData();
    return;
  }
  
  siteLoading.value = true;
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
      
      // Update the global site reference
      currentSite.value = {
        id: siteDoc.id,
        ...siteData
      };
      
      // Route based on site properties
      if (siteData.reservationsAllowed || siteData.onlyWaterOption) {
        router.push({ name: 'Choice' });
      } else {
        router.push({ name: 'Welcome' });
      }
    } else {
      siteError.value = `Site with siteID ${siteParam} not found`;
      clearSiteData();
    }
  } catch (error) {
    console.error('Error fetching site data:', error);
    siteError.value = 'Error loading site data';
    clearSiteData();
  } finally {
    siteLoading.value = false;
  }
};

onMounted(() => {
  // Clear any existing site data when the home page loads
  clearSiteData();
  fetchSiteData();
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <!-- Loading Spinner -->
      <div v-if="siteLoading" class="flex flex-col items-center justify-center min-h-[70vh]">
        <LoadingSpinner size="lg" color="green" />
        <p class="mt-4 text-gray-600 dark:text-gray-400">Loading site data...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="siteError" class="max-w-md mx-auto mt-8">
        <div class="p-4 bg-red-100 text-red-700 rounded-md">
          <p>{{ siteError }}</p>
          <p class="text-sm mt-2">
            Please add the site parameter to the URL (e.g., ?site=your-site-id)
          </p>
        </div>
      </div>
    </div>
  </div>
</template>