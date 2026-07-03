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
	ContextSwitcherProps,
	ContextSwitcherTargetState,
} from "./components/ContextSwitcher";
export { ContextSwitcher } from "./components/ContextSwitcher";
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
export {
	collectGroupIds,
	commandPaletteControls,
	commandPaletteStore,
	useActiveNavItem,
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
	NavItemBase,
	NavItemType,
	NavLinkItem,
	NavSectionHeader,
	SidebarVariant,
	UserInfo,
	Workspace,
} from "./types";
// Utilities
export type { NavCommand } from "./utils/flatten";
export { flattenNavCommands } from "./utils/flatten";
export type { FuzzyResult, RankedItem } from "./utils/fuzzy";
export { fuzzyMatch, rankCommands } from "./utils/fuzzy";
export { sortItemsByWeight } from "./utils/sorting";
export { filterVisibleItems, isItemVisible } from "./utils/visibility";
