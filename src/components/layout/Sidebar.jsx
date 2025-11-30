import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown, X, FileText, Download, Bell, LogOut, User } from 'lucide-react';

import { PRIVATE_ROUTES } from '../../constants';

// import DevoteamLogo from '../../assets/Devoteam_logo.png';
import DevoteamLogo from '../../assets/HHC_Logo.png';

import { useTranslation } from 'react-i18next';
import { useSidebar } from '../../context';
import i18n from '../../i18n/i18n';
import { useAuth } from '../../context/AuthContext';
import { IISPATH } from '../../constants/IISPath.const';

const Sidebar = ({ isMobileMenuOpen, onCloseMobileMenu }) => {
  const navigate = useNavigate();
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const { t, i18n: i18nInstance } = useTranslation('sidebar');
  const { t: tNavbar } = useTranslation('navbar');
  const { user } = useAuth();

  const location = useLocation();

  const isRTL = i18nInstance.dir() === 'rtl';

  const routes = PRIVATE_ROUTES;

  const handleMobileMenuClose = () => {
    onCloseMobileMenu();
  };

  const handleLinkClick = () => {
    if (isMobileMenuOpen) handleMobileMenuClose();
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = `${IISPATH}/login`;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Fixed Header Section */}
      <div className="shrink-0 p-4 pb-0">
        <div className="flex items-center justify-between mb-6">
          {/* <img src={DevoteamLogo} alt="logo" className="w-10 h-10 cursor-pointer" onClick={() => navigate('/')} /> */}
          <img src={DevoteamLogo} alt="logo" className="w-14 h-14 cursor-pointer" onClick={() => navigate('/')} />

          {!isMobileMenuOpen && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`p-1 rounded-lg transition-colors duration-200 ${isCollapsed ? '' : 'hover:bg-surface-elevated'}`}
            >
              {isCollapsed ? (
                isRTL ? (
                  <ChevronLeft className="w-5 h-5 text-text-muted cursor-pointer" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-text-muted cursor-pointer" />
                )
              ) : isRTL ? (
                <ChevronRight className="w-5 h-5 text-text-muted cursor-pointer" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-text-muted cursor-pointer" />
              )}
            </button>
          )}
          {isMobileMenuOpen && (
            <button onClick={handleMobileMenuClose} className="p-1 rounded-lg transition-colors duration-200 hover:bg-surface-elevated">
              <X className="w-5 h-5 text-gray-600 cursor-pointer" />
            </button>
          )}
        </div>

        {/* User Section */}
        <div className="border-b border-border pb-4 mb-4">
          <div className={`flex items-center gap-3 px-2 py-1 rounded-lg bg-surface`}>
            <User className="text-brand" size={20} />
            {(!isCollapsed || isMobileMenuOpen) && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text text-sm truncate" lang="en">
                  {user?.fullName}
                </p>
                <p className="text-xs text-text-muted">{i18n.language === 'ar' ? user?.arabicRoleName : user?.englishRoleName}</p>
              </div>
            )}
          </div>
        </div>

        {/* Mobile-only navbar items */}
        {isMobileMenuOpen && (
          <div className="border-b border-border pb-4 mb-4">
            <div className="space-y-3">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="w-full flex items-center gap-3 text-dark px-3 py-2 rounded-lg transition-colors duration-200 font-medium hover:bg-gray-200 hover:text-primary-rich"
              >
                <span className="text-lg">🌐</span>
                <span>{tNavbar('switch')}</span>
              </button>

              {/* Notifications */}
              <button className="w-full flex items-center gap-3 text-dark px-3 py-2 rounded-lg transition-colors duration-200 font-medium hover:bg-gray-200 hover:text-primary-rich">
                <Bell size={20} />
                <span>Notifications</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Routes Section */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4">
        <ul className="space-y-2">
          {routes
            ?.filter(route => route?.showInSidebar)
            ?.map(route => {
              const isActive = Array.isArray(route?.key)
                ? route?.key?.some(key => location?.pathname?.includes(key))
                : location?.pathname?.includes(route?.key);

              return (
                <li key={route?.key}>
                  <Link
                    to={route?.path}
                    onClick={handleLinkClick}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 font-medium text-text ${
                      isActive ? 'bg-brand text-white' : ''
                    }`}
                    title={isCollapsed && !isMobileMenuOpen ? t('sidebar.' + route?.label) : ''}
                  >
                    {route?.icon && (
                      <span>
                        <route.icon size={22} strokeWidth={1} />
                      </span>
                    )}
                    <span
                      className={`whitespace-nowrap transition-all duration-300 ${
                        isCollapsed && !isMobileMenuOpen ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100 w-auto'
                      } ${isRTL ? 'text-[0.95rem]' : ''}`}
                    >
                      {t('sidebar.' + route?.label)}
                    </span>
                  </Link>
                </li>
              );
            })}
        </ul>
      </div>

      {/* Fixed Logout Section */}
      <div className="shrink-0 border-t border-border pt-4 px-4 pb-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 cursor-pointer rounded-lg transition-colors duration-200 font-medium text-red-600 hover:bg-red-50 hover:text-red-700 border border-border"
          title={isCollapsed && !isMobileMenuOpen ? t('sidebar.logout') : ''}
        >
          <LogOut size={22} strokeWidth={1} />
          {(!isCollapsed || isMobileMenuOpen) && <span className="whitespace-nowrap">{t('sidebar.logout')}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-screen border-x border-border text-white bg-surface-elevated 
        transition-all duration-300 ease-in-out z-30 ${isCollapsed ? 'w-20' : 'w-58'} hidden lg:block`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-[60] lg:hidden" onClick={handleMobileMenuClose}>
          <div
            className={`fixed top-0 ${
              isRTL ? 'right-0' : 'left-0'
            } h-screen w-64 bg-surface-elevated border-x border-border text-white shadow-lg transform transition-transform duration-300 ease-in-out z-[60]`}
            onClick={e => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
