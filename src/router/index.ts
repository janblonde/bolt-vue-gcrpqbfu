import { createRouter, createWebHistory } from 'vue-router';
import { currentSite } from '../store';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomePage.vue'),
  },
  {
    path: '/choice',
    name: 'Choice',
    component: () => import('../views/ChoicePage.vue'),
  },
  {
    path: '/welcome',
    name: 'Welcome',
    component: () => import('../views/WelcomePage.vue'),
  },
  {
    path: '/nights',
    name: 'Nights',
    component: () => import('../views/NightsPage.vue'),
  },
  {
    path: '/license',
    name: 'License',
    component: () => import('../views/LicensePage.vue'),
  },
  {
    path: '/about-you',
    name: 'AboutYou',
    component: () => import('../views/AboutYouPage.vue'),
  },
  {
    path: '/payment-summary',
    name: 'PaymentSummary',
    component: () => import('../views/PaymentSummaryPage.vue'),
  },
  {
    path: '/registration-finished',
    name: 'RegistrationFinished',
    component: () => import('../views/RegistrationFinishedPage.vue'),
  },
  {
    path: '/area-home',
    name: 'AreaHome',
    component: () => import('../views/AreaHomePage.vue'),
  },
  {
    path: '/send-mail',
    name: 'SendMail',
    component: () => import('../views/SendMailPage.vue'),
  },
  {
    path: '/error-max-nights',
    name: 'ErrorMaxNights',
    component: () => import('../views/ErrorMaxNightsPage.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard to handle routing based on site properties
router.beforeEach((to, from, next) => {
  // Skip routing logic if going to home page or area home page
  if (to.name === 'Home' || to.name === 'AreaHome' || to.name === 'SendMail') {
    return next();
  }
  
  // If we have a site loaded
  if (currentSite.value) {
    // Allow direct navigation between pages
    if (from.name === 'Choice' && to.name === 'Welcome') {
      return next();
    }
    
    // Allow navigation to Nights page if coming from Welcome or Choice
    if (to.name === 'Nights' && (from.name === 'Welcome' || from.name === 'Choice')) {
      return next();
    }
    
    // Allow navigation to License page if coming from Nights
    if (to.name === 'License' && from.name === 'Nights') {
      return next();
    }
    
    // Allow navigation to AboutYou page if coming from License
    if (to.name === 'AboutYou' && from.name === 'License') {
      return next();
    }
    
    // Allow navigation to PaymentSummary page if coming from AboutYou
    if (to.name === 'PaymentSummary' && from.name === 'AboutYou') {
      return next();
    }
    
    // Allow navigation to RegistrationFinished page if coming from AboutYou or PaymentSummary
    if (to.name === 'RegistrationFinished' && (from.name === 'AboutYou' || from.name === 'PaymentSummary')) {
      return next();
    }
    
    // Allow navigation to ErrorMaxNights page from any page
    if (to.name === 'ErrorMaxNights') {
      return next();
    }
    
    // Route to ChoicePage if reservationsAllowed or onlyWaterOption is true
    if (currentSite.value.reservationsAllowed || currentSite.value.onlyWaterOption) {
      if (to.name !== 'Choice' && to.name !== 'Nights' && to.name !== 'License' && 
          to.name !== 'AboutYou' && to.name !== 'PaymentSummary' && to.name !== 'RegistrationFinished') {
        return next({ name: 'Choice' });
      }
    } 
    // Otherwise route to WelcomePage
    else {
      if (to.name !== 'Welcome' && to.name !== 'Nights' && to.name !== 'License' && 
          to.name !== 'AboutYou' && to.name !== 'PaymentSummary' && to.name !== 'RegistrationFinished') {
        return next({ name: 'Welcome' });
      }
    }
    return next();
  }
  
  // If no site is loaded yet, go to home
  return next({ name: 'Home' });
});

export default router;