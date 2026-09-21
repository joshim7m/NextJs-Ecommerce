import { verifyToken, getTokenFromCookies } from '@/src/lib/auth-edge';
import prisma from '@/src/lib/prisma';

export async function requireAdmin(request) {
  const token = getTokenFromCookies(request);
  if (!token) return null;
  const payload = await verifyToken(token);
  if (payload?.role !== 'admin') return null;

  // The JWT `id` may not exist in the current DB (e.g., after a reseed).
  // Resolve the user row from the DB (by id, then email) so job records either
  // link a real user or store null — never a dangling userId that would violate
  // the foreign key constraint.
  let userId = null;
  if (payload.id) {
    const byId = await prisma.user.findUnique({ where: { id: String(payload.id) }, select: { id: true } });
    if (byId) userId = byId.id;
  }
  if (!userId && payload.email) {
    const byEmail = await prisma.user.findUnique({ where: { email: String(payload.email) }, select: { id: true } });
    if (byEmail) userId = byEmail.id;
  }

  return { ...payload, userId };
}
