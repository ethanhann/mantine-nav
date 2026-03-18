import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DashboardSwitcher } from '../../src';
import type { Dashboard } from '../../src';

const dashboards: Dashboard[] = [
  { id: 'd1', name: 'Overview', group: 'General' },
  { id: 'd2', name: 'Revenue', group: 'Sales' },
  { id: 'd3', name: 'Pipeline', group: 'Sales' },
  { id: 'd4', name: 'Traffic', group: 'Marketing' },
  { id: 'd5', name: 'Campaigns', group: 'Marketing' },
  { id: 'd6', name: 'Infrastructure', group: 'Engineering' },
];

const meta: Meta<typeof DashboardSwitcher> = {
  title: 'Dashboard/DashboardSwitcher',
  component: DashboardSwitcher,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['dropdown', 'sidebar-list'] },
    searchable: { control: 'boolean' },
  },
  decorators: [(Story) => <div style={{ width: 280, padding: 12 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof DashboardSwitcher>;

function SwitcherDemo(props: Partial<React.ComponentProps<typeof DashboardSwitcher>>) {
  const [active, setActive] = useState<Dashboard>(dashboards[0]!);
  return (
    <DashboardSwitcher
      dashboards={dashboards}
      activeDashboard={active}
      onSwitch={setActive}
      {...props}
    />
  );
}

export const Dropdown: Story = {
  render: () => <SwitcherDemo variant="dropdown" />,
};

export const SidebarList: Story = {
  render: () => <SwitcherDemo variant="sidebar-list" />,
};

export const Searchable: Story = {
  render: () => <SwitcherDemo searchable />,
};

export const Grouped: Story = {
  render: () => <SwitcherDemo groupBy="group" variant="sidebar-list" />,
};
