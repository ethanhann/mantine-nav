import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { NavItemType } from "../types";
import { useReorderableNav } from "./useReorderableNav";

const items: NavItemType[] = [
	{ type: "link", id: "a", label: "A", href: "/a" },
	{ type: "link", id: "b", label: "B", href: "/b" },
	{ type: "link", id: "c", label: "C", href: "/c" },
];

describe("Spec 003: useReorderableNav", () => {
	it("returns ordered items matching input", () => {
		const onReorder = vi.fn();
		const { result } = renderHook(() =>
			useReorderableNav({ items, onReorder }),
		);
		expect(result.current.orderedItems.map((i) => i.id)).toEqual([
			"a",
			"b",
			"c",
		]);
	});

	it("tracks drag state", () => {
		const onReorder = vi.fn();
		const { result } = renderHook(() =>
			useReorderableNav({ items, onReorder }),
		);

		act(() => result.current.handleDragStart("a"));
		expect(result.current.draggedId).toBe("a");

		act(() => result.current.handleDragOver("c"));
		expect(result.current.dropTargetId).toBe("c");
	});

	it("calls onReorder after drag end", () => {
		const onReorder = vi.fn();
		const { result } = renderHook(() =>
			useReorderableNav({ items, onReorder }),
		);

		act(() => {
			result.current.handleDragStart("a");
			result.current.handleDragOver("c");
			result.current.handleDragEnd();
		});

		expect(onReorder).toHaveBeenCalledTimes(1);
		const [newItems, from, to] = onReorder.mock.calls[0];
		expect(from).toBe(0);
		expect(to).toBe(2);
		expect(newItems.map((i: NavItemType) => i.id)).toEqual(["b", "c", "a"]);
	});

	it("does not drag disabled items", () => {
		const disabledItems: NavItemType[] = [
			{ type: "link", id: "x", label: "X", href: "/x", disabled: true },
			{ type: "link", id: "y", label: "Y", href: "/y" },
		];
		const onReorder = vi.fn();
		const { result } = renderHook(() =>
			useReorderableNav({ items: disabledItems, onReorder }),
		);

		act(() => result.current.handleDragStart("x"));
		expect(result.current.draggedId).toBeNull();
	});

	it("getDragHandleProps returns draggable props", () => {
		const onReorder = vi.fn();
		const { result } = renderHook(() =>
			useReorderableNav({ items, onReorder }),
		);
		const props = result.current.getDragHandleProps("a");
		expect(props.draggable).toBe(true);
		expect(typeof props.onDragStart).toBe("function");
	});
});
