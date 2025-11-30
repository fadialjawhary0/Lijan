import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../../hooks/useLanguage';
import { NAVBAR_CLASSES } from '../../../constants/navbarConstants';

const LanguageToggle = () => {
  const { i18n } = useTranslation('navbar');
  const { toggleLanguage } = useLanguage();
  const currentLanguage = i18n.language;

  // Show "English" when in Arabic mode, and "عربي" when in English mode
  const displayText = currentLanguage === 'ar' ? 'English' : 'عربي';

  return (
    <button onClick={toggleLanguage} className={NAVBAR_CLASSES.languageButton} aria-label={`Switch to ${currentLanguage === 'en' ? 'Arabic' : 'English'}`}>
      <Globe className="w-4 h-4 text-blue-500" />
      <span>{displayText}</span>
    </button>
  );
};

export default LanguageToggle;
