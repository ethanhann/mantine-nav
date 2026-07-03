import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSidebarResize } from "./useSidebarResize";

describe("Spec 009: useSidebarResize", () => {
	it("returns default width", () => {
		const { result } = renderHook(() => useSidebarResize());
		expect(result.current.width).toBe(260);
		expect(result.current.isResizing).toBe(false);
	});

	it("returns custom default width", () => {
		const { result } = renderHook(() =>
			useSidebarResize({ defaultWidth: 300 }),
		);
		expect(result.current.width).toBe(300);
	});

	it("resetWidth restores default", () => {
		const { result } = renderHook(() =>
			useSidebarResize({ defaultWidth: 300 }),
		);
		act(() => result.current.resetWidth());
		expect(result.current.width).toBe(300);
	});

	it("getHandleProps returns correct props", () => {
		const { result } = renderHook(() => useSidebarResize());
		const props = result.current.getHandleProps();
		expect(props.role).toBe("separator");
		expect(props["aria-label"]).toBe("Resize sidebar");
		expect(props["aria-orientation"]).toBe("vertical");
		expect(typeof props.onPointerDown).toBe("function");
		expect(typeof props.onDoubleClick).toBe("function");
	});

	describe("drag and keyboard interactions", () => {
		afterEach(() => {
			localStorage.removeItem("nav-sidebar-width");
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		});

		function startDrag(
			result: {
				current: ReturnType<typeof useSidebarResize>;
			},
			clientX = 300,
		) {
			act(() => {
				result.current.getHandleProps().onPointerDown({
					preventDefault() {},
					clientX,
					pointerId: 1,
					target: { setPointerCapture() {} },
				} as unknown as React.PointerEvent);
			});
		}

		it("fires onCollapse once while dragging below minWidth", () => {
			// Arrange
			const onCollapse = vi.fn();
			const { result } = renderHook(() =>
				useSidebarResize({ minWidth: 180, onCollapse }),
			);
			startDrag(result, 300);

			// Act
			act(() => {
				document.dispatchEvent(new MouseEvent("pointermove", { clientX: 100 }));
				document.dispatchEvent(new MouseEvent("pointermove", { clientX: 90 }));
				document.dispatchEvent(new MouseEvent("pointermove", { clientX: 80 }));
			});

			// Assert
			expect(onCollapse).toHaveBeenCalledTimes(1);
		});

		it("restores body cursor and text selection when unmounted mid-drag", () => {
			// Arrange
			const { result, unmount } = renderHook(() => useSidebarResize());
			startDrag(result);
			expect(document.body.style.cursor).toBe("col-resize");

			// Act
			unmount();

			// Assert
			expect(document.body.style.cursor).toBe("");
			expect(document.body.style.userSelect).toBe("");
		});

		it("persists keyboard-adjusted width and fires onResizeEnd", () => {
			// Arrange
			const onResizeEnd = vi.fn();
			const { result } = renderHook(() =>
				useSidebarResize({
					persistKey: "nav-sidebar-width",
					defaultWidth: 260,
					onResizeEnd,
				}),
			);

			// Act
			act(() => {
				result.current.getHandleProps().onKeyDown({
					key: "ArrowRight",
					shiftKey: false,
					preventDefault() {},
				} as unknown as React.KeyboardEvent);
			});

			// Assert
			expect(result.current.width).toBe(264);
			expect(onResizeEnd).toHaveBeenCalledWith(264);
			expect(localStorage.getItem("nav-sidebar-width")).toBe("264");
		});
	});

	describe("persisted width validation", () => {
		afterEach(() => {
			localStorage.removeItem("nav-sidebar-width");
		});

		it("falls back to defaultWidth when the persisted value is not a number", () => {
			// Arrange
			localStorage.setItem("nav-sidebar-width", "abc");

			// Act
			const { result } = renderHook(() =>
				useSidebarResize({
					persistKey: "nav-sidebar-width",
					defaultWidth: 260,
				}),
			);

			// Assert
			expect(result.current.width).toBe(260);
		});

		it("clamps a persisted width above maxWidth", () => {
			// Arrange
			localStorage.setItem("nav-sidebar-width", "9999");

			// Act
			const { result } = renderHook(() =>
				useSidebarResize({
					persistKey: "nav-sidebar-width",
					maxWidth: 480,
				}),
			);

			// Assert
			expect(result.current.width).toBe(480);
		});

		it("clamps a persisted width below minWidth", () => {
			// Arrange
			localStorage.setItem("nav-sidebar-width", "10");

			// Act
			const { result } = renderHook(() =>
				useSidebarResize({
					persistKey: "nav-sidebar-width",
					minWidth: 180,
				}),
			);

			// Assert
			expect(result.current.width).toBe(180);
		});

		it("uses a valid persisted width within range", () => {
			// Arrange
			localStorage.setItem("nav-sidebar-width", "320");

			// Act
			const { result } = renderHook(() =>
				useSidebarResize({ persistKey: "nav-sidebar-width" }),
			);

			// Assert
			expect(result.current.width).toBe(320);
		});
	});
});
