'use client';

import { type ReactNode } from 'react';
import { Group, Badge, type MantineColor } from '@mantine/core';

export interface NavHeaderProps {
  logo?: ReactNode;
  children?: ReactNode;
  rightSection?: ReactNode;
  environment?: { label: string; color: MantineColor };
}

export function NavHeader({
  logo,
  children,
  rightSection,
  environment,
}: NavHeaderProps) {
  return (
    <Group h="100%" justify="space-between" wrap="nowrap" style={{ flex: 1 }}>
      <Group gap="md" wrap="nowrap">
        {logo}
        {environment && (
          <Badge color={environment.color} variant="light" size="sm">
            {environment.label}
          </Badge>
        )}
      </Group>

      {children && (
        <Group gap="xs" style={{ flex: 1 }} justify="center">
          {children}
        </Group>
      )}

      {rightSection && (
        <Group gap="xs" wrap="nowrap">
          {rightSection}
        </Group>
      )}
    </Group>
  );
}
