import { describe, it, expect } from 'vitest';
import { getAvatarUrl, DEFAULT_AVATAR } from './avatar';

describe('getAvatarUrl Utility', () => {
  it('should return DEFAULT_AVATAR if user is null or undefined', () => {
    expect(getAvatarUrl(null)).toBe(DEFAULT_AVATAR);
    expect(getAvatarUrl(undefined)).toBe(DEFAULT_AVATAR);
  });

  it('should return user.avatar if present', () => {
    const user = { avatar: 'https://example.com/custom-avatar.png' };
    expect(getAvatarUrl(user)).toBe('https://example.com/custom-avatar.png');
  });

  it('should return user.avatarUrl if avatar is missing', () => {
    const user = { avatarUrl: 'https://example.com/avatar-url.png' };
    expect(getAvatarUrl(user)).toBe('https://example.com/avatar-url.png');
  });

  it('should fallback to DEFAULT_AVATAR if both avatar and avatarUrl are empty strings', () => {
    const user = { avatar: '   ', avatarUrl: '' };
    expect(getAvatarUrl(user)).toBe(DEFAULT_AVATAR);
  });
});
