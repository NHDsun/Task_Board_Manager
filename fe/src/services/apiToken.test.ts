import { describe, it, expect } from 'vitest';

function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64;

    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);
    if (!payload.exp) return true;

    const bufferSeconds = 15;
    return payload.exp * 1000 < Date.now() + bufferSeconds * 1000;
  } catch {
    return true;
  }
}

function createMockJwt(expSecondsFromNow: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + expSecondsFromNow;
  const payload = btoa(JSON.stringify({ sub: 'user-1', email: 'dev@solaris.io', exp }));
  const signature = btoa('mock-signature');
  return header + '.' + payload + '.' + signature;
}

describe('JWT Token Expiration & Parsing Logic', () => {
  it('should return true for null or empty token', () => {
    expect(isTokenExpired(null)).toBe(true);
    expect(isTokenExpired('')).toBe(true);
  });

  it('should return true for invalid or malformed tokens', () => {
    expect(isTokenExpired('invalid-token')).toBe(true);
    expect(isTokenExpired('header.payload')).toBe(true);
    expect(isTokenExpired('a.b.c')).toBe(true);
  });

  it('should return false for valid token with long expiration', () => {
    const token = createMockJwt(3600); // Expires in 1 hour
    expect(isTokenExpired(token)).toBe(false);
  });

  it('should return true for expired token in the past', () => {
    const token = createMockJwt(-60); // Expired 1 minute ago
    expect(isTokenExpired(token)).toBe(true);
  });

  it('should return true for token expiring within the 15-second buffer window (pre-emptive refresh)', () => {
    const token = createMockJwt(10); // Expires in 10s (within 15s buffer)
    expect(isTokenExpired(token)).toBe(true);
  });
});
