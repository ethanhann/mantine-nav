import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PlanBadge } from '../../src';

const meta: Meta<typeof PlanBadge> = {
  title: 'SaaS/PlanBadge',
  component: PlanBadge,
  tags: ['autodocs'],
  argTypes: {
    plan: { control: 'text' },
    color: { control: 'color' },
    variant: { control: 'select', options: ['badge', 'card', 'inline'] },
    showUpgrade: { control: 'boolean' },
  },
  decorators: [(Story) => <div style={{ width: 260, padding: 12 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof PlanBadge>;

export const Default: Story = {
  args: { plan: 'Pro' },
};

export const FreeTier: Story = {
  args: { plan: 'Free', color: '#6b7280' },
};

export const WithUpgrade: Story = {
  args: {
    plan: 'Free',
    showUpgrade: true,
    onUpgrade: () => alert('Upgrade!'),
  },
};

export const CardVariant: Story = {
  args: {
    plan: 'Enterprise',
    variant: 'card',
    color: '#7c3aed',
  },
};

export const InlineVariant: Story = {
  args: {
    plan: 'Team',
    variant: 'inline',
    showUpgrade: true,
    onUpgrade: () => alert('Upgrade!'),
  },
};
