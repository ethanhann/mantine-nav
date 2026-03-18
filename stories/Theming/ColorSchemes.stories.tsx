import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NavThemeProvider, Sidebar, NavGroup, NavProvider } from '../../src';
import { sampleItems } from '../_data';

const meta: Meta = {
  title: 'Theming/Color Schemes',
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

export const IndigoTheme: StoryObj = {
  render: () => (
    <NavThemeProvider
      colorScheme={{
        primary: '#6366f1',
        background: '#1e1b4b',
        text: '#e0e7ff',
        activeBackground: '#4338ca',
        activeText: '#ffffff',
        hoverBackground: '#312e81',
      }}
    >
      <div style={{ height: 400, display: 'flex' }}>
        <Sidebar header={<div style={{ padding: 12, fontWeight: 700, color: '#e0e7ff' }}>Indigo</div>}>
          <NavGroup items={sampleItems} currentPath="/" />
        </Sidebar>
        <div style={{ flex: 1, padding: 16 }}>Custom indigo color scheme</div>
      </div>
    </NavThemeProvider>
  ),
};

export const EmeraldTheme: StoryObj = {
  render: () => (
    <NavThemeProvider
      colorScheme={{
        primary: '#10b981',
        background: '#022c22',
        text: '#d1fae5',
        activeBackground: '#059669',
        activeText: '#ffffff',
        hoverBackground: '#064e3b',
      }}
    >
      <div style={{ height: 400, display: 'flex' }}>
        <Sidebar header={<div style={{ padding: 12, fontWeight: 700, color: '#d1fae5' }}>Emerald</div>}>
          <NavGroup items={sampleItems} currentPath="/" />
        </Sidebar>
        <div style={{ flex: 1, padding: 16 }}>Custom emerald color scheme</div>
      </div>
    </NavThemeProvider>
  ),
};

export const RoseTheme: StoryObj = {
  render: () => (
    <NavThemeProvider
      colorScheme={{
        primary: '#f43f5e',
        background: '#fff1f2',
        text: '#881337',
        activeBackground: '#fda4af',
        activeText: '#881337',
        hoverBackground: '#ffe4e6',
      }}
    >
      <div style={{ height: 400, display: 'flex' }}>
        <Sidebar header={<div style={{ padding: 12, fontWeight: 700, color: '#881337' }}>Rose</div>}>
          <NavGroup items={sampleItems} currentPath="/" />
        </Sidebar>
        <div style={{ flex: 1, padding: 16 }}>Custom rose color scheme</div>
      </div>
    </NavThemeProvider>
  ),
};
