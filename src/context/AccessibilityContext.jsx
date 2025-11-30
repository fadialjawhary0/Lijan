import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  // Initialize state from localStorage or defaults
  const [accessibilityState, setAccessibilityState] = useState(() => {
    const saved = localStorage.getItem('accessibility-settings');
    return saved
      ? JSON.parse(saved)
      : {
          fontSize: 'medium',
          highContrast: false,
          focusIndicators: false,
          reducedMotion: false,
          screenReader: false,
        };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(accessibilityState));
  }, [accessibilityState]);

  // Apply accessibility classes to document body
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    // Remove all accessibility classes first
    body.classList.remove(
      'accessibility-high-contrast',
      'accessibility-reduced-motion',
      'accessibility-font-small',
      'accessibility-font-medium',
      'accessibility-font-large',
      'accessibility-font-xlarge',
      'accessibility-font-xxlarge'
    );

    html.classList.remove(
      'accessibility-font-small',
      'accessibility-font-medium',
      'accessibility-font-large',
      'accessibility-font-xlarge',
      'accessibility-font-xxlarge'
    );

    // Apply current accessibility settings
    if (accessibilityState.highContrast) {
      body.classList.add('accessibility-high-contrast');
      console.log('Added high contrast class'); // Debug log
    }

    if (accessibilityState.reducedMotion) {
      body.classList.add('accessibility-reduced-motion');
      console.log('Added reduced motion class'); // Debug log
    }

    // Apply font size to both body and html for better coverage
    if (accessibilityState.fontSize !== 'medium') {
      const fontSizeClass = `accessibility-font-${accessibilityState.fontSize}`;
      body.classList.add(fontSizeClass);
      html.classList.add(fontSizeClass);
      console.log('Added font size class:', fontSizeClass); // Debug log
    }

    // Apply focus indicators if enabled
    if (accessibilityState.focusIndicators) {
      // Add enhanced focus styles
      const style = document.createElement('style');
      style.id = 'accessibility-focus-styles';
      style.textContent = `
        *:focus {
          outline: 3px solid #3b82f6 !important;
          outline-offset: 2px !important;
        }
        button:focus, input:focus, select:focus, textarea:focus, a:focus {
          outline: 3px solid #3b82f6 !important;
          outline-offset: 2px !important;
        }
      `;

      // Remove existing style if it exists
      const existingStyle = document.getElementById('accessibility-focus-styles');
      if (existingStyle) {
        existingStyle.remove();
      }

      document.head.appendChild(style);
      console.log('Added focus indicators'); // Debug log
    } else {
      // Remove enhanced focus styles
      const existingStyle = document.getElementById('accessibility-focus-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    }

    // Apply screen reader enhancements if enabled
    if (accessibilityState.screenReader) {
      // Add screen reader specific enhancements
      const style = document.createElement('style');
      style.id = 'accessibility-screen-reader-styles';
      style.textContent = `
        .sr-only {
          position: absolute !important;
          width: 1px !important;
          height: 1px !important;
          padding: 0 !important;
          margin: -1px !important;
          overflow: hidden !important;
          clip: rect(0, 0, 0, 0) !important;
          white-space: nowrap !important;
          border: 0 !important;
        }
      `;

      // Remove existing style if it exists
      const existingStyle = document.getElementById('accessibility-screen-reader-styles');
      if (existingStyle) {
        existingStyle.remove();
      }

      document.head.appendChild(style);
      console.log('Added screen reader styles'); // Debug log
    } else {
      // Remove screen reader styles
      const existingStyle = document.getElementById('accessibility-screen-reader-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
    }
  }, [accessibilityState]);

  // Font size management
  const increaseFontSize = () => {
    const sizes = ['small', 'medium', 'large', 'xlarge', 'xxlarge'];
    const currentIndex = sizes.indexOf(accessibilityState.fontSize);
    if (currentIndex < sizes.length - 1) {
      setAccessibilityState(prev => ({
        ...prev,
        fontSize: sizes[currentIndex + 1],
      }));
      console.log('Font size increased to:', sizes[currentIndex + 1]); // Debug log
    }
  };

  const decreaseFontSize = () => {
    const sizes = ['small', 'medium', 'large', 'xlarge', 'xxlarge'];
    const currentIndex = sizes.indexOf(accessibilityState.fontSize);
    if (currentIndex > 0) {
      setAccessibilityState(prev => ({
        ...prev,
        fontSize: sizes[currentIndex - 1],
      }));
      console.log('Font size decreased to:', sizes[currentIndex - 1]); // Debug log
    }
  };

  const resetFontSize = () => {
    setAccessibilityState(prev => ({
      ...prev,
      fontSize: 'medium',
    }));
    console.log('Font size reset to medium'); // Debug log
  };

  // Toggle functions
  const toggleHighContrast = () => {
    setAccessibilityState(prev => ({
      ...prev,
      highContrast: !prev.highContrast,
    }));
    console.log('High contrast toggled'); // Debug log
  };

  const toggleFocusIndicators = () => {
    setAccessibilityState(prev => ({
      ...prev,
      focusIndicators: !prev.focusIndicators,
    }));
    console.log('Focus indicators toggled'); // Debug log
  };

  const toggleReducedMotion = () => {
    setAccessibilityState(prev => ({
      ...prev,
      reducedMotion: !prev.reducedMotion,
    }));
    console.log('Reduced motion toggled'); // Debug log
  };

  const toggleScreenReader = () => {
    setAccessibilityState(prev => ({
      ...prev,
      screenReader: !prev.screenReader,
    }));
    console.log('Screen reader toggled'); // Debug log
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = event => {
      // Ctrl/Cmd + Plus to increase font size
      if ((event.ctrlKey || event.metaKey) && event.key === '=') {
        event.preventDefault();
        increaseFontSize();
      }

      // Ctrl/Cmd + Minus to decrease font size
      if ((event.ctrlKey || event.metaKey) && event.key === '-') {
        event.preventDefault();
        decreaseFontSize();
      }

      // Ctrl/Cmd + 0 to reset font size
      if ((event.ctrlKey || event.metaKey) && event.key === '0') {
        event.preventDefault();
        resetFontSize();
      }

      // Ctrl/Cmd + H to toggle high contrast
      if ((event.ctrlKey || event.metaKey) && event.key === 'h') {
        event.preventDefault();
        toggleHighContrast();
      }

      // Ctrl/Cmd + M to toggle reduced motion
      if ((event.ctrlKey || event.metaKey) && event.key === 'm') {
        event.preventDefault();
        toggleReducedMotion();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const value = {
    ...accessibilityState,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    toggleHighContrast,
    toggleFocusIndicators,
    toggleReducedMotion,
    toggleScreenReader,
  };

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
};
