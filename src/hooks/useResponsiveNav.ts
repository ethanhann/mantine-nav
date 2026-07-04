"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type SidebarMode = "persistent" | "temporary" | "overlay";

const PRINT_STYLE_ID = "nav-print-styles";
// Shared across all hook instances so the single injected <style> is only
// removed once the last printFriendly instance unmounts.
let printStyleRefCount = 0;

export interface UseResponsiveNavOptions {
	sidebarBreakpoint?: number;
	navbarBreakpoint?: number;
	printFriendly?: boolean;
}

export interface UseResponsiveNavReturn {
	isMobile: boolean;
	isTablet: boolean;
	isDesktop: boolean;
	sidebarMode: SidebarMode;
	sidebarVisible: boolean;
	navbarVisible: boolean;
	showSidebar: () => void;
	hideSidebar: () => void;
	toggleSidebar: () => void;
	viewportWidth: number;
}

export function useResponsiveNav({
	sidebarBreakpoint = 768,
	navbarBreakpoint = 1024,
	printFriendly = true,
}: UseResponsiveNavOptions = {}): UseResponsiveNavReturn {
	const [viewportWidth, setViewportWidth] = useState(() =>
		typeof window !== "undefined" ? window.innerWidth : 1024,
	);
	const [sidebarVisible, setSidebarVisible] = useState(
		() => viewportWidth >= sidebarBreakpoint,
	);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const handler = () => setViewportWidth(window.innerWidth);
		window.addEventListener("resize", handler);
		return () => window.removeEventListener("resize", handler);
	}, []);

	// Auto-hide on entering mobile and auto-show on leaving it, but only on
	// actual mode crossings so consumer showSidebar/hideSidebar calls are not
	// overridden by unrelated resize events.
	const wasMobileRef = useRef(viewportWidth < sidebarBreakpoint);
	useEffect(() => {
		const mobile = viewportWidth < sidebarBreakpoint;
		if (wasMobileRef.current === mobile) return;
		wasMobileRef.current = mobile;
		setSidebarVisible(!mobile);
	}, [viewportWidth, sidebarBreakpoint]);

	// Print styles. Reference-counted so multiple hook instances share one
	// injected <style> element and don't remove it out from under each other.
	useEffect(() => {
		if (!printFriendly || typeof window === "undefined") return;
		printStyleRefCount += 1;
		if (!document.getElementById(PRINT_STYLE_ID)) {
			const style = document.createElement("style");
			style.id = PRINT_STYLE_ID;
			style.textContent = `@media print { [data-nav-sidebar], [data-nav-navbar] { display: none !important; } }`;
			document.head.appendChild(style);
		}
		return () => {
			printStyleRefCount -= 1;
			if (printStyleRefCount <= 0) {
				printStyleRefCount = 0;
				document.getElementById(PRINT_STYLE_ID)?.remove();
			}
		};
	}, [printFriendly]);

	const isMobile = viewportWidth < sidebarBreakpoint;
	const isTablet =
		viewportWidth >= sidebarBreakpoint && viewportWidth < navbarBreakpoint;
	const isDesktop = viewportWidth >= navbarBreakpoint;

	const sidebarMode: SidebarMode = useMemo(() => {
		if (isMobile) return "overlay";
		if (isTablet) return "temporary";
		return "persistent";
	}, [isMobile, isTablet]);

	const navbarVisible = !isMobile;

	const showSidebar = useCallback(() => setSidebarVisible(true), []);
	const hideSidebar = useCallback(() => setSidebarVisible(false), []);
	const toggleSidebar = useCallback(() => setSidebarVisible((v) => !v), []);

	return {
		isMobile,
		isTablet,
		isDesktop,
		sidebarMode,
		sidebarVisible,
		navbarVisible,
		showSidebar,
		hideSidebar,
		toggleSidebar,
		viewportWidth,
	};
}
