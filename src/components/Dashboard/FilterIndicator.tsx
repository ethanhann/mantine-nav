'use client';

import type { ReactNode } from 'react';

export interface ActiveFilter {
  key: string;
  label: string;
  value: string;
}

export interface FilterIndicatorProps {
  dateRange?: { start: Date; end: Date };
  datePreset?: string;
  filters?: ActiveFilter[];
  onFilterRemove?: (key: string) => void;
  maxVisible?: number;
  formatDate?: (date: Date) => string;
}

function defaultFormatDate(d: Date): string {
  return d.toLocaleDateString();
}

export function FilterIndicator({
  dateRange,
  datePreset,
  filters = [],
  onFilterRemove,
  maxVisible = 3,
  formatDate = defaultFormatDate,
}: FilterIndicatorProps) {
  const visibleFilters = filters.slice(0, maxVisible);
  const hiddenCount = Math.max(0, filters.length - maxVisible);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8em' }} role="status" aria-label="Active filters">
      {dateRange && (
        <span>
          {datePreset ?? `${formatDate(dateRange.start)} – ${formatDate(dateRange.end)}`}
        </span>
      )}
      {visibleFilters.map((f) => (
        <span key={f.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 6px', borderRadius: 4, backgroundColor: 'var(--nav-surface-light)' }}>
          {f.label}: {f.value}
          {onFilterRemove && (
            <button type="button" onClick={() => onFilterRemove(f.key)} aria-label={`Remove ${f.label} filter`} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: '0.9em' }}>✕</button>
          )}
        </span>
      ))}
      {hiddenCount > 0 && <span>+{hiddenCount} more</span>}
    </div>
  );
}
