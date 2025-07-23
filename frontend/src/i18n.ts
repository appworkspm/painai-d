import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// For development, we can use direct imports
const isProduction = import.meta.env.PROD;

// Default empty resources as fallback
const defaultResources = {
  en: { translation: {} },
  th: { translation: {}}
};

// Initialize i18n
export const initI18n = async () => {
  try {
    // Initialize with empty resources first
    await i18n.use(initReactI18next).init({
      resources: defaultResources,
      lng: 'th',
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false
      },
      // Disable loading from public path as we'll load manually
      initImmediate: false
    });

    // Load translations based on environment
    if (isProduction) {
      // In production, use fetch to load translation files
      const [en, th] = await Promise.all([
        fetch('/locales/en/translation.json').then(res => res.json()),
        fetch('/locales/th/translation.json').then(res => res.json())
      ]);
      
      // Add resources after they're loaded
      i18n.addResourceBundle('en', 'translation', en);
      i18n.addResourceBundle('th', 'translation', th);
    } else {
      // In development, use dynamic imports
      const [en, th] = await Promise.all([
        import('../public/locales/en/translation.json'),
        import('../public/locales/th/translation.json')
      ]);
      
      // Add resources after they're loaded
      i18n.addResourceBundle('en', 'translation', en);
      i18n.addResourceBundle('th', 'translation', th);
    }
    
    return i18n;
  } catch (error) {
    console.error('Failed to initialize i18n:', error);
    // Return i18n instance even if loading translations fails
    return i18n;
  }
};

// Default export for backward compatibility
export default i18n;