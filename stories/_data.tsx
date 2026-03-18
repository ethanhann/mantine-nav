import React from 'react';
import type { NavItemType, Workspace, UserInfo } from '../src';

/** Placeholder icons for stories */
export const Icons = {
  Home: () => <span aria-hidden>🏠</span>,
  Products: () => <span aria-hidden>📦</span>,
  Orders: () => <span aria-hidden>📋</span>,
  Customers: () => <span aria-hidden>👥</span>,
  Analytics: () => <span aria-hidden>📊</span>,
  Settings: () => <span aria-hidden>⚙️</span>,
  Docs: () => <span aria-hidden>📄</span>,
  Mail: () => <span aria-hidden>✉️</span>,
  Star: () => <span aria-hidden>⭐</span>,
  Shield: () => <span aria-hidden>🛡️</span>,
  Bell: () => <span aria-hidden>🔔</span>,
  User: () => <span aria-hidden>👤</span>,
};

export const sampleItems: NavItemType[] = [
  { id: 'home', type: 'link', label: 'Home', href: '/', icon: <Icons.Home /> },
  {
    id: 'products',
    type: 'group',
    label: 'Products',
    icon: <Icons.Products />,
    defaultOpened: true,
    children: [
      { id: 'catalog', type: 'link', label: 'Catalog', href: '/products' },
      { id: 'inventory', type: 'link', label: 'Inventory', href: '/products/inventory' },
      { id: 'pricing', type: 'link', label: 'Pricing', href: '/products/pricing' },
    ],
  },
  {
    id: 'orders',
    type: 'group',
    label: 'Orders',
    icon: <Icons.Orders />,
    children: [
      { id: 'all-orders', type: 'link', label: 'All Orders', href: '/orders' },
      { id: 'drafts', type: 'link', label: 'Drafts', href: '/orders/drafts' },
      { id: 'returns', type: 'link', label: 'Returns', href: '/orders/returns' },
    ],
  },
  { id: 'div-1', type: 'divider' },
  { id: 'customers', type: 'link', label: 'Customers', href: '/customers', icon: <Icons.Customers /> },
  { id: 'analytics', type: 'link', label: 'Analytics', href: '/analytics', icon: <Icons.Analytics /> },
  { id: 'settings', type: 'link', label: 'Settings', href: '/settings', icon: <Icons.Settings /> },
];

export const deepNestedItems: NavItemType[] = [
  {
    id: 'docs',
    type: 'group',
    label: 'Documentation',
    icon: <Icons.Docs />,
    defaultOpened: true,
    children: [
      {
        id: 'getting-started',
        type: 'group',
        label: 'Getting Started',
        defaultOpened: true,
        children: [
          { id: 'install', type: 'link', label: 'Installation', href: '/docs/install' },
          { id: 'quickstart', type: 'link', label: 'Quick Start', href: '/docs/quickstart' },
        ],
      },
      {
        id: 'guides',
        type: 'group',
        label: 'Guides',
        children: [
          { id: 'routing', type: 'link', label: 'Routing', href: '/docs/routing' },
          { id: 'theming', type: 'link', label: 'Theming', href: '/docs/theming' },
        ],
      },
    ],
  },
];

export const sectionedItems: NavItemType[] = [
  { id: 'section-main', type: 'section', label: 'Main' },
  { id: 'home', type: 'link', label: 'Home', href: '/', icon: <Icons.Home /> },
  { id: 'analytics', type: 'link', label: 'Analytics', href: '/analytics', icon: <Icons.Analytics /> },
  { id: 'section-commerce', type: 'section', label: 'Commerce' },
  { id: 'products', type: 'link', label: 'Products', href: '/products', icon: <Icons.Products /> },
  { id: 'orders', type: 'link', label: 'Orders', href: '/orders', icon: <Icons.Orders /> },
  { id: 'customers', type: 'link', label: 'Customers', href: '/customers', icon: <Icons.Customers /> },
  { id: 'div-1', type: 'divider' },
  { id: 'section-system', type: 'section', label: 'System' },
  { id: 'settings', type: 'link', label: 'Settings', href: '/settings', icon: <Icons.Settings /> },
];

export const sampleWorkspaces: Workspace[] = [
  { id: 'ws-1', name: 'Acme Corp' },
  { id: 'ws-2', name: 'Globex Inc' },
  { id: 'ws-3', name: 'Initech' },
  { id: 'ws-4', name: 'Umbrella Corp' },
];

export const sampleUser: UserInfo = {
  id: 'user-1',
  name: 'Jane Doe',
  email: 'jane@acme.com',
  role: 'Admin',
};
