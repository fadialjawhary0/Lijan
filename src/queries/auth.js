import { useMutation } from '@tanstack/react-query';
import { API } from '../services/API';

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: credentials => API.post('/auth-service/auth/login', credentials),
  });
};

export const useVerifyEmailMutation = () => {
  return useMutation({
    mutationFn: token => API.post('/auth-service/User/verify-email', { token }),
  });
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: data => API.post('/auth-service/User/change-password', data),
  });
};
