"use client";

import type { MantineColor } from "@mantine/core";
import { Box, Group, Skeleton, useDirection } from "@mantine/core";
import {
	type ReactElement,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useActiveNavItem, useNavKeyboard } from "../../hooks";
import type {
	ActiveMatcher,
	NavCallbacks,
	NavGroupItem,
	NavItemType,
	NavLinkItem,
	NavSlotStyles,
} from "../../types";
import { sortItemsByWeight } from "../../utils/sorting";
import { findInNavTree, walkNavTree } from "../../utils/traverse";
import { filterVisibleItems } from "../../utils/visibility";
import { useOptionalNavShell } from "../NavShell";
import { NavItemRenderer } from "./NavItemRenderer";

export type NavGroupSlot = "root" | "item" | "section" | "divider";

/** Props for the navigation item tree component. */
export interface NavGroupProps<TData = unknown>
	extends NavCallbacks<TData>,
		NavSlotStyles<NavGroupSlot> {
	items: NavItemType<TData>[];
	maxDepth?: number;
	renderItem?: (item: NavItemType<TData>, depth: number) => ReactNode;
	activeItem?: string | null;
	activeMatcher?: ActiveMatcher;
	currentPath?: string;
	variant?: "subtle" | "light" | "filled";
	color?: MantineColor;
	/** Controlled expanded group ids. When set, pair with onExpandedChange. */
	expandedKeys?: string[];
	/** Called with the intended expanded group ids whenever a group toggles. */
	onExpandedChange?: (expandedIds: string[]) => void;
	// Accordion
	accordion?: boolean;
	accordionScope?: "global" | "sibling";
	onAccordionChange?: (openedKey: string | null) => void;
	/** Accessible name for the tree. @default "Navigation" */
	"aria-label"?: string;
	// Keyboard
	enableKeyboardNav?: boolean;
	typeAhead?: boolean;
	typeAheadTimeout?: number;
	loopNavigation?: boolean;
	/** Show skeleton placeholder rows instead of items. @default false */
	loading?: boolean;
	/** Number of skeleton rows to display when loading. @default 5 */
	skeletonCount?: number;
}

// Collect sibling group IDs at each level
function getSiblingGroupIds<TData>(
	items: NavItemType<TData>[],
	targetId: string,
): string[] {
	for (const item of items) {
		if (item.type === "group") {
			if (item.id === targetId) {
				return items
					.filter((i): i is NavGroupItem<TData> => i.type === "group")
					.map((i) => i.id);
			}
			const found = getSiblingGroupIds(item.children, targetId);
			if (found.length > 0) return found;
		}
	}
	return [];
}

function collectSiblingLevel<TData>(
	items: NavItemType<TData>[],
	out: Set<string>,
) {
	let foundAtThisLevel = false;
	for (const item of items) {
		if (item.type === "group") {
			if (item.defaultOpened && !foundAtThisLevel) {
				out.add(item.id);
				foundAtThisLevel = true;
			}
			collectSiblingLevel(item.children, out);
		}
	}
}

function collectDefaultExpanded<TData>(
	items: NavItemType<TData>[],
	accordion: boolean,
	accordionScope: "global" | "sibling",
): Set<string> {
	const defaults = new Set<string>();

	if (accordion && accordionScope === "sibling") {
		collectSiblingLevel(items, defaults);
	} else if (accordion && accordionScope === "global") {
		walkNavTree(items, (item) => {
			if (item.type === "group" && item.defaultOpened) {
				defaults.add(item.id);
				return "stop";
			}
		});
	} else {
		walkNavTree(items, (item) => {
			if (item.type === "group" && item.defaultOpened) defaults.add(item.id);
		});
	}

	return defaults;
}

function flattenVisibleItems<TData>(
	items: NavItemType<TData>[],
	expanded: Set<string>,
	maxDepth: number,
): NavItemType<TData>[] {
	const result: NavItemType<TData>[] = [];
	walkNavTree(items, (item, depth) => {
		if (item.type === "divider" || item.type === "section") return false;
		result.push(item);
		if (item.type === "group") {
			return expanded.has(item.id) && depth < maxDepth;
		}
	});
	return result;
}

/**
 * Renders a tree of navigation items using Mantine NavLink.
 *
 * Handles multi-level nesting, active state detection, accordion behavior,
 * and keyboard navigation. Adapts to sidebar collapsed state automatically.
 *
 * @example
 * ```tsx
 * <NavGroup
 *   items={navItems}
 *   currentPath="/settings/general"
 *   accordion
 * />
 * ```
 */
export function NavGroup<TData = unknown>({
	items,
	maxDepth = 3,
	renderItem,
	activeItem,
	activeMatcher = "prefix",
	currentPath,
	variant = "light",
	color,
	expandedKeys: expandedKeysProp,
	onExpandedChange,
	onItemClick,
	onGroupToggle,
	onActiveChange,
	// Accordion
	accordion = false,
	accordionScope = "sibling",
	onAccordionChange,
	"aria-label": ariaLabel = "Navigation",
	classNames,
	styles,
	// Keyboard
	enableKeyboardNav = true,
	typeAhead = true,
	typeAheadTimeout = 500,
	loopNavigation = true,
	loading = false,
	skeletonCount = 5,
}: NavGroupProps<TData>): ReactElement {
	const containerRef = useRef<HTMLDivElement>(null);
	const shell = useOptionalNavShell();
	const { dir } = useDirection();

	// Filter out invisible items and sort by weight before any other logic.
	// Memoized so dependent memos/effects see a stable reference per items change.
	const visibleItemTree = useMemo(
		() => sortItemsByWeight(filterVisibleItems(items)),
		[items],
	);

	// Detect collapsed state for icon rail mode
	const isCollapsed = shell ? shell.desktopCollapsed && !shell.isMobile : false;
	const resolvedLinkComponent = shell?.linkComponent as
		| React.FunctionComponent<Record<string, unknown>>
		| undefined;
	const resolvedHrefProp = shell?.hrefProp ?? "href";

	// Auto-close mobile drawer on link click and fire shell-level onNavigate.
	// The `keyboardActivationRef` flag is set by the keyboard `onSelect` path
	// before it calls `el?.click()`, allowing this handler to tag the trigger.
	const keyboardActivationRef = useRef(false);
	const wrappedOnItemClick: NavCallbacks<TData>["onItemClick"] = useCallback(
		(item: NavLinkItem<TData>, event: React.MouseEvent) => {
			onItemClick?.(item, event);
			const trigger = keyboardActivationRef.current ? "keyboard" : "mouse";
			keyboardActivationRef.current = false;
			shell?.onNavigate?.({
				id: item.id,
				label: item.label,
				href: item.href,
				external: item.external,
				data: item.data,
				source: "sidebar",
				trigger,
			});
			if (shell?.isMobile) {
				shell.closeMobile();
			}
		},
		[onItemClick, shell],
	);

	// Manage expanded state with accordion support
	const isExpandedControlled = expandedKeysProp !== undefined;
	const [internalExpandedGroups, setExpandedGroups] = useState<Set<string>>(
		() => collectDefaultExpanded(visibleItemTree, accordion, accordionScope),
	);
	const controlledExpandedGroups = useMemo(
		() => new Set(expandedKeysProp ?? []),
		[expandedKeysProp],
	);
	const expandedGroups = isExpandedControlled
		? controlledExpandedGroups
		: internalExpandedGroups;

	// Groups whose defaultOpened we've already applied. The useState initializer
	// above only runs once, so groups added after mount (e.g. async-loaded nav
	// items) would otherwise never honor defaultOpened. We expand each newly
	// appearing defaultOpened group exactly once, without re-opening groups the
	// user has since collapsed.
	const knownGroupIds = useRef<Set<string> | null>(null);
	useEffect(() => {
		if (isExpandedControlled) return;
		const allIds = new Set<string>();
		walkNavTree(visibleItemTree, (item) => {
			if (item.type === "group") allIds.add(item.id);
		});
		if (knownGroupIds.current === null) {
			// First effect run: defaults already applied by the initializer.
			knownGroupIds.current = allIds;
			return;
		}
		const defaults = collectDefaultExpanded(
			visibleItemTree,
			accordion,
			accordionScope,
		);
		const toOpen: string[] = [];
		for (const id of defaults) {
			if (!knownGroupIds.current.has(id)) toOpen.push(id);
		}
		knownGroupIds.current = allIds;
		if (toOpen.length > 0) {
			setExpandedGroups((prev) => {
				const next = new Set(prev);
				for (const id of toOpen) next.add(id);
				return next;
			});
		}
	}, [visibleItemTree, accordion, accordionScope, isExpandedControlled]);

	// Computed outside the setState updater so onAccordionChange cannot
	// double-fire when React re-invokes updaters (StrictMode).
	const handleToggleGroup = useCallback(
		(key: string) => {
			const next = new Set(expandedGroups);
			if (next.has(key)) {
				next.delete(key);
				if (accordion) onAccordionChange?.(null);
			} else {
				if (accordion) {
					if (accordionScope === "global") {
						next.clear();
					} else {
						const siblings = getSiblingGroupIds(visibleItemTree, key);
						for (const s of siblings) {
							if (s !== key) next.delete(s);
						}
					}
					onAccordionChange?.(key);
				}
				next.add(key);
			}
			onExpandedChange?.(Array.from(next));
			if (!isExpandedControlled) setExpandedGroups(next);
		},
		[
			expandedGroups,
			accordion,
			accordionScope,
			visibleItemTree,
			onAccordionChange,
			onExpandedChange,
			isExpandedControlled,
		],
	);

	// Active state
	const { isActive: isActiveByRoute, activeItem: routeActiveItem } =
		useActiveNavItem(visibleItemTree, {
			currentPath,
			matcher: activeMatcher,
		});

	// The activeItem prop (matched by id or href) overrides route matching.
	const resolvedActiveLink = useMemo(() => {
		if (activeItem !== undefined && activeItem !== null) {
			return findInNavTree(
				visibleItemTree,
				(item) =>
					item.type === "link" &&
					(item.id === activeItem || item.href === activeItem),
			) as NavLinkItem<TData> | null;
		}
		return routeActiveItem;
	}, [activeItem, visibleItemTree, routeActiveItem]);

	const lastActiveIdRef = useRef<string | null>(null);
	useEffect(() => {
		const id = resolvedActiveLink?.id ?? null;
		if (lastActiveIdRef.current === id) return;
		lastActiveIdRef.current = id;
		onActiveChange?.(resolvedActiveLink ?? null);
	}, [resolvedActiveLink, onActiveChange]);

	const isActive = useCallback(
		(item: NavItemType<TData>): boolean => {
			if (activeItem !== undefined && activeItem !== null) {
				if (item.type === "link")
					return item.id === activeItem || item.href === activeItem;
				if (item.type === "group") return item.id === activeItem;
				return false;
			}
			return isActiveByRoute(item);
		},
		[activeItem, isActiveByRoute],
	);

	// Keyboard navigation
	const flatItems = flattenVisibleItems(
		visibleItemTree,
		expandedGroups,
		maxDepth,
	);

	const { handleKeyDown, focusedItemId } = useNavKeyboard({
		items: flatItems,
		treeItems: visibleItemTree,
		expandedKeys: expandedGroups,
		onToggle: handleToggleGroup,
		onSelect: (item) => {
			if (item.type === "link") {
				const el = containerRef.current?.querySelector<HTMLElement>(
					`[data-item-id="${CSS.escape(item.id)}"]`,
				);
				// Only arm the keyboard-trigger flag when the click will actually
				// fire. Otherwise a missing element (e.g. inside a collapsed group)
				// would leave the flag set and mistag the next mouse click.
				if (el) {
					keyboardActivationRef.current = true;
					el.click();
				}
			}
		},
		containerRef: containerRef as React.RefObject<HTMLElement>,
		typeAhead,
		typeAheadTimeout,
		loop: loopNavigation,
		enabled: enableKeyboardNav,
		dir,
	});

	// Roving tabindex: exactly one treeitem is tabbable. The last focused item
	// wins, then the active link, then the first visible item.
	const rovingItemId = !enableKeyboardNav
		? null
		: focusedItemId && flatItems.some((item) => item.id === focusedItemId)
			? focusedItemId
			: (flatItems.find((item) => item.type === "link" && isActive(item))?.id ??
				flatItems[0]?.id ??
				null);

	if (loading) {
		const widths = ["60%", "75%", "45%", "80%", "55%", "70%", "50%", "65%"];
		return (
			<Box
				data-testid="nav-group-loading"
				className={classNames?.root}
				style={styles?.root}
			>
				{Array.from({ length: skeletonCount }, (_, i) => (
					<Group
						// biome-ignore lint/suspicious/noArrayIndexKey: static decorative placeholders with no identity and no reordering
						key={i}
						data-skeleton-row
						gap="sm"
						wrap="nowrap"
						py={4}
						px="sm"
						style={{
							borderRadius: "var(--mantine-radius-sm)",
							marginBottom: 2,
						}}
					>
						<Skeleton circle height={18} width={18} />
						<Skeleton
							height={12}
							width={widths[i % widths.length]}
							radius="sm"
						/>
					</Group>
				))}
			</Box>
		);
	}

	return (
		<div
			role="tree"
			aria-label={ariaLabel}
			className={classNames?.root}
			style={styles?.root}
			ref={containerRef}
			tabIndex={enableKeyboardNav ? -1 : undefined}
			onKeyDown={
				enableKeyboardNav
					? (handleKeyDown as React.KeyboardEventHandler<HTMLDivElement>)
					: undefined
			}
		>
			{visibleItemTree.map((item) => (
				<NavItemRenderer
					key={item.id}
					item={item}
					depth={0}
					maxDepth={maxDepth}
					expandedGroups={expandedGroups}
					onToggleGroup={handleToggleGroup}
					isActive={isActive}
					onItemClick={wrappedOnItemClick}
					onGroupToggle={onGroupToggle}
					renderItem={renderItem}
					variant={variant}
					color={color}
					collapsed={isCollapsed}
					linkComponent={resolvedLinkComponent}
					hrefProp={resolvedHrefProp}
					rovingItemId={rovingItemId}
					slotClassNames={classNames}
					slotStyles={styles}
					dir={dir}
				/>
			))}
		</div>
	);
}
