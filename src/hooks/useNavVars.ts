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
		overridesRef.current.set(
			name,
			getComputedStyle(document.documentElement).getPropertyValue(name),
		);
		document.documentElement.style.setProperty(name, value);
	}, []);

	const resetVars = useCallback((): void => {
		if (typeof document === "undefined") return;
		for (const [name] of overridesRef.current) {
			document.documentElement.style.removeProperty(name);
		}
		overridesRef.current.clear();
	}, []);

	return { getVar, setVar, resetVars };
}
