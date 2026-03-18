import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useNavColorScheme, Sidebar, NavGroup, NavProvider } from '../../src';
import { sampleItems } from '../_data';

const meta: Meta = {
  title: 'Theming/Dark Mode',
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

function DarkModeToggle() {
  const { colorScheme, toggleColorScheme, isLight, isDark } = useNavColorScheme();

  return (
    <div style={{ height: 400, display: 'flex' }}>
      <Sidebar
        header={
          <div style={{ padding: 12 }}>
            <strong>App</strong>
            <button
              onClick={toggleColorScheme}
              style={{ display: 'block', marginTop: 8, cursor: 'pointer' }}
            >
              {isLight ? '🌙 Dark' : '☀️ Light'}
            </button>
          </div>
        }
      >
        <NavGroup items={sampleItems} currentPath="/" />
      </Sidebar>
      <div style={{ flex: 1, padding: 16, background: isDark ? '#1a1b1e' : '#f9fafb', color: isDark ? '#c1c2c5' : '#000' }}>
        <p>Current scheme: <code>{colorScheme}</code></p>
        <p>isLight: {String(isLight)} | isDark: {String(isDark)}</p>
      </div>
    </div>
  );
}

export const Toggle: StoryObj = {
  render: () => <DarkModeToggle />,
};
