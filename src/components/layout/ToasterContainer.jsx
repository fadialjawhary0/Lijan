import React from 'react';
import { useToaster } from '../../context/ToasterContext';
import Toaster from '../ui/Toaster';

const ToasterContainer = () => {
  const { toasts, removeToast } = useToaster();

  return <Toaster toasts={toasts} onRemove={removeToast} />;
};

export default ToasterContainer;
