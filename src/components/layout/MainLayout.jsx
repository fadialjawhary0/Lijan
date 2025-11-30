import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { useSidebar } from '../../context';
import { useCommittee } from '../../context/CommitteeContext';
// import { useAccessibilityClasses } from '../../hooks/useAccessibilityClasses';

import Sidebar from './Sidebar';
import Navbar from './Navbar/Navbar';
import Breadcrumbs from './Breadcrumbs';
// import FloatingAccessibility from '../ui/FloatingAccessibility';
// import ChatBot from '../ui/ChatBot';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const { isCollapsed } = useSidebar();
  const { selectedCommitteeId } = useCommittee();
  // const { getAccessibilityClasses } = useAccessibilityClasses();

  const { i18n } = useTranslation('sidebar');
  const isRTL = i18n.dir() === 'rtl';

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, [location.pathname]);

  const HandelToggleMobileMenu = {
    MobileMenuOpen: () => setIsMobileMenuOpen(!isMobileMenuOpen),
    MobileMenuClose: () => setIsMobileMenuOpen(false),
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      {/* <div className="absolute top-0 left-0 w-full h-full bg-black/25 z-0"></div> */}
      {selectedCommitteeId && <Sidebar isMobileMenuOpen={isMobileMenuOpen} onCloseMobileMenu={HandelToggleMobileMenu?.MobileMenuClose} />}
      <div
        className={`flex-1 transition-all duration-300 flex flex-col h-auto max-w-full ${
          selectedCommitteeId ? (isCollapsed ? (isRTL ? 'lg:pr-20' : 'lg:pl-20') : isRTL ? 'lg:pr-58' : 'lg:pl-58') : ''
        }`}
      >
        <Navbar onToggleMobileMenu={HandelToggleMobileMenu?.MobileMenuOpen} />
        <Breadcrumbs />
        <div className="flex-1 p-2 md:p-4 md:pb-12 flex flex-col h-full">
          <main className="flex-1 flex flex-col h-full justify-between sm:container-app w-full">{children}</main>
        </div>
      </div>
      {/* <FloatingAccessibility /> */}
      {/* <ChatBot /> */}
    </div>
  );
};

export default MainLayout;
