import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { WorkspaceSwitcher } from '../../src';
import { sampleWorkspaces } from '../_data';
import type { Workspace } from '../../src';

const meta: Meta<typeof WorkspaceSwitcher> = {
  title: 'SaaS/WorkspaceSwitcher',
  component: WorkspaceSwitcher,
  tags: ['autodocs'],
  argTypes: {
    searchable: { control: 'boolean' },
    maxVisible: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof WorkspaceSwitcher>;

function SwitcherDemo(props: Partial<React.ComponentProps<typeof WorkspaceSwitcher>>) {
  const [active, setActive] = useState<Workspace>(sampleWorkspaces[0]!);
  return (
    <div style={{ width: 260 }}>
      <WorkspaceSwitcher
        workspaces={sampleWorkspaces}
        activeWorkspace={active}
        onSwitch={setActive}
        {...props}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <SwitcherDemo />,
};

export const Searchable: Story = {
  render: () => <SwitcherDemo searchable />,
};

export const WithCreateButton: Story = {
  render: () => <SwitcherDemo onCreate={() => alert('Create workspace')} />,
};

export const LimitedVisible: Story = {
  render: () => <SwitcherDemo maxVisible={2} />,
};
