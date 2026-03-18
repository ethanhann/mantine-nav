import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Text, Title, Card, SimpleGrid, Group, Badge } from '@mantine/core';
import {
  IconHome,
  IconUsers,
  IconSettings,
  IconChartBar,
  IconFileText,
  IconShield,
  IconDatabase,
  IconServer,
} from '@tabler/icons-react';
import {
  NavShell,
  NavSidebar,
  NavHeader,
  NavGroup,
  WorkspaceSwitcher,
  UserMenu,
  NotificationIndicator,
  PlanBadge,
} from '../../src';
import type { NavItemType } from '../../src';
import { sampleUser, sampleUserMenuItems, sampleWorkspaces, sampleNotifications } from '../_data';

const adminItems: NavItemType[] = [
  { id: 'dashboard', type: 'link', label: 'Dashboard', href: '/admin', icon: <IconHome size={18} stroke={1.5} /> },
  { id: 'section-manage', type: 'section', label: 'Manage' },
  { id: 'users', type: 'link', label: 'Users', href: '/admin/users', icon: <IconUsers size={18} stroke={1.5} />, badge: <Badge size="xs" variant="light">248</Badge> },
  {
    id: 'content',
    type: 'group',
    label: 'Content',
    icon: <IconFileText size={18} stroke={1.5} />,
    defaultOpened: true,
    children: [
      { id: 'pages', type: 'link', label: 'Pages', href: '/admin/content/pages' },
      { id: 'media', type: 'link', label: 'Media', href: '/admin/content/media' },
    ],
  },
  { id: 'analytics', type: 'link', label: 'Analytics', href: '/admin/analytics', icon: <IconChartBar size={18} stroke={1.5} /> },
  { id: 'div-1', type: 'divider' },
  { id: 'section-system', type: 'section', label: 'System' },
  { id: 'security', type: 'link', label: 'Security', href: '/admin/security', icon: <IconShield size={18} stroke={1.5} /> },
  { id: 'database', type: 'link', label: 'Database', href: '/admin/database', icon: <IconDatabase size={18} stroke={1.5} /> },
  { id: 'infrastructure', type: 'link', label: 'Infrastructure', href: '/admin/infra', icon: <IconServer size={18} stroke={1.5} /> },
  { id: 'settings', type: 'link', label: 'Settings', href: '/admin/settings', icon: <IconSettings size={18} stroke={1.5} /> },
];

const meta: Meta = {
  title: 'Recipes/AdminDashboard',
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
          logo={<Text fw={700} size="lg">Admin Panel</Text>}
          environment={{ label: 'Production', color: 'green' }}
          rightSection={
            <Group gap="xs">
              <PlanBadge plan="Enterprise" color="teal" />
              <NotificationIndicator count={3} notifications={sampleNotifications} />
            </Group>
          }
        />
      }
      sidebar={
        <NavSidebar
          header={
            <WorkspaceSwitcher
              workspaces={sampleWorkspaces}
              activeWorkspace={sampleWorkspaces[0]!}
              onSwitch={() => {}}
              searchable
            />
          }
          footer={
            <UserMenu user={sampleUser} menuItems={sampleUserMenuItems} showEmail />
          }
        >
          <NavGroup items={adminItems} currentPath="/admin" />
        </NavSidebar>
      }
    >
      <Title order={2} mb="md">Dashboard</Title>
      <SimpleGrid cols={3} mb="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={500}>Total Users</Text>
          <Text size="xl" fw={700}>1,248</Text>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={500}>Active Sessions</Text>
          <Text size="xl" fw={700}>342</Text>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={500}>API Requests</Text>
          <Text size="xl" fw={700}>12.4k</Text>
        </Card>
      </SimpleGrid>
    </NavShell>
  ),
};
