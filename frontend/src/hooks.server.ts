import { auth } from '$lib/server/auth';
import { error, redirect } from '@sveltejs/kit';
import { hasAUserRegistered, type User } from '$lib/server/db/user';
import { urlStartsWith } from '$lib/utils';
import { hasAtLeastOnePermission, PERMISSIONS as P } from '@shared/roles';

const PROTECTED_ROUTES = ['/app', '/api'];

const routesPermissions: { [key: string]: string | string[] } = {
  '/': P.ANY,
  '/log-in': P.ANY,
  '/register': P.ANY,
  '/changelog': P.ANY,
  '/app': P.ANY,
  '/app/logs': [P.READ_LOG, P.READ_SERVER],
  '/app/logs/details': [P.READ_LOG, P.DELETE_LOG],
  '/app/logs/querying': [P.READ_LOG],
  '/app/logs/search': P.READ_LOG,
  '/app/dashboards': P.READ_DASHBOARD,
  '/app/dashboards/*': P.READ_DASHBOARD,
  '/app/servers': [P.READ_SERVER, P.CREATE_SERVER],
  '/app/servers/*': [P.READ_SERVER, P.UPDATE_SERVER, P.DELETE_SERVER],
  '/app/log-out': P.ANY,
  '/app/account/settings': P.ANY,
  '/api/logs/search': P.READ_LOG,
  '/api/logs/query': P.READ_LOG,
  '/api/dashboard/save': P.UPDATE_DASHBOARD
};

const canUserNavigateHere = (pathname: string, user: User | undefined): boolean => {
  const isPathMatching = (path: string, pathExpression: string): boolean => {
    const pathParts = path.split('/');
    const pathExpressionParts = pathExpression.split('/');
    if (pathParts.length !== pathExpressionParts.length) {
      return false;
    }

    for (let i = 0; i < pathParts.length; i++) {
      if (pathExpressionParts[i] !== '*' && pathParts[i] !== pathExpressionParts[i]) {
        return false;
      }
    }

    return true;
  };

  // Path is in the list of protected routes and has permission set to ANY
  if (routesPermissions[pathname] === P.ANY) {
    return true;
  }

  // User is not logged in
  if (!user) {
    return false;
  }

  // Check if user has the required permissions to access the route
  for (const route in routesPermissions) {
    if (isPathMatching(pathname, route)) {
      if (routesPermissions[route] === P.ANY) {
        return true;
      }
      if (Array.isArray(routesPermissions[route])) {
        return hasAtLeastOnePermission(user?.role, ...routesPermissions[route]);
      }

      if (typeof routesPermissions[route] === 'string') {
        return hasAtLeastOnePermission(user?.role, routesPermissions[route]);
      }
    }
  }

  return false;
};

export const handle = async ({ event, resolve }) => {
  const { url, cookies, locals } = event;
  const token = cookies.get('token') || false;

  // Check if the user is logged in, and if so, retrieve the user data
  if (token) {
    try {
      const user = await auth(token);
      if (user) {
        locals.user = user;
        locals.token = token;
      } else {
        cookies.delete('token', { path: '/' });
        delete locals.user;
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      delete locals.user;
      cookies.delete('token', { path: '/' });
    }
  }

  // Redirect to login page if user is not logged in and trying to access a protected route
  if (!locals.user && urlStartsWith(url.pathname, PROTECTED_ROUTES)) {
    throw redirect(307, '/log-in');
  }

  // Check if user has sufficient permissions to access the requested route
  if (!canUserNavigateHere(url.pathname, locals.user)) {
    throw error(403, 'Forbidden');
  }

  const hasARegisteredUser = await hasAUserRegistered();
  locals.hasARegisteredUser = hasARegisteredUser;
  if (urlStartsWith(url.pathname, '/register')) {
    if (locals.hasARegisteredUser && !locals?.user) {
      throw redirect(307, '/log-in');
    } else {
      if (hasARegisteredUser) {
        locals.hasARegisteredUser = hasARegisteredUser;
        throw redirect(307, '/log-in');
      }
    }
  }

  // User is logged in and trying to access the login page
  if (locals.user && urlStartsWith(url.pathname, '/log-in')) {
    throw redirect(307, '/app/logs');
  }

  const response = await resolve(event);
  response.headers.set(
    'X-Robots-Tag',
    urlStartsWith(url.pathname, PROTECTED_ROUTES) ? 'noindex, nofollow' : 'index, follow'
  );

  return response;
};
