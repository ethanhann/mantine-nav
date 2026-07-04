"use client";

import { useCallback, useRef } from "react";

export interface UseNavVarsReturn {
	getVar: (name: string) => string;
	setVar: (name: string, value: string) => void;
	resetVars: () => void;
}

export function useNavVars(): UseNavVarsReturn {
	const overridesRef = useRef<Map<string, string>>(new Map());

	const getVar = useCallback((name: string): string => {
		if (typeof document === "undefined") return "";
		return getComputedStyle(document.documentElement)
			.getPropertyValue(name)
			.trim();
	}, []);

	const setVar = useCallback((name: string, value: string): void => {
		if (typeof document === "undefined") return;
		// Remember the pre-override inline value (first override only) so
		// resetVars can restore it instead of clearing it.
		if (!overridesRef.current.has(name)) {
			overridesRef.current.set(
				name,
				document.documentElement.style.getPropertyValue(name),
			);
		}
		document.documentElement.style.setProperty(name, value);
	}, []);

	const resetVars = useCallback((): void => {
		if (typeof document === "undefined") return;
		for (const [name, previous] of overridesRef.current) {
			if (previous) {
				document.documentElement.style.setProperty(name, previous);
			} else {
				document.documentElement.style.removeProperty(name);
			}
		}
		overridesRef.current.clear();
	}, []);

	return { getVar, setVar, resetVars };
}
