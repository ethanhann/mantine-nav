import "vitest-canvas-mock";
import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";
import * as vitestAxeMatchers from "vitest-axe/matchers";

expect.extend(vitestAxeMatchers);
import "vitest-axe/extend-expect";

// Node's experimental global localStorage (Node 22+) shadows jsdom's and is
// non-functional without a backing file, so replace it with an in-memory mock.
class LocalStorageMock implements Storage {
	private store = new Map<string, string>();
	get length() {
		return this.store.size;
	}
	clear() {
		this.store.clear();
	}
	getItem(key: string) {
		return this.store.has(key) ? (this.store.get(key) as string) : null;
	}
	setItem(key: string, value: string) {
		this.store.set(String(key), String(value));
	}
	removeItem(key: string) {
		this.store.delete(key);
	}
	key(index: number) {
		return Array.from(this.store.keys())[index] ?? null;
	}
}
const localStorageMock = new LocalStorageMock();
Object.defineProperty(globalThis, "localStorage", {
	configurable: true,
	value: localStorageMock,
});
Object.defineProperty(window, "localStorage", {
	configurable: true,
	value: localStorageMock,
});

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

// jsdom does not implement scrollIntoView; Spotlight scrolls the active action.
if (!Element.prototype.scrollIntoView) {
	Element.prototype.scrollIntoView = () => {};
}
