import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NavLayout, Sidebar, NavBar, NavGroup, NavProvider } from '../../src';
import { sampleItems, Icons } from '../_data';

const meta: Meta<typeof NavLayout> = {
  title: 'Layout/NavLayout',
  component: NavLayout,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <NavProvider>
        <div style={{ height: 500 }}>
          <Story />
        </div>
      </NavProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NavLayout>;

export const SidebarOnly: Story = {
  args: {
    sidebar: (
      <Sidebar header={<div style={{ padding: 12, fontWeight: 700 }}>App</div>}>
        <NavGroup items={sampleItems} currentPath="/" />
      </Sidebar>
    ),
    children: <div style={{ padding: 16 }}>Main content area</div>,
  },
};

export const NavbarOnly: Story = {
  args: {
    navbar: (
      <NavBar logo={<span style={{ fontWeight: 700 }}>App</span>}>
        <a href="/">Home</a>
        <a href="/about">About</a>
      </NavBar>
    ),
    children: <div style={{ padding: 16 }}>Main content area</div>,
  },
};

export const Combined: Story = {
  args: {
    sidebar: (
      <Sidebar header={<div style={{ padding: 12, fontWeight: 700 }}>App</div>}>
        <NavGroup items={sampleItems} currentPath="/" />
      </Sidebar>
    ),
    navbar: (
      <NavBar
        logo={<span style={{ fontWeight: 700 }}>App</span>}
        rightSection={<Icons.Bell />}
      >
        <a href="/">Dashboard</a>
        <a href="/reports">Reports</a>
      </NavBar>
    ),
    children: <div style={{ padding: 16 }}>Main content with both sidebar and navbar</div>,
  },
};
