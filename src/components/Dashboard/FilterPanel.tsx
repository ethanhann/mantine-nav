'use client';

import { useState, type ReactNode } from 'react';
import { Collapse } from '@mantine/core';

export interface FilterPanelProps {
  children: ReactNode;
  position?: 'left' | 'right';
  opened?: boolean;
  defaultOpened?: boolean;
  onOpenedChange?: (opened: boolean) => void;
  applyMode?: 'instant' | 'manual';
  onApply?: () => void;
  onReset?: () => void;
  width?: number | string;
  collapsible?: boolean;
}

export function FilterPanel({
  children,
  opened: controlledOpened,
  defaultOpened = true,
  onOpenedChange,
  applyMode = 'instant',
  onApply,
  onReset,
  width = 280,
  collapsible = true,
}: FilterPanelProps) {
  const [internalOpened, setInternalOpened] = useState(defaultOpened);
  const opened = controlledOpened ?? internalOpened;

  const toggle = () => {
    const next = !opened;
    if (controlledOpened === undefined) setInternalOpened(next);
    onOpenedChange?.(next);
  };

  return (
    <aside
      aria-label="Filters"
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        borderInlineStart: '1px solid var(--nav-sidebar-border-color)',
      }}
    >
      {collapsible && (
        <button type="button" onClick={toggle} aria-expanded={opened} style={{ width: '100%', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'start', fontWeight: 600, fontSize: '0.875em' }}>
          Filters {opened ? '▾' : '▸'}
        </button>
      )}
      <Collapse in={opened}>
        <div style={{ padding: 12 }}>
          {children}
          {applyMode === 'manual' && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button type="button" onClick={onApply}>Apply</button>
              <button type="button" onClick={onReset}>Reset</button>
            </div>
          )}
        </div>
      </Collapse>
    </aside>
  );
}
