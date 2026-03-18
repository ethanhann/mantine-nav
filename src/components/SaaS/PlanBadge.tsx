'use client';

import type { ReactNode } from 'react';

export interface PlanBadgeProps {
  plan: string;
  color?: string;
  variant?: 'badge' | 'card' | 'inline';
  showUpgrade?: boolean;
  onUpgrade?: () => void;
  upgradeLabel?: string;
  icon?: ReactNode;
}

export function PlanBadge({
  plan,
  color = '#6366f1',
  variant = 'badge',
  showUpgrade = false,
  onUpgrade,
  upgradeLabel = 'Upgrade',
  icon,
}: PlanBadgeProps) {
  if (variant === 'inline') {
    return (
      <span style={{ fontSize: '0.75em', color, fontWeight: 600 }} role="status">
        {icon} {plan}
        {showUpgrade && (
          <button type="button" onClick={onUpgrade} style={{ marginInlineStart: 4, cursor: 'pointer', border: 'none', background: 'none', color, textDecoration: 'underline', fontSize: 'inherit' }}>
            {upgradeLabel}
          </button>
        )}
      </span>
    );
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: variant === 'card' ? '8px 12px' : '2px 8px',
        borderRadius: 4,
        backgroundColor: `${color}15`,
        color,
        fontWeight: 600,
        fontSize: variant === 'card' ? '0.875em' : '0.75em',
      }}
      role="status"
    >
      {icon}
      {plan}
      {showUpgrade && (
        <button type="button" onClick={onUpgrade} style={{ cursor: 'pointer', border: 'none', background: color, color: 'white', borderRadius: 3, padding: '2px 6px', fontSize: '0.85em' }}>
          {upgradeLabel}
        </button>
      )}
    </div>
  );
}
