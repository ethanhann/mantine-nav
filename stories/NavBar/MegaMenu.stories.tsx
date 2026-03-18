import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NavBar, NavProvider } from '../../src';
import { Icons } from '../_data';

const meta: Meta<typeof NavBar> = {
  title: 'NavBar/Mega Menu',
  component: NavBar,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <NavProvider>
        <Story />
        <div style={{ padding: 16, background: '#f9fafb', minHeight: 300 }}>
          Hover over &quot;Products&quot; in the navbar to see the mega menu dropdown.
        </div>
      </NavProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NavBar>;

export const Default: Story = {
  args: {
    logo: <span style={{ fontWeight: 700, fontSize: 18 }}>Store</span>,
    children: (
      <>
        <a href="/">Home</a>
        <div style={{ position: 'relative' }}>
          <a href="/products">Products ▾</a>
        </div>
        <a href="/about">About</a>
      </>
    ),
  },
};
