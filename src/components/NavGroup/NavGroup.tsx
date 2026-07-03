"use client";

import type { MantineColor } from "@mantine/core";
import { Divider, Menu, NavLink, Text, Tooltip } from "@mantine/core";
import {
	type ReactElement,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { useActiveNavItem } from "../../hooks/useActiveNavItem";
import { useNavKeyboard } from "../../hooks/useNavKeyboard";
import type {
	ActiveMatcher,
	NavCallbacks,
	NavGroupItem,
	NavItemType,
	NavLinkItem,
} from "../../types";
import { sortItemsByWeight } from "../../utils/sorting";
import { filterVisibleItems } from "../../utils/visibility";
import { useOptionalNavShell } from "../NavShell";

/** Props for the navigation item tree component. */
export interface NavGroupProps<TData = unknown> extends NavCallbacks<TData> {
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
	// Keyboard
	enableKeyboardNav?: boolean;
	typeAhead?: boolean;
	typeAheadTimeout?: number;
	loopNavigation?: boolean;
}

interface InternalNavItemProps<TData = unknown> {
	item: NavItemType<TData>;
	depth: number;
	maxDepth: number;
	expandedGroups: Set<string>;
	onToggleGroup: (key: string) => void;
	isActive: (item: NavItemType<TData>) => boolean;
	onItemClick?: NavCallbacks<TData>["onItemClick"];
	onGroupToggle?: NavCallbacks<TData>["onGroupToggle"];
	renderItem?: (item: NavItemType<TData>, depth: number) => ReactNode;
	variant: "subtle" | "light" | "filled";
	color?: MantineColor;
	collapsed?: boolean;
	linkComponent?: React.FunctionComponent<Record<string, unknown>>;
	hrefProp: string;
	/** Id of the single treeitem holding tabIndex=0 (roving tabindex). */
	rovingItemId: string | null;
}

function CollapsedActiveIndicator() {
	return (
		<span
			aria-hidden
			style={{
				position: "absolute",
				left: 0,
				top: "50%",
				transform: "translateY(-50%)",
				width: 3,
				height: "60%",
				borderRadius: 3,
				backgroundColor: "var(--mantine-primary-color-filled)",
			}}
		/>
	);
}

function NavItemRenderer<TData>({
	item,
	depth,
	maxDepth,
	expandedGroups,
	onToggleGroup,
	isActive,
	onItemClick,
	onGroupToggle,
	renderItem,
	variant,
	color,
	collapsed,
	linkComponent,
	hrefProp,
	rovingItemId,
}: InternalNavItemProps<TData>) {
	const itemTabIndex =
		rovingItemId === null ? undefined : item.id === rovingItemId ? 0 : -1;

	if (renderItem) {
		const custom = renderItem(item, depth);

		// Dividers and section headers are not interactive tree nodes.
		if (item.type === "divider" || item.type === "section") {
			return <div role="presentation">{custom}</div>;
		}

		// Wrap custom content so it still participates in keyboard navigation
		// (data-item-id + role="treeitem"), exposes active/expanded a11y state,
		// and routes clicks through the same callbacks as built-in items.
		const active = isActive(item);
		const expanded =
			item.type === "group" ? expandedGroups.has(item.id) : undefined;

		const handleCustomClick = (e: React.MouseEvent) => {
			if (item.disabled) {
				e.preventDefault();
				return;
			}
			if (item.type === "link") {
				if (item.onClick) {
					if (!item.href) e.preventDefault();
					item.onClick(e);
				}
				onItemClick?.(item, e);
			} else if (item.type === "group") {
				onToggleGroup(item.id);
				onGroupToggle?.(item, !expanded);
			}
		};

		return (
			// biome-ignore lint/a11y/useKeyWithClickEvents: keyboard activation is handled at the tree container level via useNavKeyboard (roving tabindex + onKeyDown), not per treeitem.
			<div
				data-item-id={item.id}
				role="treeitem"
				aria-current={item.type === "link" && active ? "page" : undefined}
				aria-selected={item.type === "link" ? active : undefined}
				aria-expanded={expanded}
				aria-disabled={item.disabled || undefined}
				tabIndex={itemTabIndex}
				onClick={handleCustomClick}
			>
				{custom}
			</div>
		);
	}

	if (item.type === "divider") {
		if (collapsed) return null;
		return <Divider my="sm" mx="sm" role="presentation" label={item.label} />;
	}

	if (item.type === "section") {
		if (collapsed) return null;
		return (
			<Text
				size="xs"
				fw={700}
				c="gray.7"
				tt="uppercase"
				px="sm"
				pt="lg"
				pb="xs"
				role="presentation"
				style={{ letterSpacing: "0.05em" }}
			>
				{item.label}
			</Text>
		);
	}

	if (item.type === "link") {
		const active = isActive(item);
		const useRouterLink = linkComponent && !item.external;

		const handleLinkClick = (e: React.MouseEvent) => {
			if (item.disabled) {
				e.preventDefault();
				return;
			}
			if (item.onClick) {
				// Only suppress navigation for pure action items (no href).
				// When an href is present, let the consumer's onClick decide
				// whether to call e.preventDefault() (e.g. analytics before nav).
				if (!item.href) {
					e.preventDefault();
				}
				item.onClick(e);
			}
			onItemClick?.(item, e);
		};

		// In collapsed mode, show icon-only with tooltip
		if (collapsed && depth === 0) {
			const linkDest = useRouterLink
				? { [hrefProp]: item.href }
				: { href: item.href };
			const collapsedProps = {
				label: "" as const,
				leftSection: item.icon,
				...linkDest,
				active,
				variant,
				color,
				disabled: item.disabled,
				"aria-label": item["aria-label"] ?? item.label,
				"aria-current": active ? ("page" as const) : undefined,
				"aria-selected": active,
				"data-item-id": item.id,
				role: "treeitem" as const,
				tabIndex: itemTabIndex,
				styles: {
					root: {
						justifyContent: "center" as const,
						padding: "10px 0",
						paddingInline: 0,
						marginBottom: 4,
						borderRadius: "var(--mantine-radius-sm)",
					},
					section: { marginInlineEnd: 0 },
					body: { display: "none" },
				},
				onClick: handleLinkClick,
			};

			const navLinkEl = item.external ? (
				<NavLink
					component="a"
					target="_blank"
					rel="noopener noreferrer"
					{...collapsedProps}
				/>
			) : useRouterLink ? (
				<NavLink component={linkComponent!} {...collapsedProps} />
			) : (
				<NavLink {...collapsedProps} />
			);

			return (
				<div style={{ position: "relative" }}>
					{active && <CollapsedActiveIndicator />}
					<Tooltip label={item.label} position="right" withArrow>
						{navLinkEl}
					</Tooltip>
				</div>
			);
		}

		const stdLinkDest = useRouterLink
			? { [hrefProp]: item.href }
			: { href: item.href };
		const standardProps = {
			label: item.label,
			leftSection: item.icon,
			rightSection: item.badge,
			...stdLinkDest,
			active,
			variant,
			color,
			disabled: item.disabled,
			"aria-label": item["aria-label"],
			"aria-current": active ? ("page" as const) : undefined,
			"aria-selected": active,
			"data-item-id": item.id,
			role: "treeitem" as const,
			tabIndex: itemTabIndex,
			styles: {
				root: {
					borderRadius: "var(--mantine-radius-sm)",
					marginBottom: 2,
				},
			},
			onClick: handleLinkClick,
		};

		if (item.external) {
			return (
				<NavLink
					component="a"
					target="_blank"
					rel="noopener noreferrer"
					{...standardProps}
				/>
			);
		}
		if (useRouterLink) {
			return <NavLink component={linkComponent!} {...standardProps} />;
		}
		return <NavLink {...standardProps} />;
	}

	// type === 'group'
	const groupItem = item as NavGroupItem<TData>;
	const isExpanded = expandedGroups.has(groupItem.id);
	const groupActive = isActive(groupItem);

	if (depth >= maxDepth) {
		return null;
	}

	// In collapsed mode, show icon-only group with popover submenu
	if (collapsed && depth === 0) {
		const renderRailMenuChildren = (
			children: NavItemType<TData>[],
		): ReactNode[] =>
			children.flatMap((child): ReactNode[] => {
				if (child.type === "section") {
					return [<Menu.Label key={child.id}>{child.label}</Menu.Label>];
				}
				if (child.type === "divider") {
					return [<Menu.Divider key={child.id} />];
				}
				if (child.type === "group") {
					return [
						<Menu.Label key={child.id}>{child.label}</Menu.Label>,
						...renderRailMenuChildren(child.children),
					];
				}

				const useChildRouterLink = linkComponent && !child.external;
				const menuLinkDest = child.href
					? useChildRouterLink
						? { [hrefProp]: child.href }
						: { href: child.href }
					: {};
				const menuItemProps = {
					leftSection: child.icon,
					disabled: child.disabled,
					...menuLinkDest,
					onClick: (e: React.MouseEvent) => {
						if (child.disabled) return;
						if (child.onClick) {
							// Match the expanded-mode link behavior: only suppress
							// navigation for pure action items (no href).
							if (!child.href) e.preventDefault();
							child.onClick(e);
						}
						onItemClick?.(child, e);
					},
				};

				if (child.external) {
					return [
						<Menu.Item
							key={child.id}
							component="a"
							target="_blank"
							rel="noopener noreferrer"
							{...menuItemProps}
						>
							{child.label}
						</Menu.Item>,
					];
				}
				if (linkComponent && child.href) {
					return [
						<Menu.Item
							key={child.id}
							component={linkComponent}
							{...menuItemProps}
						>
							{child.label}
						</Menu.Item>,
					];
				}
				if (child.href) {
					return [
						<Menu.Item key={child.id} component="a" {...menuItemProps}>
							{child.label}
						</Menu.Item>,
					];
				}
				return [
					<Menu.Item key={child.id} {...menuItemProps}>
						{child.label}
					</Menu.Item>,
				];
			});

		return (
			<div style={{ position: "relative" }}>
				{groupActive && <CollapsedActiveIndicator />}
				<Menu position="right-start" withArrow offset={8} withinPortal>
					<Menu.Target>
						<Tooltip label={groupItem.label} position="right" withArrow>
							<NavLink
								label=""
								leftSection={groupItem.icon}
								active={groupActive}
								variant={variant}
								color={color}
								disabled={groupItem.disabled}
								data-item-id={groupItem.id}
								role="treeitem"
								aria-label={groupItem["aria-label"] ?? groupItem.label}
								tabIndex={itemTabIndex}
								styles={{
									root: {
										justifyContent: "center",
										padding: "10px 0",
										paddingInline: 0,
										marginBottom: 4,
										borderRadius: "var(--mantine-radius-sm)",
									},
									section: { marginInlineEnd: 0 },
									body: { display: "none" },
								}}
							/>
						</Tooltip>
					</Menu.Target>
					<Menu.Dropdown>
						<Menu.Label>{groupItem.label}</Menu.Label>
						{renderRailMenuChildren(groupItem.children)}
					</Menu.Dropdown>
				</Menu>
			</div>
		);
	}

	return (
		<NavLink
			label={groupItem.label}
			leftSection={groupItem.icon}
			rightSection={groupItem.badge}
			active={groupActive}
			variant={variant}
			color={color}
			disabled={groupItem.disabled}
			opened={isExpanded}
			data-item-id={groupItem.id}
			role="treeitem"
			aria-label={groupItem["aria-label"]}
			aria-expanded={isExpanded}
			tabIndex={itemTabIndex}
			styles={{
				root: {
					borderRadius: "var(--mantine-radius-sm)",
					marginBottom: 2,
				},
				children: {
					borderLeft: "1px solid var(--mantine-color-default-border)",
					marginLeft: "var(--mantine-spacing-md)",
					paddingLeft: "var(--mantine-spacing-xs)",
				},
			}}
			attributes={{
				collapse: { role: "group" },
			}}
			onClick={() => {
				if (groupItem.disabled) return;
				onToggleGroup(groupItem.id);
				onGroupToggle?.(groupItem, !isExpanded);
			}}
		>
			{groupItem.children.map((child) => (
				<NavItemRenderer
					key={child.id}
					item={child}
					depth={depth + 1}
					maxDepth={maxDepth}
					expandedGroups={expandedGroups}
					onToggleGroup={onToggleGroup}
					isActive={isActive}
					onItemClick={onItemClick}
					onGroupToggle={onGroupToggle}
					renderItem={renderItem}
					variant={variant}
					color={color}
					collapsed={collapsed}
					linkComponent={linkComponent}
					hrefProp={hrefProp}
					rovingItemId={rovingItemId}
				/>
			))}
		</NavLink>
	);
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

// Collect initial defaultOpened, respecting accordion constraints
function collectDefaultExpanded<TData>(
	items: NavItemType<TData>[],
	accordion: boolean,
	accordionScope: "global" | "sibling",
): Set<string> {
	const defaults = new Set<string>();

	if (accordion && accordionScope === "sibling") {
		collectSiblingLevel(items, defaults);
	} else if (accordion && accordionScope === "global") {
		findFirstDefault(items, defaults);
	} else {
		collectAll(items, defaults);
	}

	return defaults;
}

function collectAllGroupIds<TData>(
	items: NavItemType<TData>[],
	out: Set<string> = new Set(),
): Set<string> {
	for (const item of items) {
		if (item.type === "group") {
			out.add(item.id);
			collectAllGroupIds(item.children, out);
		}
	}
	return out;
}

function collectAll<TData>(items: NavItemType<TData>[], out: Set<string>) {
	for (const item of items) {
		if (item.type === "group") {
			if (item.defaultOpened) out.add(item.id);
			collectAll(item.children, out);
		}
	}
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

function findFirstDefault<TData>(
	items: NavItemType<TData>[],
	out: Set<string>,
): boolean {
	for (const item of items) {
		if (item.type === "group") {
			if (item.defaultOpened) {
				out.add(item.id);
				return true;
			}
			if (findFirstDefault(item.children, out)) return true;
		}
	}
	return false;
}

function findLinkByIdOrHref<TData>(
	items: NavItemType<TData>[],
	target: string,
): NavLinkItem<TData> | null {
	for (const item of items) {
		if (item.type === "link" && (item.id === target || item.href === target)) {
			return item;
		}
		if (item.type === "group") {
			const found = findLinkByIdOrHref(item.children, target);
			if (found) return found;
		}
	}
	return null;
}

// Flatten visible items for keyboard navigation
function flattenVisibleItems<TData>(
	items: NavItemType<TData>[],
	expanded: Set<string>,
	maxDepth: number,
	depth: number = 0,
): NavItemType<TData>[] {
	const result: NavItemType<TData>[] = [];
	for (const item of items) {
		if (item.type === "divider" || item.type === "section") continue;
		result.push(item);
		if (item.type === "group" && expanded.has(item.id) && depth < maxDepth) {
			result.push(
				...flattenVisibleItems(item.children, expanded, maxDepth, depth + 1),
			);
		}
	}
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
	// Keyboard
	enableKeyboardNav = true,
	typeAhead = true,
	typeAheadTimeout = 500,
	loopNavigation = true,
}: NavGroupProps<TData>): ReactElement {
	const containerRef = useRef<HTMLDivElement>(null);
	const shell = useOptionalNavShell();

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

	// Auto-close mobile drawer on link click
	const wrappedOnItemClick: NavCallbacks<TData>["onItemClick"] = useCallback(
		(item: NavLinkItem<TData>, event: React.MouseEvent) => {
			onItemClick?.(item, event);
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
		const allIds = collectAllGroupIds(visibleItemTree);
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
			return findLinkByIdOrHref(visibleItemTree, activeItem);
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
				// Click the real DOM node so keyboard activation follows the
				// href natively and runs the same path as a mouse click
				// (item.onClick, onItemClick, mobile drawer close).
				const el = containerRef.current?.querySelector<HTMLElement>(
					`[data-item-id="${CSS.escape(item.id)}"]`,
				);
				el?.click();
			}
		},
		containerRef: containerRef as React.RefObject<HTMLElement>,
		typeAhead,
		typeAheadTimeout,
		loop: loopNavigation,
		enabled: enableKeyboardNav,
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

	return (
		<div
			role="tree"
			aria-label="Navigation"
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
				/>
			))}
		</div>
	);
}
