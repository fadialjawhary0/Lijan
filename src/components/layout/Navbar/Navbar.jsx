import React from 'react';
import { useTranslation } from 'react-i18next';

import MobileMenuButton from './MobileMenuButton';
import Notifications from './Notifications';
import LanguageToggle from './LanguageToggle';
import LogoutButton from './LogoutButton';
import AttachmentSearch from './AttachmentSearch';

import { NAVBAR_CLASSES } from '../../../constants/navbarConstants';
import ThemeToggle from '../../ui/ThemeToggle';

const Navbar = ({ onToggleMobileMenu }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  return (
    <header className={NAVBAR_CLASSES.header}>
      {/* First row - main navigation */}
      <div className="flex items-center w-full relative">
        <div className={`${NAVBAR_CLASSES.leftSection} flex-shrink-0`}>
          <MobileMenuButton onToggle={onToggleMobileMenu} />
        </div>

        {/* Search for desktop/tablet - hidden on mobile - centered */}
        <div className="absolute left-1/2 transform -translate-x-1/2 px-4 hidden sm:flex w-full max-w-md">
          <AttachmentSearch />
        </div>

        <div className={`${NAVBAR_CLASSES.rightSection} flex-shrink-0 ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
          <Notifications />
          <ThemeToggle />
          <LanguageToggle />
          <LogoutButton />
        </div>
      </div>

      {/* Second row - search for mobile only */}
      <div className="w-full mt-2 block sm:hidden">
        <AttachmentSearch />
      </div>
    </header>
  );
};

export default Navbar;
