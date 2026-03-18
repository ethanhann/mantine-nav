import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useResponsiveNav, Sidebar, NavBar, NavGroup, NavLayout, NavProvider } from '../../src';
import { sampleItems } from '../_data';

const meta: Meta = {
  title: 'Layout/Responsive',
  tags: ['autodocs'],
  parameters: {
    viewport: { defaultViewport: 'responsive' },
  },
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

function ResponsiveDemo() {
  const {
    isMobile,
    isTablet,
    isDesktop,
    sidebarMode,
    sidebarVisible,
    navbarVisible,
    toggleSidebar,
    viewportWidth,
  } = useResponsiveNav({ sidebarBreakpoint: 768, navbarBreakpoint: 1024 });

  return (
    <NavLayout
      sidebar={
        sidebarVisible ? (
          <Sidebar
            header={<div style={{ padding: 12, fontWeight: 700 }}>App</div>}
            defaultCollapsed={isTablet}
          >
            <NavGroup items={sampleItems} currentPath="/" />
          </Sidebar>
        ) : undefined
      }
      navbar={
        navbarVisible ? (
          <NavBar logo={<span style={{ fontWeight: 700 }}>App</span>}>
            {isMobile && (
              <button onClick={toggleSidebar} style={{ cursor: 'pointer' }}>☰</button>
            )}
          </NavBar>
        ) : undefined
      }
    >
      <div style={{ padding: 16 }}>
        <h3>Responsive State</h3>
        <ul>
          <li>Viewport: {viewportWidth}px</li>
          <li>Mode: {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}</li>
          <li>Sidebar mode: {sidebarMode}</li>
          <li>Sidebar visible: {String(sidebarVisible)}</li>
          <li>Navbar visible: {String(navbarVisible)}</li>
        </ul>
        <p>Resize the viewport to see responsive behavior.</p>
      </div>
    </NavLayout>
  );
}

export const Default: StoryObj = {
  render: () => <ResponsiveDemo />,
};
