import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useSidebarResize, Sidebar, NavGroup, NavProvider } from '../../src';
import { sampleItems } from '../_data';

const meta: Meta = {
  title: 'Sidebar/Resizable',
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

function ResizableSidebar() {
  const { width, isResizing, getHandleProps, resetWidth } = useSidebarResize({
    defaultWidth: 260,
    minWidth: 180,
    maxWidth: 480,
  });

  return (
    <>
      <div style={{ position: 'relative', width }}>
        <Sidebar
          expandedWidth={width}
          collapsible={false}
          header={
            <div style={{ padding: 12 }}>
              <strong>Resizable</strong>
              <div style={{ fontSize: 12, color: '#888' }}>{Math.round(Number(width))}px</div>
              <button onClick={resetWidth} style={{ marginTop: 4, cursor: 'pointer' }}>Reset</button>
            </div>
          }
        >
          <NavGroup items={sampleItems} currentPath="/" />
        </Sidebar>
        <div
          {...getHandleProps()}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 4,
            cursor: 'col-resize',
            background: isResizing ? '#228be6' : 'transparent',
          }}
        />
      </div>
      <div style={{ flex: 1, padding: 16, background: '#f9fafb' }}>
        Drag the right edge of the sidebar to resize.
      </div>
    </>
  );
}

export const Default: StoryObj = {
  render: () => <ResizableSidebar />,
};
