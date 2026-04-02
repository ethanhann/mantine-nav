'use client';

import { Fragment, type ReactNode } from 'react';
import {
  Avatar,
  Box,
  Group,
  Menu,
  Text,
  UnstyledButton,
  type MantineColor,
} from '@mantine/core';
import type { UserInfo } from '../../types';

export interface UserMenuItem {
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  color?: MantineColor;
  dividerBefore?: boolean;
}

/** Props for the user menu dropdown. */
export interface UserMenuProps {
  user: UserInfo;
  menuItems?: UserMenuItem[];
  showRole?: boolean;
  showEmail?: boolean;
  avatarSize?: number | string;
}

/**
 * User avatar with dropdown menu for profile actions.
 *
 * Displays the user's name, optional role/email, and a menu with
 * configurable actions like profile, settings, and sign out.
 *
 * @example
 * ```tsx
 * <UserMenu
 *   user={{ id: '1', name: 'Jane', email: 'jane@acme.com', role: 'Admin' }}
 *   menuItems={[
 *     { label: 'Profile', onClick: () => navigate('/profile') },
 *     { label: 'Sign out', onClick: signOut, color: 'red', dividerBefore: true },
 *   ]}
 * />
 * ```
 */
export function UserMenu({
  user,
  menuItems = [],
  showRole = true,
  showEmail = false,
  avatarSize = 'sm',
}: UserMenuProps) {
  return (
    <Menu width={200} position="top-start" withinPortal>
      <Menu.Target>
        <UnstyledButton
          p="xs"
          w="100%"
          aria-label={`User menu for ${user.name}`}
          style={{ borderRadius: 'var(--mantine-radius-sm)' }}
        >
          <Group gap="sm" wrap="nowrap">
            <Avatar
              src={user.avatarUrl}
              size={avatarSize}
              radius="xl"
              name={user.name}
              color="initials"
            />
            <Box flex={1} miw={0}>
              <Text size="sm" fw={500} truncate>
                {user.name}
              </Text>
              {showRole && user.role && (
                <Text size="xs" c="dimmed" truncate>
                  {user.role}
                </Text>
              )}
              {showEmail && user.email && (
                <Text size="xs" c="dimmed" truncate>
                  {user.email}
                </Text>
              )}
            </Box>
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{user.name}</Menu.Label>
        {user.email && <Menu.Label>{user.email}</Menu.Label>}
        <Menu.Divider />
        {menuItems.map((item) => (
          <Fragment key={item.label}>
            {item.dividerBefore && <Menu.Divider />}
            <Menu.Item
              leftSection={item.icon}
              color={item.color}
              onClick={item.onClick}
              component={item.href ? 'a' : undefined}
              {...(item.href ? { href: item.href } : {})}
            >
              {item.label}
            </Menu.Item>
          </Fragment>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
