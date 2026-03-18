// Types
export type {
  NavItem,
  NavItemType,
  NavLinkItem,
  NavGroupItem,
  NavSectionHeader,
  NavDividerItem,
  ActiveMatchStrategy,
  ActiveMatcher,
  NavCSSVariable,
  NavCallbacks,
  SidebarVariant,
  NavAnimationConfig,
  Workspace,
  UserInfo,
} from './types';

// Layout (wraps Mantine AppShell)
export { NavShell, useNavShell, useOptionalNavShell } from './components/NavShell';
export type { NavShellProps, NavShellContextValue } from './components/NavShell';
export { NavSidebar } from './components/NavSidebar';
export type { NavSidebarProps } from './components/NavSidebar';
export { NavHeader } from './components/NavHeader';
export type { NavHeaderProps } from './components/NavHeader';

// Navigation
export { NavGroup } from './components/NavGroup';
export type { NavGroupProps } from './components/NavGroup';

// SaaS Components
export {
  WorkspaceSwitcher,
  UserMenu,
  PlanBadge,
  NotificationIndicator,
  ColorSchemeToggle,
} from './components/SaaS';
export type {
  WorkspaceSwitcherProps,
  UserMenuProps,
  UserMenuItem,
  PlanBadgeProps,
  NotificationIndicatorProps,
  NotificationItem,
  ColorSchemeToggleProps,
} from './components/SaaS';

// Hooks
export {
  useNavItems,
  useActiveNavItem,
  useCurrentPath,
  useNavAnimation,
  useNavVars,
  useNavKeyboard,
  useNavColorScheme,
  useReorderableNav,
  usePinnedItems,
  useSidebarResize,
  useSidebarVariant,
  useResponsiveNav,
  useRecentlyViewed,
  useStarredPages,
  useHeadlessSidebar,
  useIsSSR,
  useHydrated,
} from './hooks';
export type {
  UseNavItemsReturn,
  UseActiveNavItemOptions,
  UseActiveNavItemReturn,
  UseNavAnimationReturn,
  UseNavVarsReturn,
  UseNavKeyboardOptions,
  UseNavKeyboardReturn,
  UseNavColorSchemeReturn,
  UseReorderableNavOptions,
  UseReorderableNavReturn,
  UsePinnedItemsOptions,
  UsePinnedItemsReturn,
  UseSidebarResizeOptions,
  UseSidebarResizeReturn,
  UseSidebarVariantOptions,
  UseSidebarVariantReturn,
  UseResponsiveNavOptions,
  UseResponsiveNavReturn,
  UseRecentlyViewedOptions,
  UseRecentlyViewedReturn,
  RecentItem,
  UseStarredPagesOptions,
  UseStarredPagesReturn,
  StarredPage,
  UseHeadlessSidebarOptions,
  UseHeadlessSidebarReturn,
} from './hooks';
