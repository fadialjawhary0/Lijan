import { Route } from 'react-router-dom';
import LoginPage from '../pages/Login/LoginPage';
// import VerifyEmailPage from '../pages/VerifyEmail/VerifyEmailPage';
// import ChangePasswordPage from '../pages/ChangePassword/ChangePasswordPage';

export default [
  <Route key="login" path="/login" element={<LoginPage />} />,
  // <Route key="verify-email" path="/verify-email" element={<VerifyEmailPage />} />,
  // <Route key="change-password" path="/change-password" element={<ChangePasswordPage />} />,
];
