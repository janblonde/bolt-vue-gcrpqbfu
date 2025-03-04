<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { currentSite, bookingDetails } from '../store';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';
import CountryCodeSelector from '../components/CountryCodeSelector.vue';

const { t, locale } = useI18n();
const router = useRouter();
const isSubmitting = ref(false);
const submissionError = ref('');

// Form data
const email = ref('');
const phoneNumber = ref('');
const countryCode = ref('+31'); // Default to Netherlands
const keepMeUpdated = ref(false);
const agreeToTerms = ref(false);

// List of countries with their codes for phone number parsing
const countries = [
  { code: '+1', name: 'United States' },
  { code: '+44', name: 'United Kingdom' },
  { code: '+49', name: 'Germany' },
  { code: '+33', name: 'France' },
  { code: '+34', name: 'Spain' },
  { code: '+31', name: 'Netherlands' },
  { code: '+32', name: 'Belgium' },
  { code: '+39', name: 'Italy' },
  { code: '+41', name: 'Switzerland' },
  { code: '+43', name: 'Austria' },
  { code: '+45', name: 'Denmark' },
  { code: '+46', name: 'Sweden' },
  { code: '+47', name: 'Norway' },
  { code: '+351', name: 'Portugal' },
  { code: '+353', name: 'Ireland' },
  { code: '+358', name: 'Finland' },
  { code: '+420', name: 'Czech Republic' },
  { code: '+48', name: 'Poland' },
  { code: '+36', name: 'Hungary' },
  { code: '+30', name: 'Greece' }
];

// Load user data from bookingDetails on component mount
onMounted(() => {
  loadUserDataFromBookingDetails();
});

// Watch for changes in bookingDetails and update local state
watch(() => bookingDetails.value, () => {
  loadUserDataFromBookingDetails();
}, { deep: true });

// Function to load user data from bookingDetails
const loadUserDataFromBookingDetails = () => {
  if (bookingDetails.value.email) {
    email.value = bookingDetails.value.email;
  }
  
  if (bookingDetails.value.phoneNumber) {
    // Extract country code and phone number
    const fullPhone = bookingDetails.value.phoneNumber;
    // Find the country code that matches the start of the phone number
    const country = countries.find(c => fullPhone.startsWith(c.code));
    
    if (country) {
      countryCode.value = country.code;
      phoneNumber.value = fullPhone.substring(country.code.length);
    } else {
      // If no matching country code found, just use the full number
      phoneNumber.value = fullPhone;
    }
  }
  
  if (bookingDetails.value.keepMeUpdated !== undefined) {
    keepMeUpdated.value = bookingDetails.value.keepMeUpdated;
  }
};

// Form validation
const isEmailValid = computed(() => {
  if (!email.value) return true; // Don't show error when empty
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.value);
});

const isPhoneValid = computed(() => {
  if (!phoneNumber.value) return true; // Don't show error when empty
  const phoneRegex = /^\d{6,15}$/; // Simple validation for digits only, 6-15 digits
  return phoneRegex.test(phoneNumber.value);
});

const isFormValid = computed(() => {
  return email.value && isEmailValid.value && 
         phoneNumber.value && isPhoneValid.value && 
         agreeToTerms.value;
});

// Update booking details with current form values
const updateBookingDetails = () => {
  bookingDetails.value = {
    ...bookingDetails.value,
    email: email.value,
    phoneNumber: `${countryCode.value}${phoneNumber.value}`,
    keepMeUpdated: keepMeUpdated.value
  };
};

// Watch for changes in form values and update bookingDetails
watch([email, phoneNumber, countryCode, keepMeUpdated], () => {
  if (email.value && isEmailValid.value && phoneNumber.value && isPhoneValid.value) {
    updateBookingDetails();
  }
});

// Calculate the "until" timestamp based on the number of nights
const calculateUntilDate = (fromDate) => {
  // Add nrOfNights days to the from date
  const untilDate = new Date(fromDate);
  untilDate.setDate(untilDate.getDate() + bookingDetails.value.nrOfNights);
  // Set checkout time to 10:00 AM
  untilDate.setHours(10, 0, 0, 0);
  return untilDate;
};

// Send welcome email
const sendWelcomeEmail = async (registrationId) => {
  try {
    console.log(registrationId);
    const response = await fetch(`https://sendwelcomemail-2ox4dfqmkq-uc.a.run.app?registrationid=${registrationId}`);
    //const data = await response.json();
    //console.log('Welcome email API response:', data);
    //return data;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw the error - we don't want to fail the registration if email fails
    return { success: false, error: error.message };
  }
};

// Save registration to Firestore
const saveRegistration = async () => {
  if (!currentSite.value || !isFormValid.value) return;
  
  isSubmitting.value = true;
  submissionError.value = '';
  
  try {
    // Create the current date for timestamps
    const now = new Date();
    const untilDate = calculateUntilDate(now);
    
    // Create the registration data object with proper Firestore timestamps
    const registrationData = {
      areaCode: countryCode.value.replace('+', ''),
      creationDate: Timestamp.fromDate(now),
      email: email.value,
      from: Timestamp.fromDate(now),
      keepMeUpdated: keepMeUpdated.value,
      language: locale.value,
      licensePlate: bookingDetails.value.licensePlate,
      mobileNumber: phoneNumber.value,
      nrOfNights: bookingDetails.value.nrOfNights,
      paymentStatus: "free",
      site: currentSite.value.siteID,
      until: Timestamp.fromDate(untilDate),
      nrOfVisitors: bookingDetails.value.nrOfVisitors,
      useElectricity: bookingDetails.value.useElectricity
    };
    
    console.log('Saving registration data:', registrationData);
    
    // Add the document to the "registrations" collection
    const docRef = await addDoc(collection(db, 'registrations'), registrationData);
    
    console.log('Registration saved with ID:', docRef.id);
    
    // Send welcome email with the registration ID
    await sendWelcomeEmail(docRef.id);
    
    console.log('Registration successful!');
    
    // Navigate to the registration finished page
    router.push({ name: 'RegistrationFinished' });
  } catch (error) {
    console.error('Error saving registration:', error);
    submissionError.value = 'Failed to save registration. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};

// Navigation functions
const goBack = () => {
  // Update bookingDetails before navigating back
  updateBookingDetails();
  router.back();
};

const goNext = async () => {
  if (!isFormValid.value) return;
  
  // Store the user information in the booking details
  updateBookingDetails();
  
  // If the site is not a paying site, save the registration directly
  if (currentSite.value && !currentSite.value.payingSite) {
    await saveRegistration();
  } else {
    // If it's a paying site, navigate to the payment summary page
    router.push({ name: 'PaymentSummary' });
  }
};

// Open terms and conditions
const openTerms = () => {
  console.log('Opening terms and conditions');
  // This would open a modal or navigate to terms page
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
    <div class="flex-grow overflow-y-auto px-5 py-4 pb-24">
      <div v-if="currentSite" class="space-y-6">
        <!-- About You heading -->
        <div class="space-y-2">
          <span class="text-3xl" aria-label="Person">🙋</span>
          <h1 class="text-2xl font-bold text-gray-900">{{ t('aboutYou.title') }}</h1>
        </div>

        <!-- Contact information form -->
        <div class="space-y-4">
          <!-- Email field -->
          <div class="space-y-1">
            <label for="email" class="block text-sm font-medium text-gray-700">
              {{ t('aboutYou.emailAddress') }}
            </label>
            <input
              type="email"
              id="email"
              v-model="email"
              placeholder="email@example.com"
              class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
              :class="{ 'border-red-500': email && !isEmailValid }"
            />
            <p v-if="email && !isEmailValid" class="text-sm text-red-500">
              {{ t('aboutYou.invalidEmail') }}
            </p>
          </div>
          
          <!-- Phone number field with country code -->
          <div class="space-y-1">
            <label for="phone" class="block text-sm font-medium text-gray-700">
              {{ t('aboutYou.mobileNumber') }}
            </label>
            
            <!-- Mobile layout: stacked -->
            <div class="flex flex-col space-y-2 md:hidden">
              <CountryCodeSelector v-model="countryCode" />
              <input
                type="tel"
                id="phone-mobile"
                v-model="phoneNumber"
                placeholder="123456789"
                class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
                :class="{ 'border-red-500': phoneNumber && !isPhoneValid }"
              />
            </div>
            
            <!-- Desktop layout: side by side -->
            <div class="hidden md:flex md:space-x-2">
              <div class="w-1/3">
                <CountryCodeSelector v-model="countryCode" />
              </div>
              <input
                type="tel"
                id="phone-desktop"
                v-model="phoneNumber"
                placeholder="123456789"
                class="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
                :class="{ 'border-red-500': phoneNumber && !isPhoneValid }"
              />
            </div>
            
            <p v-if="phoneNumber && !isPhoneValid" class="text-sm text-red-500">
              {{ t('aboutYou.invalidPhone') }}
            </p>
          </div>
          
          <!-- Keep me updated checkbox -->
          <div class="flex items-start mt-4">
            <div class="flex items-center h-5">
              <input
                id="keep-updated"
                type="checkbox"
                v-model="keepMeUpdated"
                class="h-4 w-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="keep-updated" class="font-medium text-gray-700">
                {{ t('aboutYou.keepUpdated') }}
              </label>
              <p class="text-gray-500">{{ t('aboutYou.keepUpdatedDescription') }}</p>
            </div>
          </div>
          
          <!-- Terms and conditions checkbox -->
          <div class="flex items-start mt-4">
            <div class="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                v-model="agreeToTerms"
                class="h-4 w-4 text-green-500 border-gray-300 rounded focus:ring-green-500"
                required
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="terms" class="font-medium text-gray-700">
                {{ t('aboutYou.agreeTerms') }}
              </label>
              <button 
                @click="openTerms" 
                class="ml-1 text-green-600 hover:text-green-800 font-medium"
              >
                {{ t('aboutYou.read') }}
              </button>
            </div>
          </div>
          
          <!-- Error message -->
          <div v-if="submissionError" class="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {{ submissionError }}
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
        @click="goNext"
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
        {{ t('aboutYou.next') }}
      </button>
    </div>
  </div>
</template>