'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseSidebarResizeOptions {
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  onResize?: (width: number) => void;
  onResizeEnd?: (width: number) => void;
  persistKey?: string;
  collapsedWidth?: number;
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
    role: string;
    'aria-label': string;
    'aria-orientation': string;
    'aria-valuenow': number;
    'aria-valuemin': number;
    'aria-valuemax': number;
    tabIndex: number;
    style: React.CSSProperties;
    'data-resize-handle': boolean;
  };
  resetWidth: () => void;
}

function loadWidth(key: string, defaultWidth: number): number {
  if (typeof window === 'undefined') return defaultWidth;
  try {
    const stored = localStorage.getItem(key);
    return stored ? Number(stored) : defaultWidth;
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
  collapsedWidth = 60,
  onCollapse,
}: UseSidebarResizeOptions = {}): UseSidebarResizeReturn {
  const [width, setWidth] = useState(() =>
    persistKey ? loadWidth(persistKey, defaultWidth) : defaultWidth,
  );
  const [isResizing, setIsResizing] = useState(false);
  const handleRef = useRef<HTMLDivElement>(null!);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const delta = e.clientX - startXRef.current;
      let newWidth = startWidthRef.current + delta;

      // Snap to collapse if below threshold
      if (newWidth < minWidth && onCollapse) {
        onCollapse();
        return;
      }

      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setWidth(newWidth);
      onResize?.(newWidth);
    },
    [minWidth, maxWidth, onResize, onCollapse],
  );

  const handlePointerUp = useCallback(
    () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      onResizeEnd?.(width);
      if (persistKey) {
        try {
          localStorage.setItem(persistKey, String(width));
        } catch { /* ignore */ }
      }
    },
    [width, onResizeEnd, persistKey],
  );

  useEffect(() => {
    if (!isResizing) return;
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isResizing, handlePointerMove, handlePointerUp]);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      startXRef.current = e.clientX;
      startWidthRef.current = width;
      setIsResizing(true);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [width],
  );

  const resetWidth = useCallback(() => {
    setWidth(defaultWidth);
    onResize?.(defaultWidth);
    if (persistKey) {
      try {
        localStorage.setItem(persistKey, String(defaultWidth));
      } catch { /* ignore */ }
    }
  }, [defaultWidth, onResize, persistKey]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const step = e.shiftKey ? 20 : 4;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const newWidth = Math.max(minWidth, width - step);
        setWidth(newWidth);
        onResize?.(newWidth);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const newWidth = Math.min(maxWidth, width + step);
        setWidth(newWidth);
        onResize?.(newWidth);
      } else if (e.key === 'Home') {
        e.preventDefault();
        setWidth(minWidth);
        onResize?.(minWidth);
      } else if (e.key === 'End') {
        e.preventDefault();
        setWidth(maxWidth);
        onResize?.(maxWidth);
      }
    },
    [width, minWidth, maxWidth, onResize],
  );

  const getHandleProps = useCallback(
    () => ({
      ref: handleRef,
      onPointerDown: handlePointerDown,
      onDoubleClick: resetWidth,
      onKeyDown: handleKeyDown,
      role: 'separator',
      'aria-label': 'Resize sidebar',
      'aria-orientation': 'vertical' as const,
      'aria-valuenow': width,
      'aria-valuemin': minWidth,
      'aria-valuemax': maxWidth,
      tabIndex: 0,
      style: {
        cursor: 'col-resize',
        width: '6px',
        position: 'absolute' as const,
        top: 0,
        bottom: 0,
        insetInlineEnd: 0,
        zIndex: 10,
        backgroundColor: 'transparent',
        transition: 'background-color 150ms ease',
        outline: 'none',
        touchAction: 'none' as const,
      } satisfies React.CSSProperties,
      'data-resize-handle': true,
    }),
    [handlePointerDown, resetWidth, handleKeyDown, width, minWidth, maxWidth],
  );

  return { width, isResizing, handleRef, getHandleProps, resetWidth };
}
