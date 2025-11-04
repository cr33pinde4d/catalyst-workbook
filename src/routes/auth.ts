import { Hono } from 'hono';
import type { Bindings, Variables, User } from '../types';
import { hashPassword, verifyPassword, generateToken } from '../lib/auth';

const auth = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// Register new user
auth.post('/register', async (c) => {
  try {
    const { email, name, password } = await c.req.json();

    if (!email || !name || !password) {
      return c.json({ error: 'Email, name, and password are required' }, 400);
    }

    // Check if user already exists
    const existing = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    )
      .bind(email)
      .first();

    if (existing) {
      return c.json({ error: 'User already exists' }, 409);
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const result = await c.env.DB.prepare(
      'INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?) RETURNING id, email, name, created_at'
    )
      .bind(email, name, passwordHash)
      .first<User>();

    if (!result) {
      return c.json({ error: 'Failed to create user' }, 500);
    }

    const token = generateToken(result.id, result.email);

    return c.json({
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        created_at: result.created_at
      },
      token
    }, 201);
  } catch (error) {
    console.error('Register error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Login
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Fetch user with password hash
    const user = await c.env.DB.prepare(
      'SELECT id, email, name, password_hash, created_at FROM users WHERE email = ?'
    )
      .bind(email)
      .first<User & { password_hash: string }>();

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Update last login
    await c.env.DB.prepare(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?'
    )
      .bind(user.id)
      .run();

    const token = generateToken(user.id, user.email);

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get current user
auth.get('/me', async (c) => {
  const user = c.get('user');
  return c.json({ user });
});

export default auth;
