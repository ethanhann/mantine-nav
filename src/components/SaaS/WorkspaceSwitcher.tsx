'use client';

import { useState, type ReactNode } from 'react';
import type { Workspace } from '../../types';

export interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  onSwitch: (workspace: Workspace) => void;
  onCreate?: () => void;
  searchable?: boolean;
  maxVisible?: number;
  renderWorkspace?: (workspace: Workspace, isActive: boolean) => ReactNode;
}

export function WorkspaceSwitcher({
  workspaces,
  activeWorkspace,
  onSwitch,
  onCreate,
  searchable = false,
  maxVisible = 5,
  renderWorkspace,
}: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = searchable && search
    ? workspaces.filter((w) => w.name.toLowerCase().includes(search.toLowerCase()))
    : workspaces;

  const visible = filtered.slice(0, maxVisible);

  return (
    <div role="listbox" aria-label="Workspace switcher">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {renderWorkspace ? renderWorkspace(activeWorkspace, true) : (
          <>
            {activeWorkspace.logo}
            <span>{activeWorkspace.name}</span>
          </>
        )}
      </button>
      {isOpen && (
        <div role="presentation">
          {searchable && (
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workspaces..."
              aria-label="Search workspaces"
            />
          )}
          {visible.map((ws) => (
            <button
              key={ws.id}
              type="button"
              role="option"
              aria-selected={ws.id === activeWorkspace.id}
              onClick={() => {
                onSwitch(ws);
                setIsOpen(false);
              }}
            >
              {renderWorkspace ? renderWorkspace(ws, ws.id === activeWorkspace.id) : ws.name}
            </button>
          ))}
          {onCreate && (
            <button type="button" onClick={onCreate}>
              Create workspace
            </button>
          )}
        </div>
      )}
    </div>
  );
}
