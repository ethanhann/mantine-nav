'use client';

import { type ReactNode } from 'react';

export interface InviteTeamCTAProps {
  variant?: 'button' | 'card' | 'inline';
  onClick: () => void;
  label?: string;
  description?: string;
  icon?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
}

export function InviteTeamCTA({
  variant = 'button',
  onClick,
  label = 'Invite teammates',
  description,
  icon = '👥',
  dismissible = false,
  onDismiss,
}: InviteTeamCTAProps) {
  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={onClick}
        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: '1px dashed #d1d5db', borderRadius: 6, background: 'none', cursor: 'pointer', fontSize: '0.875em' }}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </button>
    );
  }

  if (variant === 'card') {
    return (
      <div style={{ padding: 12, borderRadius: 8, border: '1px solid #e5e7eb', position: 'relative' }}>
        {dismissible && (
          <button type="button" onClick={onDismiss} aria-label="Dismiss" style={{ position: 'absolute', top: 8, insetInlineEnd: 8, border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
        )}
        <div style={{ fontSize: '0.875em', fontWeight: 600, marginBottom: 4 }}>{icon} {label}</div>
        {description && <p style={{ fontSize: '0.75em', opacity: 0.7, margin: '4px 0 8px' }}>{description}</p>}
        <button type="button" onClick={onClick} style={{ padding: '4px 12px', borderRadius: 4, border: '1px solid #6366f1', background: '#6366f1', color: 'white', cursor: 'pointer', fontSize: '0.8em' }}>
          Invite
        </button>
      </div>
    );
  }

  // inline
  return (
    <button type="button" onClick={onClick} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6366f1', fontSize: '0.8em', textDecoration: 'underline' }}>
      {icon} {label}
    </button>
  );
}
