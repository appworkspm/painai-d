import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../public/locales/en/translation.json';
import th from '../public/locales/th/translation.json';

i18n
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

export default i18n; 