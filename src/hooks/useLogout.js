/**
 * Custom hook for handling user logout
 * @returns {Function} Logout function
 */

import { IISPATH } from '../constants';

export const useLogout = () => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = `${IISPATH}/login`;
  };

  return handleLogout;
};
