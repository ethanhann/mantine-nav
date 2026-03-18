import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NotificationBell } from '../../src';

const meta: Meta<typeof NotificationBell> = {
  title: 'SaaS/NotificationBell',
  component: NotificationBell,
  tags: ['autodocs'],
  argTypes: {
    count: { control: 'number' },
    maxCount: { control: 'number' },
  },
  decorators: [(Story) => <div style={{ padding: 24 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof NotificationBell>;

export const Default: Story = {
  args: { count: 0 },
};

export const WithCount: Story = {
  args: { count: 5 },
};

export const OverMax: Story = {
  args: { count: 150, maxCount: 99 },
};

export const WithNotifications: Story = {
  args: {
    count: 3,
    notifications: [
      { id: '1', title: 'New comment on your post', read: false, timestamp: new Date() },
      { id: '2', title: 'Your export is ready', description: 'Download the CSV file', read: false, timestamp: new Date() },
      { id: '3', title: 'Welcome to the team!', read: true, timestamp: new Date() },
    ],
    onRead: (id: string) => console.log('Read:', id),
    onReadAll: () => console.log('Read all'),
  },
};
