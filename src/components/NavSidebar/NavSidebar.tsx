'use client';

import { type ReactNode } from 'react';
import { AppShell, ScrollArea, ActionIcon, Tooltip } from '@mantine/core';
import { IconChevronsLeft } from '@tabler/icons-react';
import { useNavShell } from '../NavShell';

export interface NavSidebarProps {
  header?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  showCollapseToggle?: boolean;
  collapseTogglePosition?: 'header' | 'footer';
}

function CollapseToggle() {
  const { desktopCollapsed, toggleDesktop } = useNavShell();
  return (
    <Tooltip
      label={desktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      position="right"
    >
      <ActionIcon
        variant="subtle"
        onClick={toggleDesktop}
        aria-label={desktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        color="gray"
        style={{ width: '100%' }}
      >
        <IconChevronsLeft
          size={16}
          style={{
            transform: desktopCollapsed ? 'rotate(180deg)' : undefined,
            transition: 'transform 200ms ease',
          }}
        />
      </ActionIcon>
    </Tooltip>
  );
}

export function NavSidebar({
  header,
  children,
  footer,
  showCollapseToggle = true,
  collapseTogglePosition = 'footer',
}: NavSidebarProps) {
  let shellAvailable = true;
  try {
    useNavShell();
  } catch {
    shellAvailable = false;
  }

  return (
    <>
      {header && (
        <AppShell.Section>
          {header}
          {shellAvailable && collapseTogglePosition === 'header' && showCollapseToggle && (
            <CollapseToggle />
          )}
        </AppShell.Section>
      )}

      <AppShell.Section grow component={ScrollArea} type="hover">
        {children}
      </AppShell.Section>

      {(footer || (shellAvailable && collapseTogglePosition === 'footer' && showCollapseToggle)) && (
        <AppShell.Section>
          {footer}
          {shellAvailable && collapseTogglePosition === 'footer' && showCollapseToggle && (
            <CollapseToggle />
          )}
        </AppShell.Section>
      )}
    </>
  );
}
