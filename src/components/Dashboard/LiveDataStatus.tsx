'use client';

export type ConnectionStatus = 'connected' | 'stale' | 'error' | 'disconnected';

export interface LiveDataStatusProps {
  status: ConnectionStatus;
  lastUpdated?: Date;
  variant?: 'dot' | 'badge' | 'detailed';
  animate?: boolean;
}

const STATUS_COLORS: Record<ConnectionStatus, string> = {
  connected: 'var(--nav-accent-success)',
  stale: 'var(--nav-accent-warning)',
  error: 'var(--nav-accent-error)',
  disconnected: 'var(--nav-accent-muted)',
};

const STATUS_LABELS: Record<ConnectionStatus, string> = {
  connected: 'Connected',
  stale: 'Stale',
  error: 'Error',
  disconnected: 'Disconnected',
};

export function LiveDataStatus({
  status,
  lastUpdated,
  variant = 'dot',
  animate = true,
}: LiveDataStatusProps) {
  const color = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];

  if (variant === 'dot') {
    return (
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          backgroundColor: color,
          display: 'inline-block',
          animation: animate && status === 'connected' ? 'pulse 2s infinite' : undefined,
        }}
        role="status"
        aria-label={label}
      />
    );
  }

  if (variant === 'badge') {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 8px',
          borderRadius: 12,
          backgroundColor: `${color}20`,
          color,
          fontSize: '0.75em',
          fontWeight: 600,
        }}
        role="status"
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color }} />
        {label}
      </span>
    );
  }

  // detailed
  return (
    <div role="status" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8em' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: color }} />
      <span>{label}</span>
      {lastUpdated && (
        <span style={{ opacity: 0.6 }}>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
