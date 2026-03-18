import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar, NavGroup, NavProvider } from '../../src';
import { sampleItems, Icons } from '../_data';

const meta: Meta<typeof Sidebar> = {
  title: 'Sidebar/Rail Mode',
  component: Sidebar,
  tags: ['autodocs'],
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

export const RailCollapsed: Story = {
  args: {
    defaultCollapsed: true,
    collapsedWidth: 60,
    header: <div style={{ padding: 8, textAlign: 'center', fontWeight: 700 }}>A</div>,
    children: <NavGroup items={sampleItems} currentPath="/" />,
  },
};

export const NarrowRail: Story = {
  args: {
    defaultCollapsed: true,
    collapsedWidth: 48,
    header: <div style={{ padding: 4, textAlign: 'center' }}><Icons.Home /></div>,
    children: <NavGroup items={sampleItems} currentPath="/" />,
  },
};
