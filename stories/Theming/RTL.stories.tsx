import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NavThemeProvider, Sidebar, NavGroup, NavProvider } from '../../src';
import type { NavItemType } from '../../src';

const meta: Meta = {
  title: 'Theming/RTL Support',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <NavProvider>
        <Story />
      </NavProvider>
    ),
  ],
};

export default meta;

const rtlItems: NavItemType[] = [
  { id: 'home', type: 'link', label: 'الرئيسية', href: '/' },
  {
    id: 'products',
    type: 'group',
    label: 'المنتجات',
    defaultOpened: true,
    children: [
      { id: 'catalog', type: 'link', label: 'الكتالوج', href: '/products' },
      { id: 'inventory', type: 'link', label: 'المخزون', href: '/products/inventory' },
    ],
  },
  { id: 'customers', type: 'link', label: 'العملاء', href: '/customers' },
  { id: 'settings', type: 'link', label: 'الإعدادات', href: '/settings' },
];

export const RTL: StoryObj = {
  render: () => (
    <NavThemeProvider dir="rtl">
      <div style={{ height: 400, display: 'flex', direction: 'rtl' }}>
        <Sidebar header={<div style={{ padding: 12, fontWeight: 700 }}>تطبيقي</div>}>
          <NavGroup items={rtlItems} currentPath="/" />
        </Sidebar>
        <div style={{ flex: 1, padding: 16, background: '#f9fafb' }}>
          محتوى الصفحة (RTL)
        </div>
      </div>
    </NavThemeProvider>
  ),
};

export const LTR: StoryObj = {
  render: () => (
    <NavThemeProvider dir="ltr">
      <div style={{ height: 400, display: 'flex' }}>
        <Sidebar header={<div style={{ padding: 12, fontWeight: 700 }}>My App</div>}>
          <NavGroup items={rtlItems} currentPath="/" />
        </Sidebar>
        <div style={{ flex: 1, padding: 16, background: '#f9fafb' }}>
          Same items in LTR mode
        </div>
      </div>
    </NavThemeProvider>
  ),
};
