import { Context, Next } from 'hono';
import type { Bindings, Variables, User } from '../types';
import { verifyToken } from '../lib/auth';

export async function authMiddleware(
  c: Context<{ Bindings: Bindings; Variables: Variables }>,
  next: Next
) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);

  if (!payload) {
    return c.json({ error: 'Invalid or expired token' }, 401);
  }

  // Fetch user from database
  const user = await c.env.DB.prepare(
    'SELECT id, email, name, created_at, last_login FROM users WHERE id = ?'
  )
    .bind(payload.userId)
    .first<User>();

  if (!user) {
    return c.json({ error: 'User not found' }, 401);
  }

  c.set('user', user);
  c.set('userId', user.id);
  await next();
}
