import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";
import * as vitestAxeMatchers from "vitest-axe/matchers";

expect.extend(vitestAxeMatchers);
import "vitest-axe/extend-expect";

// Mantine requires matchMedia in jsdom
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: (query: string) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	}),
});

// Mantine may also need ResizeObserver
class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
}
window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
