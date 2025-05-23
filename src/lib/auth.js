import { hash, compare } from 'bcryptjs';
import { signOut } from 'next-auth/react';

export async function hashPassword(password) {
  return hash(password, 12);
}

export async function verifyPassword(password, hashedPassword) {
  return compare(password, hashedPassword);
}

export function logout() {
  signOut({ callbackUrl: '/login' });
}