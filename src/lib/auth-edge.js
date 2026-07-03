import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-in-production');
const COOKIE_NAME = 'admin_session';

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}

export function getTokenFromCookies(request) {
  return request.cookies.get(COOKIE_NAME)?.value || null;
}

export function isAdminRoute(pathname) {
  return pathname.startsWith('/admin');
}

export function isLoginPage(pathname) {
  return pathname === '/admin/login';
}

export function isAdminApiRoute(pathname) {
  return pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/login');
}

export { COOKIE_NAME };
