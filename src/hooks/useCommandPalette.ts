"use client";

import { createSpotlight, type SpotlightStore } from "@mantine/spotlight";

/**
 * A single module-level Spotlight store shared by {@link useCommandPalette} and
 * the `CommandPalette` component, so a trigger button and the keyboard shortcut
 * drive the same instance.
 */
export const [commandPaletteStore, commandPaletteControls] = createSpotlight();

export interface UseCommandPaletteReturn {
	/** The Spotlight store backing the `CommandPalette`. */
	store: SpotlightStore;
	open: () => void;
	close: () => void;
	toggle: () => void;
}

/**
 * Programmatic controls for the `CommandPalette`. Use `open`/`toggle` to wire a
 * header button or custom shortcut; the palette opens its own ⌘K shortcut by
 * default.
 */
export function useCommandPalette(): UseCommandPaletteReturn {
	return {
		store: commandPaletteStore,
		open: commandPaletteControls.open,
		close: commandPaletteControls.close,
		toggle: commandPaletteControls.toggle,
	};
}
