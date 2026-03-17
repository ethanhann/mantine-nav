// Styles
import './styles/variables.css';

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
  NavGroupProps as NavGroupPropsType,
  SidebarProps as SidebarPropsType,
  NavBarProps as NavBarPropsType,
  NavLayoutProps as NavLayoutPropsType,
  Workspace,
  UserInfo,
  NavConfig,
  NavColorConfig,
} from './types';

// Core Components
export { NavGroup } from './components/NavGroup';
export type { NavGroupProps } from './components/NavGroup';
export { NavProvider, NavContext } from './components/NavProvider';
export type { NavProviderProps, NavAPI } from './components/NavProvider';
export { Sidebar } from './components/Sidebar';
export type { SidebarProps, SidebarRef } from './components/Sidebar';
export { NavSection } from './components/NavSection';
export type { NavSectionProps } from './components/NavSection';
export { NavIconProvider, useNavIcon } from './components/NavIconProvider';
export type { NavIconProviderProps, UseNavIconReturn, IconResolver } from './components/NavIconProvider';

// NavBar Components
export { NavBar, NavBreadcrumbs, EnvironmentIndicator, CommandPaletteSlot } from './components/NavBar';
export type { NavBarProps, NavBreadcrumbsProps, EnvironmentIndicatorProps, CommandPaletteSlotProps } from './components/NavBar';

// Layout
export { Nav, NavLayout } from './components/Nav';
export type { NavProps, NavLayoutProps } from './components/Nav';

// Theme
export { NavThemeProvider, useNavTheme } from './components/NavThemeProvider';
export type { NavThemeProviderProps, NavPreset } from './components/NavThemeProvider';

// SaaS Components
export {
  WorkspaceSwitcher,
  UserMenu,
  PlanBadge,
  NotificationBell,
  OnboardingProgress,
  NavFeatureFlagProvider,
  FeatureGate,
  useFeatureFlag,
  InviteTeamCTA,
} from './components/SaaS';
export type {
  WorkspaceSwitcherProps,
  UserMenuProps,
  PlanBadgeProps,
  NotificationBellProps,
  Notification,
  OnboardingProgressProps,
  OnboardingStep,
  NavFeatureFlagProviderProps,
  FeatureGateProps,
  InviteTeamCTAProps,
} from './components/SaaS';

// Dashboard Components
export {
  DashboardSwitcher,
  FilterIndicator,
  LiveDataStatus,
  FilterPanel,
} from './components/Dashboard';
export type {
  DashboardSwitcherProps,
  Dashboard,
  FilterIndicatorProps,
  ActiveFilter,
  LiveDataStatusProps,
  ConnectionStatus,
  FilterPanelProps,
} from './components/Dashboard';

// Hooks
export {
  useNav,
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
