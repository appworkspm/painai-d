import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// For development, we can use direct imports
const isProduction = import.meta.env.PROD;

// Function to load translations
const loadTranslations = async () => {
  if (isProduction) {
    // In production, use dynamic imports with explicit paths
    const [en, th] = await Promise.all([
      import('../../public/locales/en/translation.json'),
      import('../../public/locales/th/translation.json')
    ]);
    return { en: en.default, th: th.default };
  } else {
    // In development, use direct imports
    const en = await import('../public/locales/en/translation.json');
    const th = await import('../public/locales/th/translation.json');
    return { en, th };
  }
};

// Initialize i18n
export const initI18n = async () => {
  try {
    const { en, th } = await loadTranslations();
    
    return i18n
      .use(initReactI18next)
      .init({
        resources: {
          en: { translation: en },
          th: { translation: th }
        },
        lng: 'th',
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false
        },
        // Disable loading from public path in production
        // as we're using dynamic imports
        backend: isProduction ? undefined : {}
      });
  } catch (error) {
    console.error('Failed to initialize i18n:', error);
    throw error;
  }
};

// Default export for backward compatibility
export default i18n;