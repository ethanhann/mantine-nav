import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FilterPanel, FilterIndicator } from '../../src';

const meta: Meta<typeof FilterPanel> = {
  title: 'Dashboard/FilterPanel',
  component: FilterPanel,
  tags: ['autodocs'],
  argTypes: {
    position: { control: 'select', options: ['left', 'right'] },
    applyMode: { control: 'select', options: ['instant', 'manual'] },
    width: { control: 'number' },
    collapsible: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ display: 'flex', height: 400, border: '1px solid #e5e7eb' }}>
        <Story />
        <div style={{ flex: 1, padding: 16, background: '#f9fafb' }}>
          <h3>Dashboard Content</h3>
          <p>Filter panel is on the side.</p>
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof FilterPanel>;

export const Default: Story = {
  args: {
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label>
          Status
          <select style={{ display: 'block', width: '100%', marginTop: 4 }}>
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </label>
        <label>
          Region
          <select style={{ display: 'block', width: '100%', marginTop: 4 }}>
            <option>All regions</option>
            <option>North America</option>
            <option>Europe</option>
            <option>Asia Pacific</option>
          </select>
        </label>
      </div>
    ),
  },
};

export const ManualApply: Story = {
  args: {
    applyMode: 'manual',
    onApply: () => alert('Filters applied'),
    onReset: () => alert('Filters reset'),
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label>
          Date range
          <input type="date" style={{ display: 'block', width: '100%', marginTop: 4 }} />
        </label>
        <label>
          Category
          <select style={{ display: 'block', width: '100%', marginTop: 4 }}>
            <option>All</option>
            <option>Electronics</option>
            <option>Clothing</option>
          </select>
        </label>
      </div>
    ),
  },
};

export const WithFilterIndicator: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12 }}>
      <FilterIndicator
        datePreset="Last 30 days"
        filters={[
          { key: 'status', label: 'Status', value: 'Active' },
          { key: 'region', label: 'Region', value: 'North America' },
        ]}
        onFilterRemove={(key) => console.log('Remove:', key)}
      />
    </div>
  ),
};

export const CollapsedByDefault: Story = {
  args: {
    defaultOpened: false,
    children: <div style={{ padding: 8 }}>Filter content here</div>,
  },
};
