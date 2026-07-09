"use client";

import { type ReactNode, useMemo } from "react";
import type {
	ActiveMatcher,
	NavGroupItem,
	NavItemType,
	NavLinkItem,
} from "../types";
import { matchItem } from "../utils/matchItem";
import { filterVisibleItems } from "../utils/visibility";
import { useCurrentPath } from "./useCurrentPath";

export interface BreadcrumbEntry<TData = unknown> {
	id: string;
	label: string;
	href?: string;
	icon?: ReactNode;
	item: NavLinkItem<TData> | NavGroupItem<TData>;
	isCurrentPage: boolean;
}

export interface UseNavBreadcrumbsOptions<TData = unknown> {
	items: NavItemType<TData>[];
	currentPath?: string;
	matcher?: ActiveMatcher;
	rootEntry?: Pick<BreadcrumbEntry<TData>, "label" | "href" | "icon">;
}

export interface UseNavBreadcrumbsReturn<TData = unknown> {
	breadcrumbs: BreadcrumbEntry<TData>[];
	activeItem: NavLinkItem<TData> | null;
}

interface TrailCandidate<TData> {
	trail: Array<NavLinkItem<TData> | NavGroupItem<TData>>;
	hrefLength: number;
}

function resolveItemMatcher(
	item: NavLinkItem | NavGroupItem,
	defaultMatcher: ActiveMatcher,
): ActiveMatcher {
	if (item.activeExact) return "exact";
	return item.activeMatch ?? defaultMatcher;
}

function findBestTrail<TData>(
	items: NavItemType<TData>[],
	currentPath: string,
	defaultMatcher: ActiveMatcher,
	ancestors: Array<NavLinkItem<TData> | NavGroupItem<TData>>,
): TrailCandidate<TData> | null {
	let best: TrailCandidate<TData> | null = null;

	for (const item of items) {
		if (item.type === "link") {
			const matcher = resolveItemMatcher(item, defaultMatcher);
			if (matchItem(currentPath, item.href, matcher)) {
				if (!best || item.href.length > best.hrefLength) {
					best = {
						trail: [...ancestors, item],
						hrefLength: item.href.length,
					};
				}
			}
		} else if (item.type === "group") {
			if (item.href) {
				const matcher = resolveItemMatcher(item, defaultMatcher);
				if (matchItem(currentPath, item.href, matcher)) {
					if (!best || item.href.length > best.hrefLength) {
						best = {
							trail: [...ancestors, item],
							hrefLength: item.href.length,
						};
					}
				}
			}
			const childResult = findBestTrail(
				item.children,
				currentPath,
				defaultMatcher,
				[...ancestors, item],
			);
			if (childResult && (!best || childResult.hrefLength > best.hrefLength)) {
				best = childResult;
			}
		}
	}

	return best;
}

export function useNavBreadcrumbs<TData = unknown>(
	options: UseNavBreadcrumbsOptions<TData>,
): UseNavBreadcrumbsReturn<TData> {
	const { items, matcher, rootEntry } = options;
	const currentPath = useCurrentPath(options.currentPath);
	const defaultMatcher = matcher ?? "prefix";

	return useMemo(() => {
		const visible = filterVisibleItems(items);
		const candidate = findBestTrail(visible, currentPath, defaultMatcher, []);

		if (!candidate) {
			return { breadcrumbs: [], activeItem: null };
		}

		const { trail } = candidate;
		const lastItem = trail[trail.length - 1]!;
		const activeItem: NavLinkItem<TData> | null =
			lastItem.type === "link" ? lastItem : null;

		const breadcrumbs: BreadcrumbEntry<TData>[] = trail.map((item, i) => ({
			id: item.id,
			label: item.label,
			href: item.href,
			icon: item.icon,
			item,
			isCurrentPage: i === trail.length - 1,
		}));

		if (rootEntry) {
			breadcrumbs.unshift({
				id: "__root__",
				label: rootEntry.label,
				href: rootEntry.href,
				icon: rootEntry.icon,
				item: breadcrumbs[0]!.item,
				isCurrentPage: false,
			});
		}

		return { breadcrumbs, activeItem };
	}, [items, currentPath, defaultMatcher, rootEntry]);
}
