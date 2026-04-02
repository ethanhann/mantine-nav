import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Text, Title, Card, Stack, Group, Badge, Anchor } from '@mantine/core';
import {
  IconHome,
  IconLayoutDashboard,
  IconSettings,
  IconUsers,
  IconCreditCard,
  IconWebhook,
  IconKey,
  IconBrandSlack,
} from '@tabler/icons-react';
import {
  NavShell,
  NavSidebar,
  NavHeader,
  NavGroup,
  WorkspaceSwitcher,
  UserMenu,
  PlanBadge,
  NotificationIndicator,
} from '../../src';
import type { NavItemType } from '../../src';
import { sampleUser, sampleUserMenuItems, sampleNotifications } from '../_data';

const saasWorkspaces = [
  { id: '1', name: 'Acme Corp' },
  { id: '2', name: 'Personal' },
];

const saasItems: NavItemType[] = [
  { id: 'home', type: 'link', label: 'Home', href: '/', icon: <IconHome size={18} stroke={1.5} /> },
  { id: 'projects', type: 'link', label: 'Projects', href: '/projects', icon: <IconLayoutDashboard size={18} stroke={1.5} />, badge: <Badge size="xs" variant="light" color="blue">3</Badge> },
  { id: 'team', type: 'link', label: 'Team', href: '/team', icon: <IconUsers size={18} stroke={1.5} /> },
  { id: 'div-1', type: 'divider' },
  { id: 'section-dev', type: 'section', label: 'Developer' },
  { id: 'api-keys', type: 'link', label: 'API Keys', href: '/api-keys', icon: <IconKey size={18} stroke={1.5} /> },
  { id: 'webhooks', type: 'link', label: 'Webhooks', href: '/webhooks', icon: <IconWebhook size={18} stroke={1.5} /> },
  {
    id: 'integrations',
    type: 'group',
    label: 'Integrations',
    icon: <IconBrandSlack size={18} stroke={1.5} />,
    children: [
      { id: 'slack', type: 'link', label: 'Slack', href: '/integrations/slack' },
      { id: 'github', type: 'link', label: 'GitHub', href: '/integrations/github' },
    ],
  },
  { id: 'div-2', type: 'divider' },
  { id: 'billing', type: 'link', label: 'Billing', href: '/billing', icon: <IconCreditCard size={18} stroke={1.5} /> },
  { id: 'settings', type: 'link', label: 'Settings', href: '/settings', icon: <IconSettings size={18} stroke={1.5} /> },
];

const meta: Meta = {
  title: 'Recipes/SaasPlatform',
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
          logo={<Text fw={700} size="lg">SaaSify</Text>}
          rightSection={
            <Group gap="xs">
              <PlanBadge plan="Pro" color="violet" showUpgrade onUpgrade={() => {}} />
              <NotificationIndicator count={2} notifications={sampleNotifications.slice(0, 2)} />
            </Group>
          }
        />
      }
      sidebar={
        <NavSidebar
          header={
            <WorkspaceSwitcher
              workspaces={saasWorkspaces}
              activeWorkspace={saasWorkspaces[0]!}
              onSwitch={() => {}}
              searchable
              onCreate={() => {}}
            />
          }
          footer={
            <UserMenu user={sampleUser} menuItems={sampleUserMenuItems} showEmail />
          }
        >
          <NavGroup items={saasItems} currentPath="/projects" />
        </NavSidebar>
      }
    >
      <Title order={2} mb="md">Projects</Title>
      <Stack gap="md">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text fw={500}>Landing Page Redesign</Text>
            <Badge color="green" variant="light">Active</Badge>
          </Group>
          <Text size="sm" c="dimmed">Last updated 2 hours ago</Text>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text fw={500}>API v2 Migration</Text>
            <Badge color="yellow" variant="light">In Progress</Badge>
          </Group>
          <Text size="sm" c="dimmed">Last updated 5 hours ago</Text>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text fw={500}>Documentation Site</Text>
            <Badge color="blue" variant="light">Planning</Badge>
          </Group>
          <Text size="sm" c="dimmed">Last updated 1 day ago</Text>
        </Card>
      </Stack>
    </NavShell>
  ),
};
