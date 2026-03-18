import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  NavProvider, NavLayout, Sidebar, NavBar, NavGroup, NavSection,
  UserMenu, NotificationBell, CommandPaletteSlot,
} from '../../src';
import { sampleUser, Icons } from '../_data';
import type { NavItemType } from '../../src';

const meta: Meta = {
  title: 'Recipes/Admin Dashboard',
  tags: ['autodocs'],
};

export default meta;

const adminItems: NavItemType[] = [
  { id: 'section-main', type: 'section', label: 'Main' },
  { id: 'dashboard', type: 'link', label: 'Dashboard', href: '/dashboard', icon: <Icons.Home /> },
  { id: 'analytics', type: 'link', label: 'Analytics', href: '/analytics', icon: <Icons.Analytics /> },
  { id: 'section-manage', type: 'section', label: 'Manage' },
  {
    id: 'users',
    type: 'group',
    label: 'Users',
    icon: <Icons.Customers />,
    defaultOpened: true,
    children: [
      { id: 'all-users', type: 'link', label: 'All Users', href: '/users' },
      { id: 'roles', type: 'link', label: 'Roles', href: '/users/roles' },
      { id: 'permissions', type: 'link', label: 'Permissions', href: '/users/permissions' },
    ],
  },
  {
    id: 'content',
    type: 'group',
    label: 'Content',
    icon: <Icons.Docs />,
    children: [
      { id: 'pages', type: 'link', label: 'Pages', href: '/content/pages' },
      { id: 'media', type: 'link', label: 'Media', href: '/content/media' },
    ],
  },
  { id: 'div-1', type: 'divider' },
  { id: 'settings', type: 'link', label: 'Settings', href: '/settings', icon: <Icons.Settings /> },
];

export const Default: StoryObj = {
  render: () => (
    <NavProvider>
      <div style={{ height: 600 }}>
        <NavLayout
          navbar={
            <NavBar
              logo={<span style={{ fontWeight: 700, fontSize: 18 }}>Admin Panel</span>}
              sticky
              rightSection={
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <CommandPaletteSlot shortcut="⌘K" />
                  <NotificationBell count={3} />
                </div>
              }
            />
          }
          sidebar={
            <Sidebar
              header={<div style={{ padding: 12, fontWeight: 700 }}>Navigation</div>}
              footer={
                <UserMenu
                  user={sampleUser}
                  showEmail
                  menuItems={[
                    { label: 'Profile', href: '/profile' },
                    { label: 'Sign out', onClick: () => {} },
                  ]}
                />
              }
            >
              <NavGroup items={adminItems} currentPath="/dashboard" />
            </Sidebar>
          }
        >
          <div style={{ padding: 24 }}>
            <h2>Dashboard</h2>
            <p>Welcome back, {sampleUser.name}!</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }}>
              {['Total Users', 'Revenue', 'Active Sessions'].map((label) => (
                <div key={label} style={{ padding: 16, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: 14, color: '#6b7280' }}>{label}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{Math.floor(Math.random() * 10000)}</div>
                </div>
              ))}
            </div>
          </div>
        </NavLayout>
      </div>
    </NavProvider>
  ),
};
