<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { currentSite, bookingDetails } from '../store';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import LoadingSpinner from '../components/LoadingSpinner.vue';
import { ref, computed } from 'vue';

const { t } = useI18n();
const router = useRouter();
const isProcessing = ref(false);
const paymentError = ref('');

// Calculate total price
const totalPrice = computed(() => {
  if (!currentSite.value) return 0;
  
  let price = currentSite.value.pricePerNight * bookingDetails.value.nrOfNights;
  
  // Add electricity cost if selected
  if (bookingDetails.value.useElectricity) {
    price += currentSite.value.priceForElectricity * bookingDetails.value.nrOfNights;
  }
  
  // Add visitor cost if applicable
  if (currentSite.value.pricePerVisitor > 0 && bookingDetails.value.nrOfVisitors > currentSite.value.freeVisitors) {
    const paidVisitors = bookingDetails.value.nrOfVisitors - currentSite.value.freeVisitors;
    price += paidVisitors * currentSite.value.pricePerVisitor * bookingDetails.value.nrOfNights;
  }
  
  // Add tourism tax if applicable
  if (currentSite.value.tourismTax) {
    const taxableVisitors = currentSite.value.tourismTaxOnlyAdults 
      ? bookingDetails.value.nrOfVisitors // Assuming all visitors are adults for simplicity
      : bookingDetails.value.nrOfVisitors;
    
    price += taxableVisitors * currentSite.value.tourismTaxPerVisitor * bookingDetails.value.nrOfNights;
  }
  
  return price;
});

// Mock payment processing
const processPayment = async () => {
  if (!currentSite.value) return;
  
  isProcessing.value = true;
  paymentError.value = '';
  
  try {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For now, just simulate a successful payment
    console.log('Payment processed successfully');
    
    // Navigate to registration page to complete the process
    router.push({ name: 'AboutYou' });
  } catch (error) {
    console.error('Payment processing error:', error);
    paymentError.value = 'Failed to process payment. Please try again.';
  } finally {
    isProcessing.value = false;
  }
};

// Navigation functions
const goBack = () => {
  router.back();
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

    <!-- Main content - Using a fixed layout with scrollable content -->
    <div class="flex-grow overflow-y-auto px-5 py-4 pb-20">
      <div v-if="currentSite" class="space-y-6">
        <!-- Payment heading -->
        <div class="space-y-2">
          <span class="text-3xl" aria-label="Payment">💳</span>
          <h1 class="text-2xl font-bold text-gray-900">Payment Summary</h1>
        </div>

        <!-- Booking details -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h2 class="font-medium text-gray-800 mb-3">Booking Details</h2>
          
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">Site:</span>
              <span class="font-medium">{{ currentSite.name }}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-600">License Plate:</span>
              <span class="font-medium">{{ bookingDetails.licensePlate }}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-600">Nights:</span>
              <span class="font-medium">{{ bookingDetails.nrOfNights }}</span>
            </div>
            
            <div class="flex justify-between">
              <span class="text-gray-600">People:</span>
              <span class="font-medium">{{ bookingDetails.nrOfVisitors }}</span>
            </div>
            
            <div v-if="bookingDetails.useElectricity" class="flex justify-between">
              <span class="text-gray-600">Electricity:</span>
              <span class="font-medium">Yes</span>
            </div>
          </div>
        </div>
        
        <!-- Payment details -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h2 class="font-medium text-gray-800 mb-3">Payment Details</h2>
          
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">Stay ({{ bookingDetails.nrOfNights }} nights):</span>
              <span class="font-medium">€{{ currentSite.pricePerNight * bookingDetails.nrOfNights }}</span>
            </div>
            
            <div v-if="bookingDetails.useElectricity" class="flex justify-between">
              <span class="text-gray-600">Electricity:</span>
              <span class="font-medium">€{{ currentSite.priceForElectricity * bookingDetails.nrOfNights }}</span>
            </div>
            
            <div v-if="currentSite.pricePerVisitor > 0 && bookingDetails.nrOfVisitors > currentSite.freeVisitors" class="flex justify-between">
              <span class="text-gray-600">Additional visitors:</span>
              <span class="font-medium">€{{ (bookingDetails.nrOfVisitors - currentSite.freeVisitors) * currentSite.pricePerVisitor * bookingDetails.nrOfNights }}</span>
            </div>
            
            <div v-if="currentSite.tourismTax" class="flex justify-between">
              <span class="text-gray-600">Tourism tax:</span>
              <span class="font-medium">€{{ bookingDetails.nrOfVisitors * currentSite.tourismTaxPerVisitor * bookingDetails.nrOfNights }}</span>
            </div>
            
            <div class="flex justify-between pt-2 border-t border-gray-200 mt-2">
              <span class="text-gray-800 font-medium">Total:</span>
              <span class="text-gray-900 font-bold">€{{ totalPrice.toFixed(2) }}</span>
            </div>
          </div>
        </div>
        
        <!-- Payment methods (placeholder) -->
        <div class="space-y-3">
          <h2 class="font-medium text-gray-800">Payment Method</h2>
          
          <div class="flex items-center space-x-4">
            <div class="flex-1 border border-green-500 rounded-md p-3 bg-green-50">
              <div class="flex items-center">
                <input 
                  id="card-payment" 
                  type="radio" 
                  checked 
                  class="h-4 w-4 text-green-500 border-gray-300 focus:ring-green-500"
                />
                <label for="card-payment" class="ml-2 text-gray-700 font-medium">
                  Credit/Debit Card
                </label>
              </div>
            </div>
          </div>
          
          <!-- Error message -->
          <div v-if="paymentError" class="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {{ paymentError }}
          </div>
        </div>
      </div>

      <div v-else class="flex justify-center items-center h-full">
        <p class="text-red-500">No site data available</p>
      </div>
    </div>

    <!-- Footer with button - fixed at bottom -->
    <div class="p-4 fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
      <button 
        @click="processPayment"
        class="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center"
        :disabled="isProcessing"
        :class="{ 'opacity-50 cursor-not-allowed': isProcessing }"
      >
        <span v-if="isProcessing" class="mr-2">
          <LoadingSpinner size="sm" color="white" />
        </span>
        <span v-if="isProcessing">Processing...</span>
        <span v-else>Pay €{{ totalPrice.toFixed(2) }}</span>
      </button>
    </div>
  </div>
</template>