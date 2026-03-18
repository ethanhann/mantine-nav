import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NavThemeProvider, Sidebar, NavGroup, NavProvider } from '../../src';
import { sampleItems } from '../_data';
import type { NavPreset } from '../../src';

const meta: Meta = {
  title: 'Theming/Presets',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <NavProvider>
        <Story />
      </NavProvider>
    ),
  ],
};

export default meta;

function PresetDemo({ preset }: { preset: NavPreset }) {
  return (
    <NavThemeProvider preset={preset}>
      <div style={{ height: 400, display: 'flex' }}>
        <Sidebar header={<div style={{ padding: 12, fontWeight: 700 }}>{preset}</div>}>
          <NavGroup items={sampleItems} currentPath="/" />
        </Sidebar>
        <div style={{ flex: 1, padding: 16, background: '#f9fafb' }}>
          Preset: <code>{preset}</code>
        </div>
      </div>
    </NavThemeProvider>
  );
}

export const Minimal: StoryObj = {
  render: () => <PresetDemo preset="minimal" />,
};

export const Corporate: StoryObj = {
  render: () => <PresetDemo preset="corporate" />,
};

export const Playful: StoryObj = {
  render: () => <PresetDemo preset="playful" />,
};

export const AllPresets: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {(['minimal', 'corporate', 'playful'] as const).map((preset) => (
        <div key={preset}>
          <h3 style={{ margin: '0 0 8px' }}>{preset}</h3>
          <PresetDemo preset={preset} />
        </div>
      ))}
    </div>
  ),
};
