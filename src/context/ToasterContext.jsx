import { createContext, useContext, useState, useCallback } from 'react';

const ToasterContext = createContext();

export const ToasterProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(toast => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      type: 'success', // default type
      duration: 5000, // default 5 seconds
      ...toast,
    };

    setToasts(prev => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback(id => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const DEFAULT_DURATIONS = {
    success: 4000,
    error: 6000,
    info: 5000,
    warning: 5000,
  };

  const showSuccess = useCallback(
    (message, options = {}) => {
      return addToast({
        type: 'success',
        message,
        duration: DEFAULT_DURATIONS.success,
        ...options,
      });
    },
    [addToast]
  );

  const showError = useCallback(
    (message, options = {}) => {
      return addToast({
        type: 'error',
        message,
        duration: DEFAULT_DURATIONS.error,
        ...options,
      });
    },
    [addToast]
  );

  const showInfo = useCallback(
    (message, options = {}) => {
      return addToast({
        type: 'info',
        message,
        duration: DEFAULT_DURATIONS.info,
        ...options,
      });
    },
    [addToast]
  );

  const showWarning = useCallback(
    (message, options = {}) => {
      return addToast({
        type: 'warning',
        message,
        duration: DEFAULT_DURATIONS.warning,
        ...options,
      });
    },
    [addToast]
  );

  // Promise-based toast for async operations
  const showPromise = useCallback(
    (promise, messages = {}) => {
      const loadingId = addToast({
        type: 'info',
        message: messages.loading || 'Loading...',
        duration: 0, // Don't auto-dismiss loading toast
      });

      return promise
        .then(result => {
          removeToast(loadingId);
          return addToast({
            type: 'success',
            message: messages.success || 'Operation completed successfully',
            ...messages.successOptions,
          });
        })
        .catch(error => {
          removeToast(loadingId);
          return addToast({
            type: 'error',
            message: messages.error || error.message || 'An error occurred',
            ...messages.errorOptions,
          });
        });
    },
    [addToast, removeToast]
  );

  const value = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showPromise,
  };

  return <ToasterContext.Provider value={value}>{children}</ToasterContext.Provider>;
};

export const useToaster = () => {
  const context = useContext(ToasterContext);
  if (!context) {
    throw new Error('useToaster must be used within a ToasterProvider');
  }
  return context;
};

export const useToast = () => {
  const { showSuccess, showError, showInfo, showWarning, showPromise } = useToaster();

  return {
    success: showSuccess,
    error: showError,
    info: showInfo,
    warning: showWarning,
    promise: showPromise,
  };
};
