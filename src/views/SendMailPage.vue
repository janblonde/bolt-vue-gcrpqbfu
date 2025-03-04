<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { bookingDetails } from '../store';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();

// Form data
const email = ref('');
const subject = ref('');
const message = ref('');
const isSubmitting = ref(false);
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarIsError = ref(false);

// Get area name and recipient email from route query
const areaName = computed(() => route.query.areaName as string || '');
const recipientEmail = computed(() => route.query.email as string || '');

// Form validation
const isEmailValid = computed(() => {
  if (!email.value) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.value);
});

const isSubjectValid = computed(() => subject.value.trim() !== '');
const isMessageValid = computed(() => message.value.trim() !== '');
const isFormValid = computed(() => isEmailValid.value && isSubjectValid.value && isMessageValid.value);

// Error messages
const emailError = computed(() => {
  if (!email.value) return t('sendMail.emailRequired');
  if (!isEmailValid.value) return t('sendMail.invalidEmail');
  return '';
});

const subjectError = computed(() => {
  if (!subject.value) return t('sendMail.subjectRequired');
  return '';
});

const messageError = computed(() => {
  if (!message.value) return t('sendMail.messageRequired');
  return '';
});

// Close function
const close = () => {
  router.back();
};

// Show snackbar with message
const showSnackbarMessage = (message: string, isError: boolean = false) => {
  snackbarMessage.value = message;
  snackbarIsError.value = isError;
  showSnackbar.value = true;
  
  // Hide snackbar after 2000ms
  setTimeout(() => {
    showSnackbar.value = false;
  }, 2000);
};

// Send message function
const sendMessage = async () => {
  if (!isFormValid.value) return;
  
  isSubmitting.value = true;
  
  try {
    // Construct API URL with query parameters
    const apiUrl = new URL('https://sendmail-2ox4dfqmkq-uc.a.run.app');
    apiUrl.searchParams.append('to', recipientEmail.value);
    apiUrl.searchParams.append('subject', subject.value);
    apiUrl.searchParams.append('text', message.value);
    apiUrl.searchParams.append('reply_to', email.value);
    
    // Call the API
    const response = await fetch(apiUrl.toString());
    
    if (response.status === 200) {
      // Show success snackbar
      showSnackbarMessage('Email sent');
      
      // Wait for snackbar to be visible before navigating back
      setTimeout(() => {
        close();
      }, 2000);
    } else {
      // Show error snackbar
      showSnackbarMessage('Email sending failed', true);
      isSubmitting.value = false;
    }
  } catch (error) {
    console.error('Error sending email:', error);
    showSnackbarMessage('Email sending failed', true);
    isSubmitting.value = false;
  }
};

// Initialize form with email from bookingDetails if available
onMounted(() => {
  if (bookingDetails.value.email) {
    email.value = bookingDetails.value.email;
  }
});
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">
    <!-- Header with close button -->
    <div class="flex justify-between items-center p-4">
      <button @click="close" class="text-gray-800" aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Main content - Using a fixed layout with scrollable content -->
    <div class="flex-grow overflow-y-auto px-5 py-2 pb-20">
      <div class="space-y-6">
        <!-- Email icon and title -->
        <div>
          <span class="text-3xl" aria-label="Email">✉️</span>
          <h2 class="text-xl font-medium text-gray-700 mt-2">{{ t('sendMail.sendEmailTo') }}</h2>
          <h1 class="text-3xl font-bold text-gray-900">{{ areaName }}</h1>
        </div>
        
        <!-- Email form -->
        <form @submit.prevent="sendMessage" class="space-y-4">
          <!-- Your email address -->
          <div class="space-y-1">
            <label for="email" class="block text-sm font-medium text-gray-700">
              {{ t('sendMail.yourEmailAddress') }}
            </label>
            <input
              type="email"
              id="email"
              v-model="email"
              class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
              :class="{ 'border-red-500': email && !isEmailValid }"
              required
            />
            <p v-if="emailError && email" class="text-sm text-red-500">
              {{ emailError }}
            </p>
          </div>
          
          <!-- Subject -->
          <div class="space-y-1">
            <label for="subject" class="block text-sm font-medium text-gray-700">
              {{ t('sendMail.subject') }}
            </label>
            <input
              type="text"
              id="subject"
              v-model="subject"
              class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
              :class="{ 'border-red-500': subject && !isSubjectValid }"
              required
            />
            <p v-if="subjectError && subject" class="text-sm text-red-500">
              {{ subjectError }}
            </p>
          </div>
          
          <!-- Message -->
          <div class="space-y-1">
            <label for="message" class="block text-sm font-medium text-gray-700">
              {{ t('sendMail.message') }}
            </label>
            <textarea
              id="message"
              v-model="message"
              rows="6"
              class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
              :class="{ 'border-red-500': message && !isMessageValid }"
              required
            />
            <p v-if="messageError && message" class="text-sm text-red-500">
              {{ messageError }}
            </p>
          </div>
        </form>
      </div>
    </div>

    <!-- Footer with button - fixed at bottom -->
    <div class="p-4 fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100">
      <button 
        @click="sendMessage"
        class="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center"
        :disabled="!isFormValid || isSubmitting"
        :class="{ 'opacity-50 cursor-not-allowed': !isFormValid || isSubmitting }"
      >
        <span v-if="isSubmitting" class="mr-2">
          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </span>
        {{ t('sendMail.sendMessage') }}
      </button>
    </div>
    
    <!-- Snackbar -->
    <div 
      v-if="showSnackbar" 
      class="fixed bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md shadow-lg text-white text-center min-w-[200px]"
      :class="snackbarIsError ? 'bg-red-500' : 'bg-green-500'"
    >
      {{ snackbarMessage }}
    </div>
  </div>
</template>