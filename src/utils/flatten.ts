import type { ReactNode } from "react";
import type { NavItemType } from "../types";
import { filterVisibleItems } from "./visibility";

/**
 * A navigable destination derived from a nav-item tree, suitable for searching
 * in a command palette. Produced by {@link flattenNavCommands}.
 */
export interface NavCommand {
	id: string;
	label: string;
	href: string;
	icon?: ReactNode;
	external?: boolean;
	disabled?: boolean;
	onClick?: (event: React.MouseEvent) => void;
	/** Breadcrumb of ancestor group labels, e.g. `["Products"]`. */
	path: string[];
}

/**
 * Flatten a nav-item tree into a flat list of navigable {@link NavCommand}s.
 *
 * - Hidden items are removed first (via {@link filterVisibleItems}).
 * - `link` items become commands.
 * - `group` items contribute a command only when they have their own `href`,
 *   then their children are walked with the group label appended to `path`.
 * - `section` and `divider` items are skipped.
 * - Duplicate ids are de-duplicated (first occurrence wins).
 */
export function flattenNavCommands<TData = unknown>(
	items: NavItemType<TData>[],
): NavCommand[] {
	const commands: NavCommand[] = [];
	const seen = new Set<string>();

	const walk = (nodes: NavItemType<TData>[], path: string[]) => {
		for (const node of nodes) {
			if (node.type === "link") {
				if (seen.has(node.id)) continue;
				seen.add(node.id);
				commands.push({
					id: node.id,
					label: node.label,
					href: node.href,
					icon: node.icon,
					external: node.external,
					disabled: node.disabled,
					onClick: node.onClick,
					path,
				});
			} else if (node.type === "group") {
				if (node.href && !seen.has(node.id)) {
					seen.add(node.id);
					commands.push({
						id: node.id,
						label: node.label,
						href: node.href,
						icon: node.icon,
						disabled: node.disabled,
						path,
					});
				}
				walk(node.children, [...path, node.label]);
			}
			// `section` and `divider` are not navigable, skip.
		}
	};

	walk(filterVisibleItems(items), []);
	return commands;
}
