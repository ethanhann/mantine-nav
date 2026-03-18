import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  NavProvider, NavLayout, Sidebar, NavBar, NavGroup, NavSection,
  NavBreadcrumbs, CommandPaletteSlot,
} from '../../src';
import { deepNestedItems, Icons } from '../_data';
import type { NavItemType } from '../../src';

const meta: Meta = {
  title: 'Recipes/Documentation Site',
  tags: ['autodocs'],
};

export default meta;

const docsItems: NavItemType[] = [
  { id: 'section-learn', type: 'section', label: 'Learn' },
  ...deepNestedItems,
  {
    id: 'api',
    type: 'group',
    label: 'API Reference',
    icon: <Icons.Docs />,
    children: [
      { id: 'components', type: 'link', label: 'Components', href: '/api/components' },
      { id: 'hooks', type: 'link', label: 'Hooks', href: '/api/hooks' },
      { id: 'types', type: 'link', label: 'Types', href: '/api/types' },
    ],
  },
  { id: 'div-1', type: 'divider' },
  { id: 'section-community', type: 'section', label: 'Community' },
  { id: 'examples', type: 'link', label: 'Examples', href: '/examples', icon: <Icons.Star /> },
  { id: 'changelog', type: 'link', label: 'Changelog', href: '/changelog', icon: <Icons.Docs /> },
];

export const Default: StoryObj = {
  render: () => (
    <NavProvider>
      <div style={{ height: 600 }}>
        <NavLayout
          navbar={
            <NavBar
              logo={<span style={{ fontWeight: 700, fontSize: 18 }}>Docs</span>}
              sticky
              rightSection={
                <CommandPaletteSlot shortcut="⌘K" variant="input" placeholder="Search docs..." />
              }
            >
              <NavBreadcrumbs
                items={[
                  { label: 'Docs', href: '/' },
                  { label: 'Getting Started', href: '/docs' },
                  { label: 'Installation' },
                ]}
              />
            </NavBar>
          }
          sidebar={
            <Sidebar
              expandedWidth={280}
              header={<div style={{ padding: 12, fontWeight: 700 }}>@ethanhann/nav</div>}
            >
              <NavGroup
                items={docsItems}
                currentPath="/docs/install"
                maxDepth={3}
              />
            </Sidebar>
          }
        >
          <div style={{ padding: 24, maxWidth: 720 }}>
            <h1>Installation</h1>
            <p>Install the package from GitHub Packages:</p>
            <pre style={{ padding: 16, background: '#f1f5f9', borderRadius: 8, overflow: 'auto' }}>
              npm install @ethanhann/nav
            </pre>
            <h2>Peer Dependencies</h2>
            <p>Make sure you have React 19+ and Mantine v8 installed:</p>
            <pre style={{ padding: 16, background: '#f1f5f9', borderRadius: 8, overflow: 'auto' }}>
              npm install react react-dom @mantine/core @mantine/hooks
            </pre>
          </div>
        </NavLayout>
      </div>
    </NavProvider>
  ),
};
