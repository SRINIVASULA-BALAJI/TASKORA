// src/components/common/Avatar.tsx
import React from 'react';
import { User } from '../../types';

interface AvatarProps {
  user?: Partial<User> | null;
  name?: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'away';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  user,
  name,
  avatarUrl,
  size = 'md',
  showStatus = false,
  status,
  className = ''
}) => {
  const displayName = name || user?.name || 'User';
  const url = avatarUrl || user?.avatar;
  const userStatus = status || user?.status || 'offline';

  const initials = displayName
    .split(' ')
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
    xl: 'w-14 h-14 text-base'
  }[size];

  const statusDotSizes = {
    xs: 'w-1.5 h-1.5 -bottom-0.5 -right-0.5',
    sm: 'w-2 h-2 bottom-0 right-0',
    md: 'w-2.5 h-2.5 bottom-0 right-0 ring-2 ring-[#0c0d13]',
    lg: 'w-3 h-3 bottom-0.5 right-0.5 ring-2 ring-[#0c0d13]',
    xl: 'w-3.5 h-3.5 bottom-1 right-1 ring-2 ring-[#0c0d13]'
  }[size];

  const statusColors = {
    online: 'bg-emerald-500',
    away: 'bg-amber-500',
    offline: 'bg-slate-500'
  }[userStatus];

  return (
    <div className={`relative inline-block select-none shrink-0 ${className}`}>
      {url ? (
        <img
          src={url}
          alt={displayName}
          className={`${sizeClasses} rounded-full object-cover border border-white/10 ring-1 ring-white/5 bg-[#141724]`}
          onError={e => {
            // fallback to initials if image fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      ) : (
        <div
          className={`${sizeClasses} rounded-full bg-gradient-to-br from-[#24293e] to-[#121420] text-slate-200 font-semibold flex items-center justify-center border border-white/10 ring-1 ring-white/5`}
        >
          {initials}
        </div>
      )}

      {showStatus && (
        <span
          className={`absolute rounded-full ${statusDotSizes} ${statusColors}`}
          title={`Status: ${userStatus}`}
        />
      )}
    </div>
  );
};

interface AvatarGroupProps {
  users: (Partial<User> | undefined)[];
  max?: number;
  size?: 'xs' | 'sm' | 'md';
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({ users, max = 3, size = 'sm' }) => {
  const validUsers = users.filter(Boolean) as Partial<User>[];
  const visible = validUsers.slice(0, max);
  const remaining = validUsers.length - max;

  return (
    <div className="flex items-center -space-x-2 overflow-hidden">
      {visible.map((u, i) => (
        <Avatar key={u.id || i} user={u} size={size} className="ring-2 ring-[#0b0c12]" />
      ))}
      {remaining > 0 && (
        <div
          className={`relative z-10 rounded-full bg-[#1b1f30] text-slate-300 font-semibold flex items-center justify-center border border-white/10 ring-2 ring-[#0b0c12] ${
            size === 'xs' ? 'w-6 h-6 text-[9px]' : size === 'sm' ? 'w-7 h-7 text-[10px]' : 'w-9 h-9 text-xs'
          }`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};
