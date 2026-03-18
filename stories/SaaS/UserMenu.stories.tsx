import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { UserMenu } from '../../src';
import { sampleUser } from '../_data';

const meta: Meta<typeof UserMenu> = {
  title: 'SaaS/UserMenu',
  component: UserMenu,
  tags: ['autodocs'],
  argTypes: {
    showRole: { control: 'boolean' },
    showEmail: { control: 'boolean' },
    avatarSize: { control: 'number' },
  },
  decorators: [(Story) => <div style={{ width: 260 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof UserMenu>;

export const Default: Story = {
  args: {
    user: sampleUser,
    menuItems: [
      { label: 'Profile', href: '/profile' },
      { label: 'Settings', href: '/settings' },
      { label: 'Sign out', onClick: () => alert('Sign out') },
    ],
  },
};

export const WithEmail: Story = {
  args: {
    user: sampleUser,
    showEmail: true,
    menuItems: [
      { label: 'Profile', href: '/profile' },
      { label: 'Sign out', onClick: () => alert('Sign out') },
    ],
  },
};

export const NoRole: Story = {
  args: {
    user: { ...sampleUser, role: undefined },
    showRole: false,
  },
};

export const LargeAvatar: Story = {
  args: {
    user: sampleUser,
    avatarSize: 48,
    showEmail: true,
    menuItems: [
      { label: 'Profile', href: '/profile' },
    ],
  },
};
