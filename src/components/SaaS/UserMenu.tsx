'use client';

import { useState, type ReactNode } from 'react';
import type { UserInfo } from '../../types';

export interface UserMenuProps {
  user: UserInfo;
  menuItems?: Array<{ label: string; icon?: ReactNode; href?: string; onClick?: () => void }>;
  showRole?: boolean;
  showEmail?: boolean;
  avatarSize?: number;
}

export function UserMenu({
  user,
  menuItems = [],
  showRole = true,
  showEmail = false,
  avatarSize = 32,
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div role="menu" aria-label="User menu">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        style={{ display: 'flex', alignItems: 'center', gap: 8, border: 'none', background: 'none', cursor: 'pointer' }}
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            width={avatarSize}
            height={avatarSize}
            style={{ borderRadius: '50%' }}
          />
        ) : (
          <span style={{ width: avatarSize, height: avatarSize, borderRadius: '50%', background: 'var(--nav-accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: avatarSize * 0.4 }}>
            {user.name.charAt(0).toUpperCase()}
          </span>
        )}
        <span>
          <span>{user.name}</span>
          {showRole && user.role && <span style={{ opacity: 0.6, fontSize: '0.8em' }}> · {user.role}</span>}
          {showEmail && user.email && <span style={{ display: 'block', opacity: 0.5, fontSize: '0.8em' }}>{user.email}</span>}
        </span>
      </button>
      {isOpen && menuItems.length > 0 && (
        <div role="presentation">
          {menuItems.map((item, i) => (
            <button
              key={i}
              type="button"
              role="menuitem"
              onClick={() => {
                item.onClick?.();
                setIsOpen(false);
              }}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
