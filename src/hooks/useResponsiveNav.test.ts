import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useResponsiveNav } from "./useResponsiveNav";

function setViewportWidth(width: number) {
	Object.defineProperty(window, "innerWidth", {
		configurable: true,
		writable: true,
		value: width,
	});
}

function resizeTo(width: number) {
	act(() => {
		setViewportWidth(width);
		window.dispatchEvent(new Event("resize"));
	});
}

describe("useResponsiveNav", () => {
	afterEach(() => {
		setViewportWidth(1024);
	});

	it("starts hidden when mounted on a mobile viewport", () => {
		// Arrange
		setViewportWidth(500);

		// Act
		const { result } = renderHook(() => useResponsiveNav());

		// Assert
		expect(result.current.isMobile).toBe(true);
		expect(result.current.sidebarVisible).toBe(false);
	});

	it("keeps a consumer-shown sidebar visible across resizes within the same mode", () => {
		// Arrange
		setViewportWidth(500);
		const { result } = renderHook(() => useResponsiveNav());
		act(() => result.current.showSidebar());
		expect(result.current.sidebarVisible).toBe(true);

		// Act
		resizeTo(501);

		// Assert
		expect(result.current.sidebarVisible).toBe(true);
	});

	it("keeps a consumer-hidden sidebar hidden across desktop resizes", () => {
		// Arrange
		setViewportWidth(1200);
		const { result } = renderHook(() => useResponsiveNav());
		act(() => result.current.hideSidebar());

		// Act
		resizeTo(1201);

		// Assert
		expect(result.current.sidebarVisible).toBe(false);
	});

	it("hides the sidebar when crossing from desktop to mobile", () => {
		// Arrange
		setViewportWidth(1200);
		const { result } = renderHook(() => useResponsiveNav());
		expect(result.current.sidebarVisible).toBe(true);

		// Act
		resizeTo(500);

		// Assert
		expect(result.current.sidebarVisible).toBe(false);
	});

	it("shows the sidebar when crossing from mobile to desktop", () => {
		// Arrange
		setViewportWidth(500);
		const { result } = renderHook(() => useResponsiveNav());

		// Act
		resizeTo(1200);

		// Assert
		expect(result.current.sidebarVisible).toBe(true);
	});

	it("reports mode from viewport width", () => {
		// Arrange
		setViewportWidth(800);

		// Act
		const { result } = renderHook(() => useResponsiveNav());

		// Assert
		expect(result.current.isTablet).toBe(true);
		expect(result.current.sidebarMode).toBe("temporary");
	});
});

describe("useResponsiveNav breakpoint boundaries", () => {
	afterEach(() => {
		setViewportWidth(1024);
	});

	it("treats the exact sidebar breakpoint as tablet rather than mobile", () => {
		// Arrange
		setViewportWidth(768);

		// Act
		const { result } = renderHook(() => useResponsiveNav());

		// Assert
		expect(result.current.isMobile).toBe(false);
		expect(result.current.isTablet).toBe(true);
		expect(result.current.sidebarVisible).toBe(true);
	});

	it("treats one pixel below the sidebar breakpoint as mobile", () => {
		// Arrange
		setViewportWidth(767);

		// Act
		const { result } = renderHook(() => useResponsiveNav());

		// Assert
		expect(result.current.isMobile).toBe(true);
		expect(result.current.isTablet).toBe(false);
		expect(result.current.sidebarVisible).toBe(false);
	});

	it("treats the exact navbar breakpoint as desktop rather than tablet", () => {
		// Arrange
		setViewportWidth(1024);

		// Act
		const { result } = renderHook(() => useResponsiveNav());

		// Assert
		expect(result.current.isDesktop).toBe(true);
		expect(result.current.isTablet).toBe(false);
		expect(result.current.sidebarMode).toBe("persistent");
	});

	it("treats one pixel below the navbar breakpoint as tablet", () => {
		// Arrange
		setViewportWidth(1023);

		// Act
		const { result } = renderHook(() => useResponsiveNav());

		// Assert
		expect(result.current.isDesktop).toBe(false);
		expect(result.current.isTablet).toBe(true);
	});

	it("reports overlay mode and a hidden navbar on mobile", () => {
		// Arrange
		setViewportWidth(500);

		// Act
		const { result } = renderHook(() => useResponsiveNav());

		// Assert
		expect(result.current.sidebarMode).toBe("overlay");
		expect(result.current.navbarVisible).toBe(false);
	});

	it("recomputes mode and navbar visibility when the viewport crosses to desktop", () => {
		// Arrange
		setViewportWidth(500);
		const { result } = renderHook(() => useResponsiveNav());

		// Act
		resizeTo(1200);

		// Assert
		expect(result.current.sidebarMode).toBe("persistent");
		expect(result.current.navbarVisible).toBe(true);
	});

	it("does not treat a resize down to the exact breakpoint as entering mobile", () => {
		// Arrange
		setViewportWidth(1200);
		const { result } = renderHook(() => useResponsiveNav());

		// Act
		resizeTo(768);

		// Assert
		expect(result.current.sidebarVisible).toBe(true);
	});

	it("hides the sidebar when resizing below a breakpoint it was mounted at", () => {
		// Arrange
		setViewportWidth(768);
		const { result } = renderHook(() => useResponsiveNav());

		// Act
		resizeTo(700);

		// Assert
		expect(result.current.sidebarVisible).toBe(false);
	});

	it("honors custom breakpoints", () => {
		// Arrange
		setViewportWidth(800);

		// Act
		const { result } = renderHook(() =>
			useResponsiveNav({ sidebarBreakpoint: 900, navbarBreakpoint: 1400 }),
		);

		// Assert
		expect(result.current.isMobile).toBe(true);
		expect(result.current.isDesktop).toBe(false);
	});
});

function printStyleElements() {
	return document.querySelectorAll("#nav-print-styles");
}

describe("useResponsiveNav print styles", () => {
	afterEach(() => {
		setViewportWidth(1024);
	});

	it("injects a print style element by default", () => {
		// Arrange, Act
		const { unmount } = renderHook(() => useResponsiveNav());

		// Assert
		const style = document.getElementById("nav-print-styles");
		expect(style).not.toBeNull();
		expect(style?.textContent).toContain("@media print");
		unmount();
	});

	it("injects nothing when printFriendly is false", () => {
		// Arrange, Act
		const { unmount } = renderHook(() =>
			useResponsiveNav({ printFriendly: false }),
		);

		// Assert
		expect(printStyleElements()).toHaveLength(0);
		unmount();
	});

	it("removes the style element on unmount", () => {
		// Arrange
		const { unmount } = renderHook(() => useResponsiveNav());
		expect(printStyleElements()).toHaveLength(1);

		// Act
		unmount();

		// Assert
		expect(printStyleElements()).toHaveLength(0);
	});

	it("shares a single style element across instances", () => {
		// Arrange
		const first = renderHook(() => useResponsiveNav());

		// Act
		const second = renderHook(() => useResponsiveNav());

		// Assert
		expect(printStyleElements()).toHaveLength(1);
		first.unmount();
		second.unmount();
	});

	it("keeps the style element until the last instance unmounts", () => {
		// Arrange
		const first = renderHook(() => useResponsiveNav());
		const second = renderHook(() => useResponsiveNav());

		// Act
		first.unmount();

		// Assert
		expect(printStyleElements()).toHaveLength(1);
		second.unmount();
		expect(printStyleElements()).toHaveLength(0);
	});

	it("removes the style element when printFriendly flips to false", () => {
		// Arrange
		const { rerender, unmount } = renderHook(
			({ printFriendly }) => useResponsiveNav({ printFriendly }),
			{ initialProps: { printFriendly: true } },
		);
		expect(printStyleElements()).toHaveLength(1);

		// Act
		rerender({ printFriendly: false });

		// Assert
		expect(printStyleElements()).toHaveLength(0);
		unmount();
	});

	it("tolerates the style element being removed by something else", () => {
		// Arrange
		const { unmount } = renderHook(() => useResponsiveNav());
		document.getElementById("nav-print-styles")?.remove();

		// Act, Assert
		expect(() => unmount()).not.toThrow();
	});
});

describe("useResponsiveNav sidebar callbacks", () => {
	afterEach(() => {
		setViewportWidth(1024);
	});

	it("toggleSidebar hides a visible sidebar", () => {
		// Arrange
		setViewportWidth(1200);
		const { result } = renderHook(() => useResponsiveNav());

		// Act
		act(() => result.current.toggleSidebar());

		// Assert
		expect(result.current.sidebarVisible).toBe(false);
	});

	it("toggleSidebar shows a hidden sidebar", () => {
		// Arrange
		setViewportWidth(500);
		const { result } = renderHook(() => useResponsiveNav());

		// Act
		act(() => result.current.toggleSidebar());

		// Assert
		expect(result.current.sidebarVisible).toBe(true);
	});

	it("removes the resize listener on unmount", () => {
		// Arrange
		const removeListener = vi.spyOn(window, "removeEventListener");
		const { unmount } = renderHook(() => useResponsiveNav());

		// Act
		unmount();

		// Assert
		expect(removeListener).toHaveBeenCalledWith("resize", expect.any(Function));
		removeListener.mockRestore();
	});
});
