import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCurrentPath } from "./useCurrentPath";

describe("useCurrentPath", () => {
	it("returns the explicit currentPath when provided", () => {
		// Arrange

		// Act
		const { result } = renderHook(() => useCurrentPath("/explicit"));

		// Assert
		expect(result.current).toBe("/explicit");
	});

	it("falls back to window.location.pathname", () => {
		// Arrange
		window.history.pushState({}, "", "/fallback-path");

		// Act
		const { result } = renderHook(() => useCurrentPath());

		// Assert
		expect(result.current).toBe("/fallback-path");
		window.history.pushState({}, "", "/");
	});

	it("updates when a popstate event fires", () => {
		// Arrange
		window.history.pushState({}, "", "/before");
		const { result } = renderHook(() => useCurrentPath());
		expect(result.current).toBe("/before");
		window.history.pushState({}, "", "/after");

		// Act
		act(() => {
			window.dispatchEvent(new PopStateEvent("popstate"));
		});

		// Assert
		expect(result.current).toBe("/after");
		window.history.pushState({}, "", "/");
	});
});
