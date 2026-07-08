"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseSidebarResizeOptions {
	defaultWidth?: number;
	minWidth?: number;
	maxWidth?: number;
	onResize?: (width: number) => void;
	onResizeEnd?: (width: number) => void;
	persistKey?: string;
	onCollapse?: () => void;
}

export interface UseSidebarResizeReturn {
	width: number;
	isResizing: boolean;
	handleRef: React.RefObject<HTMLDivElement>;
	getHandleProps: () => {
		ref: React.RefObject<HTMLDivElement>;
		onPointerDown: (e: React.PointerEvent) => void;
		onDoubleClick: () => void;
		onKeyDown: (e: React.KeyboardEvent) => void;
		role: "separator";
		"aria-label": string;
		"aria-orientation": "vertical";
		"aria-valuenow": number;
		"aria-valuemin": number;
		"aria-valuemax": number;
		tabIndex: number;
		style: React.CSSProperties;
		"data-resize-handle": boolean;
	};
	resetWidth: () => void;
}

function loadWidth(
	key: string,
	defaultWidth: number,
	minWidth: number,
	maxWidth: number,
): number {
	if (typeof window === "undefined") return defaultWidth;
	try {
		const stored = localStorage.getItem(key);
		if (!stored) return defaultWidth;
		const parsed = Number(stored);
		// Guard against corrupt values and widths persisted under different
		// min/max bounds.
		if (!Number.isFinite(parsed)) return defaultWidth;
		return Math.max(minWidth, Math.min(maxWidth, parsed));
	} catch {
		return defaultWidth;
	}
}

export function useSidebarResize({
	defaultWidth = 260,
	minWidth = 180,
	maxWidth = 480,
	onResize,
	onResizeEnd,
	persistKey,
	onCollapse,
}: UseSidebarResizeOptions = {}): UseSidebarResizeReturn {
	const [width, setWidth] = useState(() =>
		persistKey
			? loadWidth(persistKey, defaultWidth, minWidth, maxWidth)
			: defaultWidth,
	);
	const [isResizing, setIsResizing] = useState(false);
	const handleRef = useRef<HTMLDivElement>(null!);
	const startXRef = useRef(0);
	const startWidthRef = useRef(0);
	// Mirror of `width` so callbacks can read the latest value without listing
	// `width` as a dependency (which would re-subscribe drag listeners on every
	// pointer-move).
	const widthRef = useRef(width);
	widthRef.current = width;
	// Latched while the pointer is below the collapse threshold so onCollapse
	// fires once per downward crossing instead of once per pointer-move.
	const collapseLatchRef = useRef(false);

	const persistWidth = useCallback(
		(value: number) => {
			if (!persistKey) return;
			try {
				localStorage.setItem(persistKey, String(value));
			} catch {
				/* ignore */
			}
		},
		[persistKey],
	);

	const handlePointerMove = useCallback(
		(e: PointerEvent) => {
			const delta = e.clientX - startXRef.current;
			let newWidth = startWidthRef.current + delta;

			// Snap to collapse if below threshold
			if (newWidth < minWidth && onCollapse) {
				if (!collapseLatchRef.current) {
					collapseLatchRef.current = true;
					onCollapse();
				}
				return;
			}
			collapseLatchRef.current = false;

			newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
			setWidth(newWidth);
			onResize?.(newWidth);
		},
		[minWidth, maxWidth, onResize, onCollapse],
	);

	const handlePointerUp = useCallback(() => {
		setIsResizing(false);
		const finalWidth = widthRef.current;
		onResizeEnd?.(finalWidth);
		persistWidth(finalWidth);
	}, [onResizeEnd, persistWidth]);

	// Body styles are owned by this effect so an unmount mid-drag cannot leave
	// the page stuck with a resize cursor and disabled text selection.
	useEffect(() => {
		if (!isResizing) return;
		document.body.style.cursor = "col-resize";
		document.body.style.userSelect = "none";
		document.addEventListener("pointermove", handlePointerMove);
		document.addEventListener("pointerup", handlePointerUp);
		return () => {
			document.removeEventListener("pointermove", handlePointerMove);
			document.removeEventListener("pointerup", handlePointerUp);
			document.body.style.cursor = "";
			document.body.style.userSelect = "";
		};
	}, [isResizing, handlePointerMove, handlePointerUp]);

	const handlePointerDown = useCallback((e: React.PointerEvent) => {
		e.preventDefault();
		(e.target as HTMLElement).setPointerCapture?.(e.pointerId);
		startXRef.current = e.clientX;
		startWidthRef.current = widthRef.current;
		collapseLatchRef.current = false;
		setIsResizing(true);
	}, []);

	const resetWidth = useCallback(() => {
		setWidth(defaultWidth);
		onResize?.(defaultWidth);
		persistWidth(defaultWidth);
	}, [defaultWidth, onResize, persistWidth]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			const step = e.shiftKey ? 20 : 4;
			let next: number | null = null;
			if (e.key === "ArrowLeft") {
				next = Math.max(minWidth, width - step);
			} else if (e.key === "ArrowRight") {
				next = Math.min(maxWidth, width + step);
			} else if (e.key === "Home") {
				next = minWidth;
			} else if (e.key === "End") {
				next = maxWidth;
			}
			if (next === null) return;
			e.preventDefault();
			setWidth(next);
			onResize?.(next);
			// Each keypress is a complete resize action, so it also commits.
			onResizeEnd?.(next);
			persistWidth(next);
		},
		[width, minWidth, maxWidth, onResize, onResizeEnd, persistWidth],
	);

	const getHandleProps = useCallback(
		() => ({
			ref: handleRef,
			onPointerDown: handlePointerDown,
			onDoubleClick: resetWidth,
			onKeyDown: handleKeyDown,
			role: "separator" as const,
			"aria-label": "Resize sidebar",
			"aria-orientation": "vertical" as const,
			"aria-valuenow": width,
			"aria-valuemin": minWidth,
			"aria-valuemax": maxWidth,
			tabIndex: 0,
			style: {
				cursor: "col-resize",
				width: "6px",
				position: "absolute" as const,
				top: 0,
				bottom: 0,
				insetInlineEnd: 0,
				zIndex: 10,
				backgroundColor: "transparent",
				transition: "background-color 150ms ease",
				outline: "none",
				touchAction: "none" as const,
			} satisfies React.CSSProperties,
			"data-resize-handle": true,
		}),
		[handlePointerDown, resetWidth, handleKeyDown, width, minWidth, maxWidth],
	);

	useEffect(() => {
		if (!persistKey || typeof window === "undefined") return;
		const handler = (event: StorageEvent) => {
			if (event.key !== persistKey) return;
			if (event.newValue === null) {
				setWidth(defaultWidth);
				return;
			}
			const parsed = Number(event.newValue);
			if (!Number.isFinite(parsed)) return;
			setWidth(Math.max(minWidth, Math.min(maxWidth, parsed)));
		};
		window.addEventListener("storage", handler);
		return () => window.removeEventListener("storage", handler);
	}, [persistKey, defaultWidth, minWidth, maxWidth]);

	return { width, isResizing, handleRef, getHandleProps, resetWidth };
}
