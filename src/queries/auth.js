import { useMutation } from '@tanstack/react-query';
import { API } from '../services/API';
import { encryptPassword } from '../utils/rsaEncryption';

export const useLoginMutation = () => {
  return useMutation({
    mutationFn: async credentials => {
      const encryptedPassword = await encryptPassword(credentials.password, API.get);

      return API.post('/auth-service/auth/login', {
        username: credentials.username,
        password: encryptedPassword,
      });
    },
  });
};

export const useVerifyEmailMutation = () => {
  return useMutation({
    mutationFn: token => API.post('/auth-service/User/verify-email', { token }),
  });
};

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: async data => {
      const encryptedCurrentPassword = await encryptPassword(data.currentPassword, API.get);
      const encryptedNewPassword = await encryptPassword(data.newPassword, API.get);

      return API.post('/auth-service/User/change-password', {
        userId: data.userId,
        currentPassword: encryptedCurrentPassword,
        newPassword: encryptedNewPassword,
        confirmPassword: encryptedNewPassword,
      });
    },
  });
};
