import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar, NavGroup, NavProvider } from '../../src';
import { sampleItems, sectionedItems, Icons } from '../_data';

const meta: Meta<typeof Sidebar> = {
  title: 'Sidebar/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  argTypes: {
    collapsible: { control: 'boolean' },
    expandedWidth: { control: 'number' },
    collapsedWidth: { control: 'number' },
    showCollapseToggle: { control: 'boolean' },
    collapseTogglePosition: { control: 'select', options: ['header', 'footer'] },
    stickyHeader: { control: 'boolean' },
    stickyFooter: { control: 'boolean' },
    headerBorderBottom: { control: 'boolean' },
    footerBorderTop: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <NavProvider>
        <div style={{ height: 500, display: 'flex' }}>
          <Story />
          <div style={{ flex: 1, padding: 16, background: '#f9fafb' }}>Page content</div>
        </div>
      </NavProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
  args: {
    header: <div style={{ padding: 12, fontWeight: 700 }}>My App</div>,
    children: <NavGroup items={sampleItems} currentPath="/" />,
  },
};

export const WithFooter: Story = {
  args: {
    header: <div style={{ padding: 12, fontWeight: 700 }}>My App</div>,
    footer: <div style={{ padding: 12, fontSize: 12, color: '#888' }}>v0.1.0</div>,
    children: <NavGroup items={sampleItems} currentPath="/" />,
  },
};

export const Collapsed: Story = {
  args: {
    defaultCollapsed: true,
    header: <div style={{ padding: 12, fontWeight: 700 }}>App</div>,
    children: <NavGroup items={sampleItems} currentPath="/" />,
  },
};

export const NonCollapsible: Story = {
  args: {
    collapsible: false,
    header: <div style={{ padding: 12, fontWeight: 700 }}>My App</div>,
    children: <NavGroup items={sampleItems} currentPath="/" />,
  },
};

export const CustomWidths: Story = {
  args: {
    expandedWidth: 320,
    collapsedWidth: 80,
    header: <div style={{ padding: 12, fontWeight: 700 }}>Wide Sidebar</div>,
    children: <NavGroup items={sampleItems} currentPath="/" />,
  },
};

export const WithSections: Story = {
  args: {
    header: <div style={{ padding: 12, fontWeight: 700 }}>My App</div>,
    children: <NavGroup items={sectionedItems} currentPath="/" />,
  },
};

export const ToggleInHeader: Story = {
  args: {
    collapseTogglePosition: 'header',
    header: <div style={{ padding: 12, fontWeight: 700 }}>My App</div>,
    children: <NavGroup items={sampleItems} currentPath="/" />,
  },
};
