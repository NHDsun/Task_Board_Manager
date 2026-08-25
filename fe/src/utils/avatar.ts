export const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
export const DEFAULT_COVER = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80';

export const getAvatarUrl = (user?: { avatar?: string; avatarUrl?: string } | null): string => {
  if (!user) return DEFAULT_AVATAR;
  if (user.avatar && typeof user.avatar === 'string' && user.avatar.trim() !== '') {
    return user.avatar;
  }
  if (user.avatarUrl && typeof user.avatarUrl === 'string' && user.avatarUrl.trim() !== '') {
    return user.avatarUrl;
  }
  return DEFAULT_AVATAR;
};
