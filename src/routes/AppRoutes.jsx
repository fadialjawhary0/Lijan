import { Routes, Route } from 'react-router-dom';

import PublicRoutes from './PublicRoutes';
import PrivateRoutes from './PrivateRoutes';
import PrivateRoute from './PrivateRoute';
import MainLayout from '../components/layout/MainLayout';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      {PublicRoutes}

      {/* Private Routes */}
      {PrivateRoutes?.map(route => (
        <Route
          key={route?.key}
          path={route?.props?.path}
          element={
            <PrivateRoute>
              <MainLayout>{route?.props?.element}</MainLayout>
            </PrivateRoute>
          }
        />
      ))}
    </Routes>
  );
};

export default AppRoutes;
