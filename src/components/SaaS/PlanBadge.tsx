'use client';

import { type ReactNode } from 'react';
import { Anchor, Badge, Group, type MantineColor } from '@mantine/core';

export interface PlanBadgeProps {
  plan: string;
  color?: MantineColor;
  variant?: 'light' | 'filled' | 'outline' | 'dot';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showUpgrade?: boolean;
  onUpgrade?: () => void;
  upgradeLabel?: string;
  icon?: ReactNode;
}

export function PlanBadge({
  plan,
  color = 'blue',
  variant = 'light',
  size = 'sm',
  showUpgrade = false,
  onUpgrade,
  upgradeLabel = 'Upgrade',
  icon,
}: PlanBadgeProps) {
  return (
    <Group gap="xs">
      <Badge
        color={color}
        variant={variant}
        size={size}
        leftSection={icon}
        role="status"
      >
        {plan}
      </Badge>
      {showUpgrade && (
        <Anchor size="xs" component="button" onClick={onUpgrade}>
          {upgradeLabel}
        </Anchor>
      )}
    </Group>
  );
}
