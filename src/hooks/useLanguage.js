import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Custom hook for managing language switching and RTL support
 * @returns {Object} Language utilities
 */
export const useLanguage = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    if (i18n.language === 'ar') {
      document.body.classList.add('ar-font');
    } else {
      document.body.classList.remove('ar-font');
    }
  }, [i18n.language]);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const isRTL = i18n.language === 'ar';

  return {
    currentLanguage: i18n.language,
    toggleLanguage,
    isRTL,
  };
};
