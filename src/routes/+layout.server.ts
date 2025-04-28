import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  const publicRoutes = ['/login', '/unauthorized'];

  const currentPath = url.pathname;

  if (!locals.user && !publicRoutes.includes(currentPath)) {
    throw redirect(303, '/login');
  }

  return {
    user: locals.user,
    isAdmin: locals.isAdmin
  };
};
