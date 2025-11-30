import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for managing dropdown state and outside click detection
 * @param {boolean} initialOpen - Initial state of the dropdown
 * @returns {Object} Dropdown state and handlers
 */
export const useDropdown = (initialOpen = false) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const dropdownRef = useRef(null);

  const toggle = () => setIsOpen(prev => !prev);
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        close();
      }
    };

    if (isOpen) document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return {
    isOpen,
    toggle,
    open,
    close,
    dropdownRef,
  };
};
