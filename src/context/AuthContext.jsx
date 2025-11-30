import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGetUserByIdQuery } from '../queries/user';
// import { useGetUserRolePermissionQuery } from '../queries/userRolePermission';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    const storedUser = localStorage.getItem('userData');
    const storedPermissions = localStorage.getItem('userPermissions');

    if (token && storedUserId) {
      setIsAuthenticated(true);
      setUserId(storedUserId);

      // Restore user data from localStorage if available
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          // restore permissions if present
          if (storedPermissions) {
            const parsedPerms = JSON.parse(storedPermissions);
            setPermissions(parsedPerms);
          }
          setIsLoading(false);

          // Pre-populate React Query cache
          queryClient.setQueryData(['user', storedUserId], { data: userData });
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          localStorage.removeItem('userData');
          localStorage.removeItem('userPermissions');
        }
      }
    } else {
      setIsLoading(false);
    }
  }, [queryClient]);

  // Fetch user details when userId is available (only if not already cached)
  const { data: userData, isLoading: userLoading } = useGetUserByIdQuery(userId, {
    enabled: !!userId && !user, // Only fetch if we don't have user data
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    cacheTime: 1000 * 60 * 60 * 24 * 7, // Keep in cache for 7 days
  });

  // Extract roleId from user data
  const roleId = user?.roleId;

  // Fetch user role permissions after we know the userId and roleId
  // const { data: userRolePermData } = useGetUserRolePermissionQuery(userId, roleId, {
  //   enabled: !!userId && !!roleId && permissions.length === 0,
  //   staleTime: 1000 * 60 * 60 * 24,
  //   cacheTime: 1000 * 60 * 60 * 24 * 7,
  //   refetchOnWindowFocus: false,
  // });

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userData');
    localStorage.removeItem('userPermissions');
    localStorage.removeItem('isLoggedIn');

    // Clear React Query cache
    queryClient.clear();

    setIsAuthenticated(false);
    setUserId(null);
    setUser(null);
    setPermissions([]);
  }, [queryClient]);

  // Update user data when fetched
  useEffect(() => {
    if (userData?.data) {
      setUser(userData.data);
      setIsLoading(false);

      // Store user data in localStorage for persistence
      localStorage.setItem('userData', JSON.stringify(userData?.data));

      // Update React Query cache
      queryClient.setQueryData(['user', userId], userData);
    } else if (userData && !userData.data && userId && !user) {
      // User not found or error - only logout if we have a userId and no cached user
      logout();
    }
  }, [userData, userId, user, logout, queryClient]);

  // Update permissions when fetched
  // useEffect(() => {
  //   if (userRolePermData?.data) {
  //     const codes = (userRolePermData.data || [])
  //       .flatMap(urp => urp.permissions || [])
  //       .map(p => p.code)
  //       .filter(Boolean);
  //     const unique = Array.from(new Set(codes));
  //     setPermissions(unique);
  //     localStorage.setItem('userPermissions', JSON.stringify(unique));
  //   }
  // }, [userRolePermData]);

  const login = useCallback(loginResponse => {
    const { userId: newUserId, accessToken, refreshToken } = loginResponse.data;

    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userId', newUserId);

    setIsAuthenticated(true);
    setUserId(newUserId);
  }, []);

  const value = {
    isAuthenticated,
    user,
    isAdmin: user?.englishRoleName === 'Admin',
    permissions,
    isLoading: isLoading || (userLoading && !user),
    login,
    logout,
    userId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
