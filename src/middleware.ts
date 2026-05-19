import { defineMiddleware } from 'astro:middleware';
import { isAuthenticated } from './lib/auth';

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  if (pathname === '/admin/dashboard' || (pathname.startsWith('/api/') && pathname !== '/api/login')) {
    if (!isAuthenticated(context.request)) {
      if (pathname.startsWith('/api/')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return context.redirect('/admin');
    }
  }

  return next();
});
