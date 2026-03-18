import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useSidebarVariant, Sidebar, NavGroup, NavProvider } from '../../src';
import { sampleItems } from '../_data';

const meta: Meta = {
  title: 'Sidebar/Mini Variant',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <NavProvider>
        <div style={{ height: 500, display: 'flex' }}>
          <Story />
        </div>
      </NavProvider>
    ),
  ],
};

export default meta;

function VariantCycler() {
  const { variant, cycleVariant, isFull, isMini, isRail } = useSidebarVariant();

  return (
    <>
      <Sidebar
        expandedWidth={isFull ? 260 : 160}
        defaultCollapsed={isRail}
        collapsedWidth={isRail ? 60 : undefined}
        header={
          <div style={{ padding: 12 }}>
            <strong>Mode: {variant}</strong>
            <button onClick={cycleVariant} style={{ display: 'block', marginTop: 4, cursor: 'pointer' }}>
              Cycle variant
            </button>
          </div>
        }
      >
        <NavGroup items={sampleItems} currentPath="/" />
      </Sidebar>
      <div style={{ flex: 1, padding: 16, background: '#f9fafb' }}>
        <p>Current: <code>{variant}</code></p>
        <p>isFull: {String(isFull)} | isMini: {String(isMini)} | isRail: {String(isRail)}</p>
      </div>
    </>
  );
}

export const CycleVariants: StoryObj = {
  render: () => <VariantCycler />,
};
