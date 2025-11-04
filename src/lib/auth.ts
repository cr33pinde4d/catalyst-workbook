import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { AuthPayload } from '../types';

const JWT_SECRET = 'catalyst-jwt-secret-change-in-production';
const JWT_EXPIRY = '7d'; // 7 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: number, email: string): string {
  const payload: Omit<AuthPayload, 'iat' | 'exp'> = { userId, email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export function getSessionExpiry(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7); // 7 days
  return date.toISOString();
}
