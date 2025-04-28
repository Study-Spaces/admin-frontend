import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

// Extend event.locals
declare module '@sveltejs/kit' {
  interface Locals {
    user?: Record<string, any>;
    isAdmin?: boolean;
  }
}

export const handle: Handle = async ({ event, resolve }) => {
  const publicRoutes = ['/login', '/unauthorized'];

  const url = new URL(event.request.url);
  const path = url.pathname;

  // Always try to fetch current user session
  let isAuthenticated = false;

  try {
    const res = await fetch('http://localhost:3001/me', {
      headers: {
        cookie: event.request.headers.get('cookie') || ''
      },
      credentials: 'include'
    });

    if (res.ok) {
      const data = await res.json();
      event.locals.user = data.user;
      event.locals.isAdmin = data.isAdmin;
      isAuthenticated = true;
    }
  } catch (err) {
    console.error('Auth service error:', err);
  }

  // If it's not a public route and user not authenticated -> redirect
  if (!publicRoutes.some((r) => path.startsWith(r)) && !isAuthenticated) {
    throw redirect(303, '/login');
  }

  return resolve(event);
};
