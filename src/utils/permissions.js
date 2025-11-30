/**
 * Core permission checking utilities
 */

/**
 * Check if user has a specific permission
 * @param {string[]} userPermissions - Array of user's permission codes
 * @param {string} requiredPermission - Required permission code
 * @returns {boolean} - True if user has permission
 */
export const checkPermission = (userPermissions, requiredPermission) => {
  if (!userPermissions || !Array.isArray(userPermissions)) {
    return false;
  }
  return userPermissions.includes(requiredPermission);
};

/**
 * Check if user has any of the specified permissions
 * @param {string[]} userPermissions - Array of user's permission codes
 * @param {string|string[]} requiredPermissions - Required permission code(s)
 * @returns {boolean} - True if user has at least one permission
 */
export const checkAnyPermission = (userPermissions, requiredPermissions) => {
  if (!Array.isArray(requiredPermissions)) {
    return checkPermission(userPermissions, requiredPermissions);
  }
  return requiredPermissions.some(permission => checkPermission(userPermissions, permission));
};

/**
 * Check if user has all of the specified permissions
 * @param {string[]} userPermissions - Array of user's permission codes
 * @param {string|string[]} requiredPermissions - Required permission code(s)
 * @returns {boolean} - True if user has all permissions
 */
export const checkAllPermissions = (userPermissions, requiredPermissions) => {
  if (!Array.isArray(requiredPermissions)) {
    return checkPermission(userPermissions, requiredPermissions);
  }
  return requiredPermissions.every(permission => checkPermission(userPermissions, permission));
};
