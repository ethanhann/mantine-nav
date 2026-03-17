'use client';

import { useState } from 'react';

export interface Dashboard {
  id: string;
  name: string;
  group?: string;
}

export interface DashboardSwitcherProps {
  dashboards: Dashboard[];
  activeDashboard: Dashboard;
  onSwitch: (dashboard: Dashboard) => void;
  variant?: 'dropdown' | 'sidebar-list';
  searchable?: boolean;
  groupBy?: string;
}

export function DashboardSwitcher({
  dashboards,
  activeDashboard,
  onSwitch,
  variant = 'dropdown',
  searchable = true,
}: DashboardSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = search
    ? dashboards.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()))
    : dashboards;

  if (variant === 'sidebar-list') {
    return (
      <div role="listbox" aria-label="Dashboards">
        {searchable && (
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search dashboards..." aria-label="Search dashboards" />
        )}
        {filtered.map((d) => (
          <button
            key={d.id}
            type="button"
            role="option"
            aria-selected={d.id === activeDashboard.id}
            onClick={() => onSwitch(d)}
          >
            {d.name}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div>
      <button type="button" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} aria-haspopup="listbox">
        {activeDashboard.name}
      </button>
      {isOpen && (
        <div role="listbox">
          {searchable && (
            <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." aria-label="Search dashboards" />
          )}
          {filtered.map((d) => (
            <button key={d.id} type="button" role="option" aria-selected={d.id === activeDashboard.id} onClick={() => { onSwitch(d); setIsOpen(false); }}>
              {d.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
