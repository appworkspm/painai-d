import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const Settings = () => {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
  };

  const languages = [
    { code: 'th', name: 'ไทย' },
    { code: 'en', name: 'English' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{t('settings.title')}</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Globe className="h-5 w-5 mr-2 text-gray-500" />
          {t('settings.language')}
        </h2>
        
        <div className="mt-2 space-y-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                i18n.language === lang.code
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {lang.name}
              {i18n.language === lang.code && (
                <span className="ml-2 text-blue-600">✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;