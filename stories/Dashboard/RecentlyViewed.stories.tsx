import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useRecentlyViewed, useStarredPages, LiveDataStatus } from '../../src';
import type { ConnectionStatus } from '../../src';

const meta: Meta = {
  title: 'Dashboard/Data & History',
  tags: ['autodocs'],
};

export default meta;

function RecentlyViewedDemo() {
  const { items, addItem, removeItem, clearAll } = useRecentlyViewed({ maxItems: 5 });

  const pages = [
    { id: 'p1', label: 'Dashboard Overview', href: '/dashboard' },
    { id: 'p2', label: 'Revenue Report', href: '/reports/revenue' },
    { id: 'p3', label: 'User Analytics', href: '/analytics/users' },
    { id: 'p4', label: 'Settings', href: '/settings' },
  ];

  return (
    <div style={{ width: 280, padding: 12 }}>
      <h4>Add pages:</h4>
      {pages.map((page) => (
        <button
          key={page.id}
          onClick={() => addItem(page)}
          style={{ display: 'block', marginBottom: 4, cursor: 'pointer' }}
        >
          Visit {page.label}
        </button>
      ))}
      <hr />
      <h4>Recently Viewed ({items.length}):</h4>
      {items.length === 0 && <p style={{ color: '#888' }}>No recent pages</p>}
      {items.map((item) => (
        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
          <span>{item.label}</span>
          <button onClick={() => removeItem(item.id)} style={{ cursor: 'pointer' }}>×</button>
        </div>
      ))}
      {items.length > 0 && (
        <button onClick={clearAll} style={{ marginTop: 8, cursor: 'pointer' }}>Clear all</button>
      )}
    </div>
  );
}

export const RecentlyViewed: StoryObj = {
  render: () => <RecentlyViewedDemo />,
};

function StarredPagesDemo() {
  const { items, isStarred, toggleStar, clearAll } = useStarredPages({ maxItems: 10 });

  const pages = [
    { id: 's1', label: 'Dashboard', href: '/dashboard' },
    { id: 's2', label: 'Revenue', href: '/revenue' },
    { id: 's3', label: 'Team', href: '/team' },
    { id: 's4', label: 'Settings', href: '/settings' },
  ];

  return (
    <div style={{ width: 280, padding: 12 }}>
      <h4>Pages:</h4>
      {pages.map((page) => (
        <div key={page.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
          <span>{page.label}</span>
          <button onClick={() => toggleStar(page)} style={{ cursor: 'pointer' }}>
            {isStarred(page.id) ? '⭐' : '☆'}
          </button>
        </div>
      ))}
      <hr />
      <h4>Starred ({items.length}):</h4>
      {items.length === 0 && <p style={{ color: '#888' }}>No starred pages</p>}
      {items.map((item) => (
        <div key={item.id} style={{ padding: '4px 0' }}>⭐ {item.label}</div>
      ))}
      {items.length > 0 && (
        <button onClick={clearAll} style={{ marginTop: 8, cursor: 'pointer' }}>Clear all</button>
      )}
    </div>
  );
}

export const StarredPages: StoryObj = {
  render: () => <StarredPagesDemo />,
};

const statuses: ConnectionStatus[] = ['connected', 'stale', 'error', 'disconnected'];

export const LiveDataStatuses: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, padding: 16, flexWrap: 'wrap' }}>
      {statuses.map((status) => (
        <div key={status} style={{ textAlign: 'center' }}>
          <LiveDataStatus status={status} variant="detailed" lastUpdated={new Date()} />
          <div style={{ fontSize: 12, marginTop: 4, color: '#888' }}>{status}</div>
        </div>
      ))}
    </div>
  ),
};

export const LiveDataDot: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, padding: 16, alignItems: 'center' }}>
      {statuses.map((status) => (
        <div key={status} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <LiveDataStatus status={status} variant="dot" />
          <span>{status}</span>
        </div>
      ))}
    </div>
  ),
};
