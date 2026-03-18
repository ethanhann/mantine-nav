import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NavBar, NavProvider } from '../../src';
import { Icons } from '../_data';

const meta: Meta<typeof NavBar> = {
  title: 'NavBar/NavBar',
  component: NavBar,
  tags: ['autodocs'],
  argTypes: {
    sticky: { control: 'boolean' },
    variant: { control: 'select', options: ['links', 'tabs'] },
    height: { control: 'number' },
  },
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

export const Default: Story = {
  args: {
    logo: <span style={{ fontWeight: 700, fontSize: 18 }}>MyApp</span>,
    children: (
      <>
        <a href="/">Home</a>
        <a href="/products">Products</a>
        <a href="/about">About</a>
      </>
    ),
  },
};

export const Sticky: Story = {
  args: {
    logo: <span style={{ fontWeight: 700, fontSize: 18 }}>MyApp</span>,
    sticky: true,
    children: (
      <>
        <a href="/">Home</a>
        <a href="/products">Products</a>
      </>
    ),
  },
};

export const TabVariant: Story = {
  args: {
    logo: <span style={{ fontWeight: 700, fontSize: 18 }}>MyApp</span>,
    variant: 'tabs',
    children: (
      <>
        <a href="/">Overview</a>
        <a href="/analytics">Analytics</a>
        <a href="/reports">Reports</a>
      </>
    ),
  },
};

export const WithRightSection: Story = {
  args: {
    logo: <span style={{ fontWeight: 700, fontSize: 18 }}>MyApp</span>,
    rightSection: (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <Icons.Bell />
        <Icons.User />
      </div>
    ),
    children: (
      <>
        <a href="/">Home</a>
        <a href="/products">Products</a>
      </>
    ),
  },
};
