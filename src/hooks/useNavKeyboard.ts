"use client";

import { useCallback, useRef, useState } from "react";
import type { NavItemType } from "../types";

export interface UseNavKeyboardOptions<TData = unknown> {
	items: NavItemType<TData>[];
	/** Original tree-structured items for parent lookup. Falls back to items if not provided. */
	treeItems?: NavItemType<TData>[];
	expandedKeys: Set<string>;
	onToggle: (key: string) => void;
	onSelect: (item: NavItemType<TData>) => void;
	containerRef: React.RefObject<HTMLElement>;
	typeAhead?: boolean;
	typeAheadTimeout?: number;
	loop?: boolean;
	enabled?: boolean;
}

export interface UseNavKeyboardReturn {
	focusedIndex: number;
	setFocusedIndex: (index: number) => void;
	handleKeyDown: (event: React.KeyboardEvent) => void;
}

function findParentGroupId<TData>(
	items: NavItemType<TData>[],
	targetId: string,
	parentId: string | null = null,
): string | null {
	for (const item of items) {
		if (item.id === targetId) return parentId;
		if (item.type === "group") {
			const found = findParentGroupId(item.children, targetId, item.id);
			if (found !== undefined && found !== null) return found;
		}
	}
	return null;
}

export function useNavKeyboard<TData = unknown>({
	items,
	treeItems,
	expandedKeys,
	onToggle,
	onSelect,
	containerRef,
	typeAhead = true,
	typeAheadTimeout = 500,
	loop = true,
	enabled = true,
}: UseNavKeyboardOptions<TData>): UseNavKeyboardReturn {
	const tree = treeItems ?? items;
	const [focusedIndex, setFocusedIndex] = useState(-1);
	const typeAheadBuffer = useRef("");
	const typeAheadTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

	const focusItem = useCallback(
		(index: number) => {
			if (!containerRef.current) return;
			const focusables =
				containerRef.current.querySelectorAll<HTMLElement>('[role="treeitem"]');
			const el = focusables[index];
			if (el) {
				el.focus();
				setFocusedIndex(index);
			}
		},
		[containerRef],
	);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (!enabled || !containerRef.current) return;

			const focusables =
				containerRef.current.querySelectorAll<HTMLElement>('[role="treeitem"]');
			const count = focusables.length;
			if (count === 0) return;

			// Find current focused index
			const activeEl = document.activeElement;
			let currentIdx = -1;
			focusables.forEach((el, i) => {
				if (el === activeEl) currentIdx = i;
			});
			if (currentIdx === -1) currentIdx = 0;

			const currentEl = focusables[currentIdx];
			const currentItemId = currentEl?.getAttribute("data-item-id");
			const currentItem = currentItemId
				? items.find((i) => i.id === currentItemId)
				: items[currentIdx];

			switch (event.key) {
				case "ArrowDown": {
					event.preventDefault();
					let nextIdx = currentIdx + 1;
					if (nextIdx >= count) nextIdx = loop ? 0 : count - 1;
					focusItem(nextIdx);
					break;
				}
				case "ArrowUp": {
					event.preventDefault();
					let prevIdx = currentIdx - 1;
					if (prevIdx < 0) prevIdx = loop ? count - 1 : 0;
					focusItem(prevIdx);
					break;
				}
				case "ArrowRight": {
					event.preventDefault();
					if (
						currentItem?.type === "group" &&
						!expandedKeys.has(currentItem.id)
					) {
						onToggle(currentItem.id);
					} else if (
						currentItem?.type === "group" &&
						expandedKeys.has(currentItem.id)
					) {
						// Move to first child
						const nextIdx = currentIdx + 1;
						if (nextIdx < count) focusItem(nextIdx);
					}
					break;
				}
				case "ArrowLeft": {
					event.preventDefault();
					if (
						currentItem?.type === "group" &&
						expandedKeys.has(currentItem.id)
					) {
						onToggle(currentItem.id);
					} else if (currentItem) {
						// Move to parent group — find parent ID in the tree, then locate
						// it in the DOM focusables (not the flat items array)
						const parentId = findParentGroupId(tree, currentItem.id);
						if (parentId) {
							let parentIdx = -1;
							focusables.forEach((el, i) => {
								if (el.getAttribute("data-item-id") === parentId) parentIdx = i;
							});
							if (parentIdx >= 0) focusItem(parentIdx);
						}
					}
					break;
				}
				case "Home": {
					event.preventDefault();
					focusItem(0);
					break;
				}
				case "End": {
					event.preventDefault();
					focusItem(count - 1);
					break;
				}
				case "Enter":
				case " ": {
					event.preventDefault();
					if (currentItem) {
						if (currentItem.type === "group") {
							onToggle(currentItem.id);
						}
						onSelect(currentItem);
					}
					break;
				}
				case "Escape": {
					event.preventDefault();
					containerRef.current?.focus();
					break;
				}
				default: {
					// Type-ahead
					if (
						typeAhead &&
						event.key.length === 1 &&
						/[a-zA-Z]/.test(event.key)
					) {
						event.preventDefault();
						if (typeAheadTimer.current) clearTimeout(typeAheadTimer.current);
						typeAheadBuffer.current += event.key.toLowerCase();
						typeAheadTimer.current = setTimeout(() => {
							typeAheadBuffer.current = "";
						}, typeAheadTimeout);

						const search = typeAheadBuffer.current;
						// Search from current position
						for (let offset = 1; offset <= count; offset++) {
							const idx = (currentIdx + offset) % count;
							const el = focusables[idx];
							const itemId = el?.getAttribute("data-item-id");
							const item = itemId
								? items.find((i) => i.id === itemId)
								: items[idx];
							if (
								item &&
								(item.type === "link" || item.type === "group") &&
								item.label.toLowerCase().startsWith(search)
							) {
								focusItem(idx);
								break;
							}
						}
					}
					break;
				}
			}
		},
		[
			enabled,
			containerRef,
			items,
			tree,
			expandedKeys,
			onToggle,
			onSelect,
			focusItem,
			typeAhead,
			typeAheadTimeout,
			loop,
		],
	);

	return { focusedIndex, setFocusedIndex, handleKeyDown };
}
