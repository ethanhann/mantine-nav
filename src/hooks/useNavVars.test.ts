import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useNavVars } from "./useNavVars";

describe("useNavVars", () => {
	afterEach(() => {
		document.documentElement.style.removeProperty("--nav-accent");
	});

	it("sets a custom property on the document element", () => {
		// Arrange
		const { result } = renderHook(() => useNavVars());

		// Act
		act(() => result.current.setVar("--nav-accent", "blue"));

		// Assert
		expect(
			document.documentElement.style.getPropertyValue("--nav-accent"),
		).toBe("blue");
	});

	it("removes a property set on a clean slate when reset", () => {
		// Arrange
		const { result } = renderHook(() => useNavVars());
		act(() => result.current.setVar("--nav-accent", "blue"));

		// Act
		act(() => result.current.resetVars());

		// Assert
		expect(
			document.documentElement.style.getPropertyValue("--nav-accent"),
		).toBe("");
	});

	it("restores a pre-existing inline value on reset", () => {
		// Arrange
		document.documentElement.style.setProperty("--nav-accent", "red");
		const { result } = renderHook(() => useNavVars());
		act(() => result.current.setVar("--nav-accent", "blue"));

		// Act
		act(() => result.current.resetVars());

		// Assert
		expect(
			document.documentElement.style.getPropertyValue("--nav-accent"),
		).toBe("red");
	});

	it("restores the original value after multiple overrides", () => {
		// Arrange
		document.documentElement.style.setProperty("--nav-accent", "red");
		const { result } = renderHook(() => useNavVars());
		act(() => result.current.setVar("--nav-accent", "blue"));
		act(() => result.current.setVar("--nav-accent", "green"));

		// Act
		act(() => result.current.resetVars());

		// Assert
		expect(
			document.documentElement.style.getPropertyValue("--nav-accent"),
		).toBe("red");
	});
});
