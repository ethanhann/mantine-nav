import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useSidebarVariant } from "./useSidebarVariant";

describe("Spec 010: useSidebarVariant", () => {
	it("defaults to full variant", () => {
		const { result } = renderHook(() => useSidebarVariant());
		expect(result.current.variant).toBe("full");
		expect(result.current.isFull).toBe(true);
		expect(result.current.isMini).toBe(false);
		expect(result.current.isRail).toBe(false);
	});

	it("setVariant changes variant", () => {
		const { result } = renderHook(() => useSidebarVariant());
		act(() => result.current.setVariant("mini"));
		expect(result.current.variant).toBe("mini");
		expect(result.current.isMini).toBe(true);
	});

	it("cycleVariant cycles full → mini → rail → full", () => {
		const { result } = renderHook(() => useSidebarVariant());

		act(() => result.current.cycleVariant());
		expect(result.current.variant).toBe("mini");

		act(() => result.current.cycleVariant());
		expect(result.current.variant).toBe("rail");

		act(() => result.current.cycleVariant());
		expect(result.current.variant).toBe("full");
	});

	it("onVariantChange callback fires", () => {
		const onChange = vi.fn();
		const { result } = renderHook(() =>
			useSidebarVariant({ onVariantChange: onChange }),
		);

		act(() => result.current.setVariant("rail"));
		expect(onChange).toHaveBeenCalledWith("rail");
	});

	it("defaultVariant sets initial state", () => {
		const { result } = renderHook(() =>
			useSidebarVariant({ defaultVariant: "rail" }),
		);
		expect(result.current.variant).toBe("rail");
		expect(result.current.isRail).toBe(true);
	});
});
