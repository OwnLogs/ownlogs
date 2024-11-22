import { auth } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import { hasAUserRegistered } from '$lib/server/db/user';
import { urlStartsWith } from '$lib/utils';

const PROTECTED_ROUTES = ['/app', '/api'];

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

  // User is not logged in and trying to access a protected route
  if (urlStartsWith(url.pathname, PROTECTED_ROUTES) && !locals.user) {
    delete locals.user;
    locals.token = undefined;
    cookies.delete('token', { path: '/' });
    throw redirect(307, '/');
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
