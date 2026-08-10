import type {
	NavCallbacks,
	NavGroupItem,
	NavGroupSlot,
	NavItemType,
	NavSlotStyles,
} from "@ethanhann/mantine-nav";
import type { MantineColor } from "@mantine/core";
import { Divider, Menu, NavLink, Text, Tooltip } from "@mantine/core";
import type { ReactNode } from "react";
import { CollapsedActiveIndicator } from "./CollapsedActiveIndicator";

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
	slotClassNames?: NavSlotStyles<NavGroupSlot>["classNames"];
	slotStyles?: NavSlotStyles<NavGroupSlot>["styles"];
	dir: "ltr" | "rtl";
}

export function NavItemRenderer<TData>({
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
	slotClassNames,
	slotStyles,
	dir,
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
				className={slotClassNames?.item}
				style={slotStyles?.item}
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
		return (
			<Divider
				my="sm"
				mx="sm"
				role="presentation"
				label={item.label}
				className={slotClassNames?.divider}
				style={slotStyles?.divider}
			/>
		);
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
				className={slotClassNames?.section}
				style={{ letterSpacing: "0.05em", ...slotStyles?.section }}
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
				className: slotClassNames?.item,
				style: slotStyles?.item,
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
					<Tooltip
						label={item.label}
						position={dir === "rtl" ? "left" : "right"}
						withArrow
					>
						{navLinkEl}
					</Tooltip>
				</div>
			);
		}

		const stdLinkDest = useRouterLink
			? { [hrefProp]: item.href }
			: { href: item.href };
		const standardProps = {
			className: slotClassNames?.item,
			style: slotStyles?.item,
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
				<Menu
					position={dir === "rtl" ? "left-start" : "right-start"}
					withArrow
					offset={8}
					withinPortal
				>
					<Menu.Target>
						<Tooltip
							label={groupItem.label}
							position={dir === "rtl" ? "left" : "right"}
							withArrow
						>
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
			className={slotClassNames?.item}
			style={slotStyles?.item}
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
					borderInlineStart: "1px solid var(--mantine-color-default-border)",
					marginInlineStart: "var(--mantine-spacing-md)",
					paddingInlineStart: "var(--mantine-spacing-xs)",
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
					slotClassNames={slotClassNames}
					slotStyles={slotStyles}
					dir={dir}
				/>
			))}
		</NavLink>
	);
}
