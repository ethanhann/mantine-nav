import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useResponsiveNav, NavLayout, Sidebar, NavGroup, NavProvider } from '../../src';
import { sampleItems } from '../_data';

const meta: Meta = {
  title: 'Layout/Print Friendly',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <NavProvider>
        <div style={{ height: 500 }}>
          <Story />
        </div>
      </NavProvider>
    ),
  ],
};

export default meta;

function PrintDemo() {
  useResponsiveNav({ printFriendly: true });

  return (
    <NavLayout
      sidebar={
        <Sidebar header={<div style={{ padding: 12, fontWeight: 700 }}>App</div>}>
          <NavGroup items={sampleItems} currentPath="/" />
        </Sidebar>
      }
    >
      <div style={{ padding: 16 }}>
        <h3>Print-Friendly Mode</h3>
        <p>
          When <code>printFriendly: true</code> is set, the sidebar and navbar are
          automatically hidden in print media. Try printing this page (Ctrl+P) to
          see the effect.
        </p>
        <p>This content will be the only thing visible when printed.</p>
      </div>
    </NavLayout>
  );
}

export const Default: StoryObj = {
  render: () => <PrintDemo />,
};
