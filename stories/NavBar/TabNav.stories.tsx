import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NavBar, EnvironmentIndicator, CommandPaletteSlot, NavProvider } from '../../src';

const meta: Meta<typeof NavBar> = {
  title: 'NavBar/Tab Style & Extras',
  component: NavBar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <NavProvider>
        <Story />
        <div style={{ padding: 16, background: '#f9fafb', minHeight: 200 }}>Page content</div>
      </NavProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NavBar>;

export const TabsWithEnvironment: Story = {
  args: {
    logo: <span style={{ fontWeight: 700 }}>Dashboard</span>,
    variant: 'tabs',
    rightSection: <EnvironmentIndicator environment="staging" color="#f59e0b" />,
    children: (
      <>
        <a href="/">Overview</a>
        <a href="/analytics">Analytics</a>
        <a href="/reports">Reports</a>
      </>
    ),
  },
};

export const WithCommandPalette: Story = {
  args: {
    logo: <span style={{ fontWeight: 700 }}>MyApp</span>,
    rightSection: (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <CommandPaletteSlot shortcut="⌘K" onTrigger={() => alert('Open palette')} />
        <EnvironmentIndicator environment="production" color="#22c55e" variant="badge" />
      </div>
    ),
    children: (
      <>
        <a href="/">Home</a>
        <a href="/docs">Docs</a>
      </>
    ),
  },
};

export const EnvironmentStrip: Story = {
  args: {
    logo: <span style={{ fontWeight: 700 }}>Admin</span>,
    rightSection: <EnvironmentIndicator environment="development" color="#ef4444" variant="strip" />,
    children: (
      <>
        <a href="/">Home</a>
        <a href="/settings">Settings</a>
      </>
    ),
  },
};
