"use client";

import { useCallback, useState } from "react";
import type { NavItemType, SidebarVariant } from "../types";

export interface UseHeadlessSidebarOptions<TData = unknown> {
	items: NavItemType<TData>[];
	defaultExpanded?: string[];
	defaultCollapsed?: boolean;
	defaultVariant?: SidebarVariant;
}

export interface UseHeadlessSidebarReturn<TData = unknown> {
	// State
	items: NavItemType<TData>[];
	expandedKeys: Set<string>;
	collapsed: boolean;
	variant: SidebarVariant;
	activeItemId: string | null;

	// Actions
	toggleGroup: (key: string) => void;
	expandGroup: (key: string) => void;
	collapseGroup: (key: string) => void;
	expandAll: () => void;
	collapseAll: () => void;
	setCollapsed: (collapsed: boolean) => void;
	toggleCollapsed: () => void;
	setVariant: (variant: SidebarVariant) => void;
	setActiveItem: (id: string | null) => void;

	// Prop getters
	getItemProps: (item: NavItemType<TData>) => {
		role: string;
		tabIndex: number;
		"aria-expanded"?: boolean;
		"aria-current"?: "page" | undefined;
		"data-active"?: boolean;
		"data-disabled"?: boolean;
	};
	getGroupProps: (item: NavItemType<TData>) => {
		role: string;
	};
	getRootProps: () => {
		role: string;
		"aria-label": string;
	};
}

export function useHeadlessSidebar<TData = unknown>({
	items,
	defaultExpanded = [],
	defaultCollapsed = false,
	defaultVariant = "full",
}: UseHeadlessSidebarOptions<TData>): UseHeadlessSidebarReturn<TData> {
	const [expandedKeys, setExpandedKeys] = useState<Set<string>>(
		new Set(defaultExpanded),
	);
	const [collapsed, setCollapsed] = useState(defaultCollapsed);
	const [variant, setVariant] = useState<SidebarVariant>(defaultVariant);
	const [activeItemId, setActiveItem] = useState<string | null>(null);

	const toggleGroup = useCallback((key: string) => {
		setExpandedKeys((prev) => {
			const next = new Set(prev);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		});
	}, []);

	const expandGroup = useCallback((key: string) => {
		setExpandedKeys((prev) => new Set(prev).add(key));
	}, []);

	const collapseGroup = useCallback((key: string) => {
		setExpandedKeys((prev) => {
			const next = new Set(prev);
			next.delete(key);
			return next;
		});
	}, []);

	const expandAll = useCallback(() => {
		const keys: string[] = [];
		function collect(items: NavItemType<TData>[]) {
			for (const item of items) {
				if (item.type === "group") {
					keys.push(item.id);
					collect(item.children);
				}
			}
		}
		collect(items);
		setExpandedKeys(new Set(keys));
	}, [items]);

	const collapseAll = useCallback(() => setExpandedKeys(new Set()), []);
	const toggleCollapsed = useCallback(() => setCollapsed((v) => !v), []);

	const getItemProps = useCallback(
		(item: NavItemType<TData>) => ({
			role: "treeitem" as const,
			tabIndex: -1,
			...(item.type === "group"
				? { "aria-expanded": expandedKeys.has(item.id) }
				: {}),
			...(item.type === "link" && item.id === activeItemId
				? { "aria-current": "page" as const }
				: {}),
			"data-active": item.id === activeItemId || undefined,
			"data-disabled": item.disabled || undefined,
		}),
		[expandedKeys, activeItemId],
	);

	const getGroupProps = useCallback(
		(_item: NavItemType<TData>) => ({ role: "group" as const }),
		[],
	);

	const getRootProps = useCallback(
		() => ({
			role: "tree" as const,
			"aria-label": "Navigation",
		}),
		[],
	);

	return {
		items,
		expandedKeys,
		collapsed,
		variant,
		activeItemId,
		toggleGroup,
		expandGroup,
		collapseGroup,
		expandAll,
		collapseAll,
		setCollapsed,
		toggleCollapsed,
		setVariant,
		setActiveItem,
		getItemProps,
		getGroupProps,
		getRootProps,
	};
}
