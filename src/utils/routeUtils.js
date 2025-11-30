import { PRIVATE_ROUTES } from '../constants/privateRoutes.const';

export const getRouteByKey = routeKey => {
  const route = PRIVATE_ROUTES.find(r => r.key === routeKey);
  return route?.path || null;
};

export const getRouteByKeyWithParams = (routeKey, params = {}) => {
  const route = PRIVATE_ROUTES.find(r => r.key === routeKey);
  if (!route) return null;

  let path = route.path;
  Object.keys(params).forEach(key => {
    path = path.replace(`:${key}`, params[key]);
  });
  return path;
};

export const getDefaultCancelRoute = () => {
  return getRouteByKey('home') || '/';
};

export const getDefaultSuccessRoute = () => {
  return getRouteByKey('home') || '/';
};
