import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NavBreadcrumbs, NavBar, NavProvider } from '../../src';

const meta: Meta<typeof NavBreadcrumbs> = {
  title: 'NavBar/Breadcrumbs',
  component: NavBreadcrumbs,
  tags: ['autodocs'],
  argTypes: {
    separator: { control: 'text' },
    maxItems: { control: 'number' },
  },
  decorators: [
    (Story) => (
      <NavProvider>
        <NavBar logo={<span style={{ fontWeight: 700 }}>App</span>}>
          <Story />
        </NavBar>
      </NavProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NavBreadcrumbs>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Widget Pro' },
    ],
  },
};

export const CustomSeparator: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Settings', href: '/settings' },
      { label: 'Profile' },
    ],
    separator: '›',
  },
};

export const Truncated: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Category', href: '/products/category' },
      { label: 'Sub-Category', href: '/products/category/sub' },
      { label: 'Item Detail' },
    ],
    maxItems: 3,
  },
};
