import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, Accessibility, Type, Eye, Zap, Volume2, Keyboard } from 'lucide-react';
import { useAccessibility } from '../../../context/AccessibilityContext';
import { useDropdown } from '../../../hooks/useDropdown';

const AccessibilityDropdown = () => {
  const { t, i18n } = useTranslation('navbar');
  const { isOpen, toggle, dropdownRef } = useDropdown();

  const {
    fontSize,
    highContrast,
    focusIndicators,
    reducedMotion,
    screenReader,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    toggleHighContrast,
    toggleFocusIndicators,
    toggleReducedMotion,
    toggleScreenReader,
  } = useAccessibility();

  const accessibilityMenuItems = [
    {
      id: 'fontSize',
      label: t('fontSize'),
      icon: <Type size={16} />,
      type: 'font-controls',
      controls: [
        {
          action: decreaseFontSize,
          label: t('decreaseFontSize'),
          icon: <span className="text-lg">A-</span>,
          disabled: fontSize === 'small',
        },
        {
          action: increaseFontSize,
          label: t('increaseFontSize'),
          icon: <span className="text-lg">A+</span>,
          disabled: fontSize === 'xxlarge',
        },
        {
          action: resetFontSize,
          label: t('resetFontSize'),
          icon: <span className="text-sm">A</span>,
        },
      ],
    },
    {
      id: 'highContrast',
      label: t('highContrast'),
      icon: <Eye size={16} />,
      type: 'toggle',
      isActive: highContrast,
      onToggle: toggleHighContrast,
      activeLabel: t('highContrastOn'),
      inactiveLabel: t('highContrastOff'),
    },
    {
      id: 'focusIndicators',
      label: t('focusIndicators'),
      icon: <Zap size={16} />,
      type: 'toggle',
      isActive: focusIndicators,
      onToggle: toggleFocusIndicators,
      activeLabel: t('focusIndicatorsOn'),
      inactiveLabel: t('focusIndicatorsOff'),
    },
    {
      id: 'reducedMotion',
      label: t('reducedMotion'),
      icon: <Zap size={16} />,
      type: 'toggle',
      isActive: reducedMotion,
      onToggle: toggleReducedMotion,
      activeLabel: t('reducedMotionOn'),
      inactiveLabel: t('reducedMotionOff'),
    },
    {
      id: 'screenReader',
      label: t('screenReader'),
      icon: <Volume2 size={16} />,
      type: 'toggle',
      isActive: screenReader,
      onToggle: toggleScreenReader,
      activeLabel: t('screenReaderOn'),
      inactiveLabel: t('screenReaderOff'),
    },
    {
      id: 'keyboardShortcuts',
      label: t('keyboardShortcuts'),
      icon: <Keyboard size={16} />,
      type: 'info',
      info: t('keyboardShortcutsInfo'),
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={toggle} className="accessibility-button" aria-label={t('accessibilityMenu')} aria-expanded={isOpen} aria-haspopup="true">
        <Accessibility size={16} className="text-orange-500" />
        <span className="hidden lg:inline">{t('accessibility')}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={i18n.language === 'ar' ? 'accessibility-dropdown-rtl' : 'accessibility-dropdown'}>
          <div className="py-2">
            {accessibilityMenuItems.map((item, index) => (
              <div key={item.id} className="border-b border-gray-100 last:border-b-0">
                {item.type === 'font-controls' && (
                  <div className="px-4 py-3">
                    <div className="flex items-center gap-3 mb-2">
                      {item.icon}
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    </div>
                    <div className="flex gap-1">
                      {item.controls.map((control, controlIndex) => (
                        <button
                          key={controlIndex}
                          onClick={control.action}
                          disabled={control.disabled}
                          className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs rounded border transition-colors ${
                            control.disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                          }`}
                          aria-label={control.label}
                        >
                          {control.icon}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {item.type === 'toggle' && (
                  <button onClick={item.onToggle} className="accessibility-toggle-item" aria-label={item.isActive ? item.activeLabel : item.inactiveLabel}>
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{item.isActive ? item.activeLabel : item.inactiveLabel}</span>
                      <div
                        className={`w-4 h-4 rounded-full border-2 transition-colors ${
                          item.isActive ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
                        }`}
                      >
                        {item.isActive && <div className="w-2 h-2 bg-white rounded-full m-0.5" />}
                      </div>
                    </div>
                  </button>
                )}

                {item.type === 'info' && (
                  <div className="accessibility-menu-item cursor-default">
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="text-sm text-gray-700">{item.label}</span>
                    </div>
                    <span className="text-xs text-gray-500">{item.info}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityDropdown;
