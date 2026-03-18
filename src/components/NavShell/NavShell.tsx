'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
} from 'react';
import {
  AppShell,
  Burger,
  Group,
  Overlay,
  type MantineBreakpoint,
  type MantineSpacing,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';

/** Context value provided by NavShell to descendant components. */
export interface NavShellContextValue {
  mobileOpened: boolean;
  toggleMobile: () => void;
  openMobile: () => void;
  closeMobile: () => void;
  desktopCollapsed: boolean;
  toggleDesktop: () => void;
  collapseDesktop: () => void;
  expandDesktop: () => void;
  isMobile: boolean;
}

const NavShellContext = createContext<NavShellContextValue | null>(null);

/**
 * Access the NavShell context for sidebar state and mobile toggles.
 *
 * @throws {Error} If used outside of a `<NavShell>` component.
 *
 * @example
 * ```tsx
 * const { desktopCollapsed, toggleDesktop } = useNavShell();
 * ```
 */
export function useNavShell(): NavShellContextValue {
  const ctx = useContext(NavShellContext);
  if (!ctx) {
    throw new Error('useNavShell() must be used within a <NavShell>');
  }
  return ctx;
}

/** Access NavShell context, returning null if not within a NavShell. */
export function useOptionalNavShell(): NavShellContextValue | null {
  return useContext(NavShellContext);
}

/** Props for the NavShell layout component. */
export interface NavShellProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  aside?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  headerHeight?: number;
  sidebarWidth?: number;
  sidebarCollapsedWidth?: number;
  sidebarBreakpoint?: MantineBreakpoint;
  sidebarCollapsible?: boolean;
  defaultDesktopCollapsed?: boolean;
  layout?: 'default' | 'alt';
  withBorder?: boolean;
  padding?: MantineSpacing;
  transitionDuration?: number;
}

/**
 * Top-level layout shell wrapping Mantine's AppShell.
 *
 * Provides responsive sidebar collapse, mobile drawer, and shared context
 * via `useNavShell()` for descendant components.
 *
 * @example
 * ```tsx
 * <NavShell
 *   header={<NavHeader logo={<Logo />} />}
 *   sidebar={<NavSidebar><NavGroup items={items} /></NavSidebar>}
 * >
 *   <main>Page content</main>
 * </NavShell>
 * ```
 */
export function NavShell({
  header,
  sidebar,
  aside,
  footer,
  children,
  headerHeight = 60,
  sidebarWidth = 260,
  sidebarCollapsedWidth = 80,
  sidebarBreakpoint = 'sm',
  sidebarCollapsible = true,
  defaultDesktopCollapsed = false,
  layout = 'default',
  withBorder = true,
  padding = 'md',
  transitionDuration = 200,
}: NavShellProps) {
  const [mobileOpened, { toggle: toggleMobile, open: openMobile, close: closeMobile }] =
    useDisclosure(false);
  const [desktopExpanded, { toggle: toggleDesktopExpanded, open: expandDesktopInner, close: collapseDesktopInner }] =
    useDisclosure(!defaultDesktopCollapsed);

  const desktopCollapsed = sidebarCollapsible ? !desktopExpanded : false;
  const isMobile = useMediaQuery(`(max-width: ${sidebarBreakpoint === 'sm' ? '48em' : sidebarBreakpoint === 'md' ? '62em' : sidebarBreakpoint === 'lg' ? '75em' : '48em'})`) ?? false;

  const toggleDesktop = toggleDesktopExpanded;
  const collapseDesktop = collapseDesktopInner;
  const expandDesktop = expandDesktopInner;

  // Close mobile sidebar on Escape key
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileOpened) {
        closeMobile();
      }
    },
    [mobileOpened, closeMobile],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleEscape]);

  const ctx: NavShellContextValue = {
    mobileOpened,
    toggleMobile,
    openMobile,
    closeMobile,
    desktopCollapsed,
    toggleDesktop,
    collapseDesktop,
    expandDesktop,
    isMobile,
  };

  return (
    <NavShellContext.Provider value={ctx}>
      <AppShell
        header={header ? { height: headerHeight } : undefined}
        navbar={
          sidebar
            ? {
                width: desktopCollapsed ? sidebarCollapsedWidth : sidebarWidth,
                breakpoint: sidebarBreakpoint,
                collapsed: {
                  mobile: !mobileOpened,
                  desktop: false,
                },
              }
            : undefined
        }
        aside={aside ? { width: 300, breakpoint: 'md', collapsed: { mobile: true } } : undefined}
        footer={footer ? { height: 60 } : undefined}
        layout={layout}
        padding={padding}
        withBorder={withBorder}
        transitionDuration={transitionDuration}
      >
        {header && (
          <AppShell.Header>
            <Group h="100%" px="md" wrap="nowrap">
              {sidebar && (
                <Burger
                  opened={mobileOpened}
                  onClick={toggleMobile}
                  hiddenFrom={sidebarBreakpoint}
                  size="sm"
                  aria-label="Toggle navigation"
                />
              )}
              {header}
            </Group>
          </AppShell.Header>
        )}

        {sidebar && (
          <AppShell.Navbar p="sm">
            {sidebar}
          </AppShell.Navbar>
        )}

        {aside && (
          <AppShell.Aside p="md">
            {aside}
          </AppShell.Aside>
        )}

        {/* Backdrop overlay when mobile sidebar is open */}
        {isMobile && mobileOpened && (
          <Overlay
            onClick={closeMobile}
            opacity={0.5}
            color="#000"
            zIndex={100}
          />
        )}

        <AppShell.Main>{children}</AppShell.Main>

        {footer && (
          <AppShell.Footer p="md">
            {footer}
          </AppShell.Footer>
        )}
      </AppShell>
    </NavShellContext.Provider>
  );
}
