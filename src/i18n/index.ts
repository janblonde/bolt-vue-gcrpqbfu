import { createI18n } from 'vue-i18n';
import en from './locales/en';
import de from './locales/de';
import fr from './locales/fr';
import es from './locales/es';
import nl from './locales/nl';

// Detect browser language
function getBrowserLanguage(): string {
  const browserLang = navigator.language.split('-')[0];
  const supportedLanguages = ['en', 'de', 'fr', 'es', 'nl'];
  
  return supportedLanguages.includes(browserLang) ? browserLang : 'en';
}

// Create i18n instance
const i18n = createI18n({
  legacy: false, // Use Composition API
  locale: getBrowserLanguage(),
  fallbackLocale: 'en',
  messages: {
    en,
    de,
    fr,
    es,
    nl
  }
});

export default i18n;