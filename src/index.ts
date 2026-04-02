// Types

export type { NavGroupProps } from "./components/NavGroup";
// Navigation
export { NavGroup } from "./components/NavGroup";
export type { NavHeaderProps } from "./components/NavHeader";
export { NavHeader } from "./components/NavHeader";
export type {
	NavShellContextValue,
	NavShellProps,
} from "./components/NavShell";
// Layout (wraps Mantine AppShell)
export {
	NavShell,
	useNavShell,
	useOptionalNavShell,
} from "./components/NavShell";
export type { NavSidebarProps } from "./components/NavSidebar";
export { NavSidebar } from "./components/NavSidebar";
export type {
	ColorSchemeToggleProps,
	NotificationIndicatorProps,
	NotificationItem,
	PlanBadgeProps,
	UserMenuItem,
	UserMenuProps,
	WorkspaceSwitcherProps,
} from "./components/SaaS";

// SaaS Components
export {
	ColorSchemeToggle,
	NotificationIndicator,
	PlanBadge,
	UserMenu,
	WorkspaceSwitcher,
} from "./components/SaaS";
export type {
	NavItemResolvers,
	NavRegistryEntry,
	RecentItem,
	RemoteNavItem,
	StarredPage,
	UseActiveNavItemOptions,
	UseActiveNavItemReturn,
	UseHeadlessSidebarOptions,
	UseHeadlessSidebarReturn,
	UseNavAnimationReturn,
	UseNavColorSchemeReturn,
	UseNavItemsReturn,
	UseNavKeyboardOptions,
	UseNavKeyboardReturn,
	UseNavRegistryReturn,
	UseNavVarsReturn,
	UsePinnedItemsOptions,
	UsePinnedItemsReturn,
	UseRecentlyViewedOptions,
	UseRecentlyViewedReturn,
	UseRemoteNavItemsOptions,
	UseRemoteNavItemsReturn,
	UseReorderableNavOptions,
	UseReorderableNavReturn,
	UseResponsiveNavOptions,
	UseResponsiveNavReturn,
	UseSidebarResizeOptions,
	UseSidebarResizeReturn,
	UseSidebarVariantOptions,
	UseSidebarVariantReturn,
	UseStarredPagesOptions,
	UseStarredPagesReturn,
} from "./hooks";
// Hooks
export {
	useActiveNavItem,
	useCurrentPath,
	useHeadlessSidebar,
	useHydrated,
	useIsSSR,
	useNavAnimation,
	useNavColorScheme,
	useNavItems,
	useNavKeyboard,
	useNavRegistry,
	useNavVars,
	usePinnedItems,
	useRecentlyViewed,
	useRemoteNavItems,
	useReorderableNav,
	useResponsiveNav,
	useSidebarResize,
	useSidebarVariant,
	useStarredPages,
} from "./hooks";
export type {
	ActiveMatcher,
	ActiveMatchStrategy,
	NavAnimationConfig,
	NavCallbacks,
	NavCSSVariable,
	NavDividerItem,
	NavGroupItem,
	NavItem,
	NavItemType,
	NavLinkItem,
	NavSectionHeader,
	SidebarVariant,
	UserInfo,
	Workspace,
} from "./types";
export { sortItemsByWeight } from "./utils/sorting";
// Utilities
export { filterVisibleItems, isItemVisible } from "./utils/visibility";
