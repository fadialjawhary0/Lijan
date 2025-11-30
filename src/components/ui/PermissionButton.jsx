import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { checkPermission } from '../../utils/permissions';

export const PermissionButton = ({ permission, children, className = '', onClick, disabled = false, ...props }) => {
  const { permissions: userPermissions } = useAuth();

  if (!checkPermission(userPermissions, permission)) return null;

  return children;
};

export default PermissionButton;
