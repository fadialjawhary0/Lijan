import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

const ToastItem = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300); // Match animation duration
  };

  const getToastStyles = () => {
    const baseStyles = 'relative flex items-start gap-3 p-4  shadow-lg border backdrop-blur-sm transition-all duration-300 ease-in-out transform';

    if (isLeaving) {
      return `${baseStyles} translate-x-full opacity-0 scale-95`;
    }

    if (isVisible) {
      return `${baseStyles} translate-x-0 opacity-100 scale-100`;
    }

    return `${baseStyles} translate-x-full opacity-0 scale-95`;
  };

  const getTypeStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: 'text-green-500',
          iconBg: 'bg-green-100',
          progress: 'bg-green-500',
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: 'text-red-500',
          iconBg: 'bg-red-100',
          progress: 'bg-red-500',
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200 text-gray-800',
          icon: 'text-gray-500',
          iconBg: 'bg-gray-100',
          progress: 'bg-gray-500',
        };
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'error':
        return <XCircle size={20} />;
      default:
        return <CheckCircle size={20} />;
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`${getToastStyles()} ${styles.container} min-w-[320px] max-w-[480px] `}>
      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-t-xl overflow-hidden">
          <div
            className={`h-full ${styles.progress} transition-all ease-linear`}
            style={{
              width: '100%',
              animation: `shrink ${toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}

      {/* Icon */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full ${styles.iconBg} flex items-center justify-center ${styles.icon}`}>{getIcon()}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {toast.title && <h4 className="text-sm font-semibold mb-1 leading-tight">{toast.title}</h4>}
        <p className="text-sm leading-relaxed">{toast.message}</p>
      </div>

      {/* Close button */}
      <button
        onClick={handleRemove}
        className={`flex-shrink-0 w-6 h-6 rounded-full ${styles.iconBg} flex items-center justify-center ${styles.icon} hover:opacity-70 transition-opacity`}
        aria-label="Close notification"
      >
        <X size={14} />
      </button>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
};

const Toaster = ({ toasts = [], onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
};

export default Toaster;
