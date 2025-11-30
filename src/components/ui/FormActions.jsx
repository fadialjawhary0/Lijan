import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { getDefaultCancelRoute } from '../../utils/routeUtils';

/**
 * Shared FormActions component for all forms
 * Handles cancel and submit buttons with proper navigation
 *
 * @param {Object} props
 * @param {boolean} props.isSubmitting - Whether the form is currently submitting
 * @param {boolean} props.isEditMode - Whether the form is in edit mode (affects button text)
 * @param {Function} props.onCancel - Optional custom cancel handler
 * @param {string} props.cancelRoute - Optional custom route for cancel (defaults to home)
 * @param {boolean} props.hideCancel - Whether to hide the cancel button
 * @param {string} props.submitTextKey - Translation key for submit button (defaults to 'create' or 'update')
 * @param {string} props.cancelTextKey - Translation key for cancel button (defaults to 'cancel')
 * @param {string} props.translationNamespace - Translation namespace for submit button (defaults to 'committeeForm')
 */
const FormActions = ({
  isSubmitting = false,
  isEditMode = false,
  onCancel,
  cancelRoute,
  hideCancel = false,
  submitTextKey,
  cancelTextKey = 'cancel',
  translationNamespace = 'committeeForm',
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const { t: tForm } = useTranslation(translationNamespace);
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  // Determine cancel route
  const getCancelRoute = () => {
    if (cancelRoute) return cancelRoute;
    return getDefaultCancelRoute();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(getCancelRoute());
    }
  };

  // Determine submit button text
  const getSubmitText = () => {
    if (submitTextKey) return tForm(submitTextKey);
    return tForm(isEditMode ? 'update' : 'create');
  };

  return (
    <div className="flex justify-end gap-3 pt-6 border-t border-border p-3 m-3 rounded-xl transition-all duration-300">
      {!hideCancel && (
        <button
          type="button"
          onClick={handleCancel}
          className="px-6 py-2 cursor-pointer border bg-destructive border-border rounded-lg text-white hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {t(cancelTextKey)}
        </button>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-2 cursor-pointer bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting && <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        {isSubmitting ? t('loading') : getSubmitText()}
        {!isSubmitting && (isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />)}
      </button>
    </div>
  );
};

export default FormActions;
