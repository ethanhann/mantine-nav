import { renderHook } from "@testing-library/react";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { useHydrated, useIsSSR } from "./useIsSSR";

function SsrProbe() {
	return createElement(
		"span",
		null,
		`ssr:${useIsSSR()} hydrated:${useHydrated()}`,
	);
}

describe("useIsSSR / useHydrated", () => {
	it("reports client rendering after mount", () => {
		// Arrange

		// Act
		const { result } = renderHook(() => ({
			isSSR: useIsSSR(),
			hydrated: useHydrated(),
		}));

		// Assert
		expect(result.current.isSSR).toBe(false);
		expect(result.current.hydrated).toBe(true);
	});

	it("reports server rendering during renderToString", () => {
		// Arrange

		// Act
		const html = renderToString(createElement(SsrProbe));

		// Assert
		expect(html).toContain("ssr:true hydrated:false");
	});
});
