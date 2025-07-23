import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Use dynamic imports for production build
const loadTranslations = async () => {
  const [en, th] = await Promise.all([
    import('../public/locales/en/translation.json'),
    import('../public/locales/th/translation.json')
  ]);

  return { en, th };
};

// Initialize i18n
export const initI18n = async () => {
  const { en, th } = await loadTranslations();
  
  return i18n
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        th: { translation: th }
      },
      lng: 'th', // เปลี่ยนเป็น 'en' ถ้าต้องการเริ่มต้นที่อังกฤษ
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false
      }
    });
};

// Default export for backward compatibility
export default i18n;