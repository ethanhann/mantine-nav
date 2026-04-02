import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Text, Title, Code, Anchor, Breadcrumbs } from '@mantine/core';
import {
  IconBook,
  IconRocket,
  IconPuzzle,
  IconBrush,
  IconApi,
  IconTerminal,
} from '@tabler/icons-react';
import {
  NavShell,
  NavSidebar,
  NavHeader,
  NavGroup,
} from '../../src';
import type { NavItemType } from '../../src';

const docsItems: NavItemType[] = [
  {
    id: 'getting-started',
    type: 'group',
    label: 'Getting Started',
    icon: <IconRocket size={18} stroke={1.5} />,
    defaultOpened: true,
    children: [
      { id: 'introduction', type: 'link', label: 'Introduction', href: '/docs/intro' },
      { id: 'installation', type: 'link', label: 'Installation', href: '/docs/installation' },
      { id: 'quick-start', type: 'link', label: 'Quick Start', href: '/docs/quick-start' },
    ],
  },
  {
    id: 'components',
    type: 'group',
    label: 'Components',
    icon: <IconPuzzle size={18} stroke={1.5} />,
    children: [
      { id: 'nav-shell', type: 'link', label: 'NavShell', href: '/docs/components/nav-shell' },
      { id: 'nav-sidebar', type: 'link', label: 'NavSidebar', href: '/docs/components/nav-sidebar' },
      { id: 'nav-header', type: 'link', label: 'NavHeader', href: '/docs/components/nav-header' },
      { id: 'nav-group', type: 'link', label: 'NavGroup', href: '/docs/components/nav-group' },
    ],
  },
  {
    id: 'theming',
    type: 'group',
    label: 'Theming',
    icon: <IconBrush size={18} stroke={1.5} />,
    children: [
      { id: 'colors', type: 'link', label: 'Colors', href: '/docs/theming/colors' },
      { id: 'dark-mode', type: 'link', label: 'Dark Mode', href: '/docs/theming/dark-mode' },
    ],
  },
  {
    id: 'api',
    type: 'group',
    label: 'API Reference',
    icon: <IconApi size={18} stroke={1.5} />,
    children: [
      { id: 'hooks', type: 'link', label: 'Hooks', href: '/docs/api/hooks' },
      { id: 'types', type: 'link', label: 'Types', href: '/docs/api/types' },
    ],
  },
];

const meta: Meta = {
  title: 'Recipes/Documentation',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <NavShell
      header={
        <NavHeader
          logo={
            <Text fw={700} size="lg">
              <IconBook size={20} stroke={1.5} style={{ verticalAlign: 'middle', marginRight: 8 }} />
              @ethanhann/mantine-nav
            </Text>
          }
          rightSection={
            <Anchor href="https://github.com/ethanhann/mantine-nav" target="_blank" size="sm">
              GitHub
            </Anchor>
          }
        />
      }
      sidebar={
        <NavSidebar showCollapseToggle={false}>
          <NavGroup items={docsItems} currentPath="/docs/installation" />
        </NavSidebar>
      }
    >
      <Breadcrumbs mb="md">
        <Anchor href="/docs">Docs</Anchor>
        <Anchor href="/docs/getting-started">Getting Started</Anchor>
        <Text>Installation</Text>
      </Breadcrumbs>

      <Title order={1} mb="md">Installation</Title>
      <Text mb="md">
        Install <Code>@ethanhann/mantine-nav</Code> and its peer dependencies:
      </Text>
      <Code block mb="md">
        {`npm install @ethanhann/mantine-nav @mantine/core @mantine/hooks @tabler/icons-react`}
      </Code>
      <Text mb="md">
        Then wrap your app with <Code>MantineProvider</Code> and use <Code>NavShell</Code> for the layout:
      </Text>
      <Code block>
{`import { MantineProvider } from '@mantine/core';
import { NavShell, NavSidebar, NavGroup } from '@ethanhann/mantine-nav';
import '@mantine/core/styles.css';

function App() {
  return (
    <MantineProvider>
      <NavShell sidebar={<NavSidebar><NavGroup items={items} /></NavSidebar>}>
        <main>Your content</main>
      </NavShell>
    </MantineProvider>
  );
}`}
      </Code>
    </NavShell>
  ),
};
