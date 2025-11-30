import React from 'react';
import { useTranslation } from 'react-i18next';
import { LogOut } from 'lucide-react';
import { useLogout } from '../../../hooks/useLogout';
import { NAVBAR_CLASSES } from '../../../constants/navbarConstants';

const LogoutButton = () => {
  const { t } = useTranslation('navbar');
  const handleLogout = useLogout();

  return (
    <button onClick={handleLogout} className={NAVBAR_CLASSES.logoutButton} aria-label="Logout">
      <LogOut size={20} strokeWidth={1} />
      <span className="whitespace-nowrap hidden sm:block">{t('Logout')}</span>
    </button>
  );
};

export default LogoutButton;
