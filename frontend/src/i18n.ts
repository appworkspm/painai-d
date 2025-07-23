import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations directly (they will be inlined in the bundle)
import enTranslation from './locales/en/translation.json';
import thTranslation from './locales/th/translation.json';

// Initialize i18n
export const initI18n = async () => {
  try {
    await i18n.use(initReactI18next).init({
      resources: {
        en: {
          translation: enTranslation
        },
        th: {
          translation: thTranslation
        }
      },
      lng: 'th',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false
      },
      // Disable loading from public path as we're inlining translations
      initImmediate: false
    });
    
    return i18n;
  } catch (error) {
    console.error('Failed to initialize i18n:', error);
    return i18n;
  }
};

// Default export for backward compatibility
export default i18n;