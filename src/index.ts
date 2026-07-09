// Types

export type {
	ColorMode,
	ColorModePickerProps,
} from "./components/ColorModePicker";
export { ColorModePicker } from "./components/ColorModePicker";
// Command Palette (wraps @mantine/spotlight)
export type {
	CommandPaletteAction,
	CommandPaletteGroupLabels,
	CommandPaletteProps,
} from "./components/CommandPalette";
export { CommandPalette } from "./components/CommandPalette";
// Generic context switcher (WorkspaceSwitcher is a preset over it)
export type {
	ContextItem,
	ContextSwitcherAction,
	ContextSwitcherItemState,
	ContextSwitcherLabels,
	ContextSwitcherProps,
	ContextSwitcherTargetState,
} from "./components/ContextSwitcher";
export { ContextSwitcher } from "./components/ContextSwitcher";
export type {
	NavBreadcrumbsLabels,
	NavBreadcrumbsProps,
	NavBreadcrumbsSlot,
} from "./components/NavBreadcrumbs";
export { NavBreadcrumbs } from "./components/NavBreadcrumbs";
export type { NavGroupProps, NavGroupSlot } from "./components/NavGroup";
// Navigation
export { NavGroup } from "./components/NavGroup";
export type { NavHeaderProps, NavHeaderSlot } from "./components/NavHeader";
export { NavHeader } from "./components/NavHeader";
export type {
	NavBurgerProps,
	NavShellContextValue,
	NavShellProps,
	NavShellSlot,
} from "./components/NavShell";
// Layout (wraps Mantine AppShell)
export {
	NavBurger,
	NavShell,
	useNavShell,
	useOptionalNavShell,
} from "./components/NavShell";
export type {
	NavSidebarLabels,
	NavSidebarProps,
	NavSidebarSlot,
} from "./components/NavSidebar";
export { NavSidebar } from "./components/NavSidebar";
export type {
	NotificationIndicatorProps,
	NotificationItem,
	PlanBadgeProps,
	UserMenuItem,
	UserMenuProps,
	WorkspaceSwitcherProps,
} from "./components/SaaS";

// SaaS Components
export {
	NotificationIndicator,
	PlanBadge,
	UserMenu,
	WorkspaceSwitcher,
} from "./components/SaaS";
// Hooks
export type {
	BreadcrumbEntry,
	CommandSearchFn,
	CommandSearchResult,
	NavItemResolvers,
	NavRegistryEntry,
	RecentItem,
	RemoteNavItem,
	SidebarMode,
	StarredPage,
	UseActiveNavItemOptions,
	UseActiveNavItemReturn,
	UseNavBreadcrumbsOptions,
	UseNavBreadcrumbsReturn,
	UseCommandPaletteReturn,
	UseCommandSearchOptions,
	UseCommandSearchReturn,
	UseExpandedKeysReturn,
	UseHeadlessSidebarOptions,
	UseHeadlessSidebarReturn,
	UseNavAnimationReturn,
	UseNavColorSchemeReturn,
	UseNavItemsReturn,
	UseNavKeyboardOptions,
	UseNavKeyboardReturn,
	UseNavRegistryReturn,
	UseNavVarsReturn,
	UsePersistedListOptions,
	UsePersistedListReturn,
	UsePinnedItemsOptions,
	UsePinnedItemsReturn,
	UseRecentlyViewedOptions,
	UseRecentlyViewedReturn,
	UseRemoteNavItemsOptions,
	UseRemoteNavItemsReturn,
	UseResponsiveNavOptions,
	UseResponsiveNavReturn,
	UseSidebarResizeOptions,
	UseSidebarResizeReturn,
	UseSidebarVariantOptions,
	UseSidebarVariantReturn,
	UseStarredPagesOptions,
	UseStarredPagesReturn,
} from "./hooks";
export {
	collectGroupIds,
	commandPaletteControls,
	commandPaletteStore,
	useActiveNavItem,
	useNavBreadcrumbs,
	useCommandPalette,
	useCommandSearch,
	useCurrentPath,
	useExpandedKeys,
	useHeadlessSidebar,
	useHydrated,
	useIsSSR,
	useNavAnimation,
	useNavColorScheme,
	useNavItems,
	useNavKeyboard,
	useNavRegistry,
	useNavVars,
	usePersistedList,
	usePinnedItems,
	useRecentlyViewed,
	useRemoteNavItems,
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
	NavItemBase,
	NavItemType,
	NavigateEvent,
	NavigateSource,
	NavigateTrigger,
	NavLinkItem,
	NavSectionHeader,
	NavSlotStyles,
	SidebarVariant,
	UserInfo,
	Workspace,
} from "./types";
// Utilities
export { matchItem } from "./utils/matchItem";
export type { NavCommand } from "./utils/flatten";
export { flattenNavCommands } from "./utils/flatten";
export type { FuzzyResult, RankedItem } from "./utils/fuzzy";
export { fuzzyMatch, rankCommands } from "./utils/fuzzy";
export { sortItemsByWeight } from "./utils/sorting";
export { flattenNavTree, walkNavTree } from "./utils/traverse";
export { filterVisibleItems, isItemVisible } from "./utils/visibility";
