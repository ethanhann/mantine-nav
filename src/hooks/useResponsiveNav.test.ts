import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
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
