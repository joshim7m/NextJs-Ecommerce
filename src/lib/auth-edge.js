import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
const SECRET = new TextEncoder().encode(JWT_SECRET || 'dev-secret-change-in-production');
const COOKIE_NAME = 'admin_session';

function assertSecret() {
  if (!JWT_SECRET && process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
    throw new Error('JWT_SECRET environment variable must be set in production');
  }
}

export async function verifyToken(token) {
  assertSecret();
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
