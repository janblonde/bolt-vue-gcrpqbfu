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
  // Skip routing logic if going to home page
  if (to.name === 'Home') {
    return next();
  }
  
  // If we have a site loaded
  if (currentSite.value) {
    const site = currentSite.value;
    
    // Allow navigation to Nights page if coming from Welcome or Choice
    if (to.name === 'Nights' && (from.name === 'Welcome' || from.name === 'Choice')) {
      return next();
    }
    
    // Route to ChoicePage if reservationsAllowed or onlyWaterOption is true
    if (site.reservationsAllowed || site.onlyWaterOption) {
      if (to.name !== 'Choice' && to.name !== 'Nights') {
        return next({ name: 'Choice' });
      }
    } 
    // Otherwise route to WelcomePage
    else {
      if (to.name !== 'Welcome' && to.name !== 'Nights') {
        return next({ name: 'Welcome' });
      }
    }
    return next();
  }
  
  // If no site is loaded yet, go to home
  return next({ name: 'Home' });
});

export default router;