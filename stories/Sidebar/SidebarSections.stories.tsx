import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar, NavGroup, NavSection, NavProvider } from '../../src';
import { sampleItems, Icons } from '../_data';
import type { NavItemType } from '../../src';

const meta: Meta<typeof NavSection> = {
  title: 'Sidebar/Sections & Dividers',
  component: NavSection,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <NavProvider>
        <div style={{ height: 500, display: 'flex' }}>
          <Sidebar header={<div style={{ padding: 12, fontWeight: 700 }}>My App</div>}>
            <Story />
          </Sidebar>
          <div style={{ flex: 1, padding: 16, background: '#f9fafb' }}>Page content</div>
        </div>
      </NavProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NavSection>;

const mainItems: NavItemType[] = [
  { id: 'home', type: 'link', label: 'Home', href: '/', icon: <Icons.Home /> },
  { id: 'analytics', type: 'link', label: 'Analytics', href: '/analytics', icon: <Icons.Analytics /> },
];

const commerceItems: NavItemType[] = [
  { id: 'products', type: 'link', label: 'Products', href: '/products', icon: <Icons.Products /> },
  { id: 'orders', type: 'link', label: 'Orders', href: '/orders', icon: <Icons.Orders /> },
];

export const Default: Story = {
  render: () => (
    <>
      <NavSection label="Main">
        <NavGroup items={mainItems} currentPath="/" />
      </NavSection>
      <NavSection label="Commerce">
        <NavGroup items={commerceItems} currentPath="/" />
      </NavSection>
    </>
  ),
};

export const Collapsible: Story = {
  render: () => (
    <>
      <NavSection label="Main" collapsible defaultOpened>
        <NavGroup items={mainItems} currentPath="/" />
      </NavSection>
      <NavSection label="Commerce" collapsible defaultOpened={false}>
        <NavGroup items={commerceItems} currentPath="/" />
      </NavSection>
    </>
  ),
};

export const WithDividers: Story = {
  render: () => (
    <>
      <NavSection label="Main" divider="bottom">
        <NavGroup items={mainItems} currentPath="/" />
      </NavSection>
      <NavSection label="Commerce" divider="both">
        <NavGroup items={commerceItems} currentPath="/" />
      </NavSection>
    </>
  ),
};
