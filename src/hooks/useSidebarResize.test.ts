import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
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
