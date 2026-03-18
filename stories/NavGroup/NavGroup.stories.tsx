import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NavGroup } from '../../src';
import { sampleItems, deepNestedItems, sectionedItems } from '../_data';

const meta: Meta<typeof NavGroup> = {
  title: 'NavGroup/NavGroup',
  component: NavGroup,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['subtle', 'light', 'filled'] },
    accordion: { control: 'boolean' },
    maxDepth: { control: { type: 'number', min: 1, max: 5 } },
  },
};

export default meta;
type Story = StoryObj<typeof NavGroup>;

export const Default: Story = {
  args: {
    items: sampleItems,
    currentPath: '/',
    variant: 'subtle',
  },
};

export const ActiveState: Story = {
  args: {
    items: sampleItems,
    currentPath: '/products/inventory',
    variant: 'subtle',
  },
};

export const FilledVariant: Story = {
  args: {
    items: sampleItems,
    currentPath: '/analytics',
    variant: 'filled',
  },
};

export const LightVariant: Story = {
  args: {
    items: sampleItems,
    currentPath: '/analytics',
    variant: 'light',
  },
};

export const DeepNesting: Story = {
  args: {
    items: deepNestedItems,
    currentPath: '/docs/install',
    variant: 'subtle',
  },
};

export const SectionHeaders: Story = {
  args: {
    items: sectionedItems,
    currentPath: '/',
    variant: 'subtle',
  },
};

export const AccordionMode: Story = {
  args: {
    items: sampleItems,
    accordion: true,
    variant: 'subtle',
  },
};
