import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { checkPermission } from '../utils/permissions';
import UnauthorizedContent from '../components/ui/UnauthorizedContent';

export const PermissionProtectedRoute = ({
  permission,
  children,
  fallback = <div className="flex items-center justify-center min-h-screen">Loading...</div>,
}) => {
  const { permissions: userPermissions, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return fallback;
  }

  if (!checkPermission(userPermissions, permission)) {
    localStorage.setItem('redirectAfterLogin', location.pathname);
    return <UnauthorizedContent />;
  }

  return children;
};

export default PermissionProtectedRoute;
