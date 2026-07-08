"use client";

import { useMemo } from "react";
import type { ActiveMatcher, NavItemType, NavLinkItem } from "../types";
import { matchItem } from "../utils/matchItem";
import { walkNavTree } from "../utils/traverse";
import { useCurrentPath } from "./useCurrentPath";

export interface UseActiveNavItemOptions {
	currentPath?: string;
	matcher?: ActiveMatcher;
}

export interface UseActiveNavItemReturn<TData = unknown> {
	activeItem: NavLinkItem<TData> | null;
	activeHref: string | null;
	isActive: (item: NavItemType<TData>) => boolean;
}

function collectLinks<TData>(
	items: NavItemType<TData>[],
): NavLinkItem<TData>[] {
	const links: NavLinkItem<TData>[] = [];
	walkNavTree(items, (item) => {
		if (item.type === "link") {
			links.push(item);
		} else if (item.type === "group" && item.href) {
			// A group with its own href matches like a link would; preserve
			// its matching config.
			links.push({
				type: "link",
				id: item.id,
				label: item.label,
				href: item.href,
				data: item.data,
				activeMatch: item.activeMatch,
				activeExact: item.activeExact,
			} as NavLinkItem<TData>);
		}
		return undefined;
	});
	return links;
}

export function useActiveNavItem<TData = unknown>(
	items: NavItemType<TData>[],
	options: UseActiveNavItemOptions = {},
): UseActiveNavItemReturn<TData> {
	const currentPath = useCurrentPath(options.currentPath);
	const defaultMatcher = options.matcher ?? "prefix";

	const result = useMemo(() => {
		const links = collectLinks(items);
		let bestMatch: NavLinkItem<TData> | null = null;
		let bestLength = -1;

		for (const link of links) {
			const itemMatcher = link.activeExact
				? "exact"
				: (link.activeMatch ?? defaultMatcher);
			if (matchItem(currentPath, link.href, itemMatcher)) {
				// Most specific match wins (longest href)
				if (link.href.length > bestLength) {
					bestMatch = link;
					bestLength = link.href.length;
				}
			}
		}

		const isActive = (item: NavItemType<TData>): boolean => {
			if (item.type === "link") {
				const itemMatcher = item.activeExact
					? "exact"
					: (item.activeMatch ?? defaultMatcher);
				return matchItem(currentPath, item.href, itemMatcher);
			}
			if (item.type === "group") {
				// A group is active if its own href matches...
				if (item.href) {
					const groupMatcher = item.activeExact
						? "exact"
						: (item.activeMatch ?? defaultMatcher);
					if (matchItem(currentPath, item.href, groupMatcher)) {
						return true;
					}
				}
				// ...or if any child is active
				return item.children.some((child) => isActive(child));
			}
			return false;
		};

		return {
			activeItem: bestMatch,
			activeHref: bestMatch?.href ?? null,
			isActive,
		};
	}, [items, currentPath, defaultMatcher]);

	return result;
}
