"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { NavGroupItem, NavItemType, NavLinkItem } from "../types";
import { sortItemsByWeight } from "../utils/sorting";

/** Configuration for a registered nav item (without `id` or `children`, which are derived). */
export type NavRegistryEntry<TData = unknown> = Omit<
	NavLinkItem<TData> | NavGroupItem<TData>,
	"id" | "children"
>;

export interface UseNavRegistryReturn<TData = unknown> {
	/** The derived tree of nav items, sorted by weight. */
	items: NavItemType<TData>[];
	/** Register an item by dot-notation ID (e.g. `'products.catalog'`). */
	register: (id: string, config: NavRegistryEntry<TData>) => void;
	/** Remove an item by ID. */
	unregister: (id: string) => void;
	/** Remove all registered items. */
	clear: () => void;
}

interface RegistryNode<TData> {
	id: string;
	config: NavRegistryEntry<TData> | null; // null = auto-created placeholder
	children: Map<string, RegistryNode<TData>>;
}

function buildTree<TData>(
	registry: Map<string, NavRegistryEntry<TData>>,
): NavItemType<TData>[] {
	const roots = new Map<string, RegistryNode<TData>>();

	// Sort entries so parents are processed before children
	const sortedIds = Array.from(registry.keys()).sort();

	for (const id of sortedIds) {
		const config = registry.get(id)!;
		const parts = id.split(".");
		let currentLevel = roots;

		for (let i = 0; i < parts.length; i++) {
			const segment = parts.slice(0, i + 1).join(".");
			const isLeaf = i === parts.length - 1;

			if (!currentLevel.has(segment)) {
				currentLevel.set(segment, {
					id: segment,
					config: isLeaf ? config : null,
					children: new Map(),
				});
			} else if (isLeaf) {
				// Merge real config into a placeholder
				currentLevel.get(segment)!.config = config;
			}

			currentLevel = currentLevel.get(segment)!.children;
		}
	}

	return sortItemsByWeight(convertNodes(roots));
}

function convertNodes<TData>(
	nodes: Map<string, RegistryNode<TData>>,
): NavItemType<TData>[] {
	const result: NavItemType<TData>[] = [];

	for (const node of nodes.values()) {
		const hasChildren = node.children.size > 0;
		const config = node.config;

		if (hasChildren) {
			// This is a group node
			const groupConfig = config ?? {
				type: "group" as const,
				label: node.id.split(".").pop()!,
			};
			result.push({
				...groupConfig,
				id: node.id,
				type: "group",
				label:
					(groupConfig as { label?: string }).label ??
					node.id.split(".").pop()!,
				children: convertNodes(node.children),
			} as NavGroupItem<TData>);
		} else if (config) {
			// Leaf node with config — groups get empty children array
			const item = { ...config, id: node.id } as NavItemType<TData>;
			if (item.type === "group") {
				(item as NavGroupItem<TData>).children = [];
			}
			result.push(item);
		}
		// Skip leaf nodes without config (shouldn't happen with our logic)
	}

	return result;
}

/**
 * Hook for flat, dot-notation registration of nav items that builds a tree.
 *
 * Items are registered with dot-separated IDs to define hierarchy.
 * Intermediate groups are auto-created as placeholders when a child is
 * registered before its parent.
 *
 * @example
 * ```tsx
 * const { items, register } = useNavRegistry();
 *
 * // In different modules:
 * register('dashboard', { type: 'link', label: 'Dashboard', href: '/' });
 * register('products', { type: 'group', label: 'Products' });
 * register('products.catalog', { type: 'link', label: 'Catalog', href: '/products' });
 * register('products.inventory', { type: 'link', label: 'Inventory', href: '/inventory' });
 * ```
 */
export function useNavRegistry<TData = unknown>(): UseNavRegistryReturn<TData> {
	const registryRef = useRef<Map<string, NavRegistryEntry<TData>>>(new Map());
	const [version, setVersion] = useState(0);

	const register = useCallback(
		(id: string, config: NavRegistryEntry<TData>) => {
			registryRef.current.set(id, config);
			setVersion((v) => v + 1);
		},
		[],
	);

	const unregister = useCallback((id: string) => {
		const registry = registryRef.current;
		registry.delete(id);
		const prefix = id + ".";
		for (const key of Array.from(registry.keys())) {
			if (key.startsWith(prefix)) registry.delete(key);
		}
		setVersion((v) => v + 1);
	}, []);

	const clear = useCallback(() => {
		registryRef.current.clear();
		setVersion((v) => v + 1);
	}, []);

	const items = useMemo(
		() => buildTree(registryRef.current),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[version],
	);

	return { items, register, unregister, clear };
}
