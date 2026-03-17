'use client';

import { useState, type ReactNode } from 'react';

export interface Notification {
  id: string;
  title: string;
  description?: string;
  read?: boolean;
  timestamp?: Date;
  icon?: ReactNode;
}

export interface NotificationBellProps {
  count?: number;
  maxCount?: number;
  notifications?: Notification[];
  onRead?: (id: string) => void;
  onReadAll?: () => void;
  onClick?: () => void;
}

export function NotificationBell({
  count = 0,
  maxCount = 99,
  notifications = [],
  onRead,
  onReadAll,
  onClick,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const displayCount = count > maxCount ? `${maxCount}+` : count;

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => {
          onClick?.();
          setIsOpen(!isOpen);
        }}
        aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
        style={{ border: 'none', background: 'none', cursor: 'pointer', position: 'relative', padding: 4 }}
      >
        🔔
        {count > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -2,
              insetInlineEnd: -2,
              backgroundColor: '#ef4444',
              color: 'white',
              borderRadius: '50%',
              minWidth: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.65em',
              fontWeight: 700,
            }}
            aria-hidden="true"
          >
            {displayCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div role="dialog" aria-label="Notifications">
          {onReadAll && notifications.some((n) => !n.read) && (
            <button type="button" onClick={onReadAll}>Mark all as read</button>
          )}
          {notifications.length === 0 && <p>No notifications</p>}
          {notifications.map((n) => (
            <div key={n.id} data-read={n.read || undefined}>
              <button type="button" onClick={() => onRead?.(n.id)}>
                {n.icon} <strong>{n.title}</strong>
                {n.description && <span>{n.description}</span>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
