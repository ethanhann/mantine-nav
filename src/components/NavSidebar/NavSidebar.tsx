'use client';

import { type ReactNode } from 'react';
import { AppShell, ScrollArea, ActionIcon, Tooltip } from '@mantine/core';
import { IconChevronsLeft } from '@tabler/icons-react';
import { useNavShell } from '../NavShell';

/** Props for the sidebar content component. */
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
        w="100%"
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

/**
 * Sidebar content with optional header, scrollable body, and footer sections.
 *
 * Renders inside `AppShell.Navbar` and includes an optional collapse toggle
 * that integrates with `NavShell`'s sidebar state.
 *
 * @example
 * ```tsx
 * <NavSidebar
 *   header={<WorkspaceSwitcher ... />}
 *   footer={<UserMenu ... />}
 * >
 *   <NavGroup items={navItems} />
 * </NavSidebar>
 * ```
 */
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
