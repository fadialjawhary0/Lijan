import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

const DropdownMenu = ({ trigger, children, className = '' }) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const handleToggle = e => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setOpen(prev => !prev);
  };

  React.useLayoutEffect(() => {
    if (open && triggerRef.current) {
      const updatePosition = () => {
        if (!triggerRef.current) return;
        
        const rect = triggerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Estimate menu dimensions
        const estimatedMenuHeight = 200; // Approximate height for 3-4 items
        const estimatedMenuWidth = 150;

        // Calculate available space (using viewport coordinates since we use fixed positioning)
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        const spaceRight = viewportWidth - rect.right;
        const spaceLeft = rect.left;

        // Determine if we should open above or below
        // Open above if there's not enough space below AND more space above
        const openAbove = spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow;
        
        // Calculate vertical position (fixed positioning uses viewport coordinates, NOT scroll coordinates)
        let top;
        if (openAbove) {
          // Open above the trigger
          top = rect.top - estimatedMenuHeight - 4; // 4px gap
          // Ensure it doesn't go above viewport
          if (top < 8) {
            top = 8;
          }
        } else {
          // Open below the trigger
          top = rect.bottom + 4; // 4px gap
        }

        // Calculate horizontal position
        let left;
        let right;
        
        if (isRTL) {
          // For RTL, align to the right edge of the trigger
          if (spaceRight >= estimatedMenuWidth) {
            // Enough space on the right, align to right edge
            right = viewportWidth - rect.right;
            left = 'auto';
          } else if (spaceLeft >= estimatedMenuWidth) {
            // Not enough space on right, but enough on left - flip to left
            left = rect.left - estimatedMenuWidth;
            right = 'auto';
          } else {
            // Not enough space on either side, align to viewport edge
            right = 8; // 8px margin from viewport edge
            left = 'auto';
          }
        } else {
          // For LTR, align to the left edge of the trigger
          if (spaceRight >= estimatedMenuWidth) {
            // Enough space on the right, align to left edge
            left = rect.left;
            right = 'auto';
          } else if (spaceLeft >= estimatedMenuWidth) {
            // Not enough space on right, but enough on left - flip to left
            left = rect.left - estimatedMenuWidth + rect.width;
            right = 'auto';
          } else {
            // Not enough space on either side, align to viewport edge
            left = 8; // 8px margin from viewport edge
            right = 'auto';
          }
        }

        setPosition({
          top,
          left,
          right,
          openAbove,
        });
      };

      // Initial position calculation
      updatePosition();

      // Recalculate after menu is rendered to get actual dimensions
      const timeoutId = setTimeout(() => {
        if (menuRef.current && triggerRef.current) {
          const menuRect = menuRef.current.getBoundingClientRect();
          const rect = triggerRef.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const viewportWidth = window.innerWidth;

          const spaceBelow = viewportHeight - rect.bottom;
          const spaceAbove = rect.top;
          const spaceRight = viewportWidth - rect.right;
          const spaceLeft = rect.left;

          // Open above if there's not enough space below AND more space above
          const openAbove = spaceBelow < menuRect.height && spaceAbove > spaceBelow;
          
          let top;
          if (openAbove) {
            // Open above the trigger
            top = rect.top - menuRect.height - 4;
            // Ensure it doesn't go above viewport
            if (top < 8) {
              top = 8;
            }
          } else {
            // Open below the trigger
            top = rect.bottom + 4;
            // If it would go below viewport, flip to above instead
            if (top + menuRect.height > viewportHeight - 8) {
              if (spaceAbove >= menuRect.height) {
                // Flip to above if there's enough space
                top = rect.top - menuRect.height - 4;
                if (top < 8) top = 8;
              } else {
                // Not enough space above either - scroll page to show it
                const targetScroll = window.scrollY + (top + menuRect.height - viewportHeight + 8);
                window.scrollTo({ top: targetScroll, behavior: 'smooth' });
              }
            }
          }

          let left;
          let right;
          
          if (isRTL) {
            if (spaceRight >= menuRect.width) {
              right = viewportWidth - rect.right;
              left = 'auto';
            } else if (spaceLeft >= menuRect.width) {
              left = rect.left - menuRect.width;
              right = 'auto';
            } else {
              right = 8;
              left = 'auto';
            }
          } else {
            if (spaceRight >= menuRect.width) {
              left = rect.left;
              right = 'auto';
            } else if (spaceLeft >= menuRect.width) {
              left = rect.left - menuRect.width + rect.width;
              right = 'auto';
            } else {
              left = 8;
              right = 'auto';
            }
          }

          setPosition({
            top,
            left,
            right,
            openAbove,
          });
        }
      }, 0);

      return () => clearTimeout(timeoutId);
    } else {
      setPosition(null);
    }
  }, [open, isRTL]);

  useEffect(() => {
    const handleClick = e => {
      if (menuRef.current && !menuRef.current.contains(e.target) && triggerRef.current && !triggerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleEsc = e => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    const handleScroll = () => {
      if (open) setOpen(false); // Close on scroll to avoid detached menu
    };

    if (open) {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('keydown', handleEsc);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
    }
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [open]);

  // Clone the trigger and add onClick handler and ref callback
  const triggerWithClick = React.cloneElement(trigger, {
    onClick: handleToggle,
    ref: (node) => {
      triggerRef.current = node;
      // Also call original ref if it exists
      if (typeof trigger.ref === 'function') {
        trigger.ref(node);
      } else if (trigger.ref) {
        trigger.ref.current = node;
      }
    },
  });

  return (
    <>
      <div 
        className={`relative inline-block ${className}`} 
        onClick={e => e.stopPropagation()}
      >
        {triggerWithClick}
      </div>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-[9999] bg-white dark:bg-surface rounded-lg shadow-lg border border-gray-200 dark:border-border py-1 min-w-[120px] animate-fade-in"
            style={{
              top: position?.top ?? 0,
              left: position?.left ?? 'auto',
              right: position?.right ?? 'auto',
            }}
            onClick={e => e.stopPropagation()}
          >
            {children}
          </div>,
          document.body
        )}
    </>
  );
};

const DropdownMenuItem = ({ children, onClick, className = '', disabled = false }) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const handleClick = e => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) onClick(e);
  };

  return (
    <button
      className={`w-full px-3 py-2 text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-text cursor-pointer hover:bg-gray-100 dark:hover:bg-surface-hover ${
        isRTL ? 'text-right' : 'text-left'
      } ${className}`}
      onClick={handleClick}
      disabled={disabled}
    >
      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>{children}</div>
    </button>
  );
};

export { DropdownMenu, DropdownMenuItem };
