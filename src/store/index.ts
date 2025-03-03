import { ref } from 'vue';
import type { Site, AreaRule } from '../types';

// Create reactive stores that can be accessed globally
export const currentSite = ref<Site | null>(null);
export const areaRules = ref<AreaRule | null>(null);