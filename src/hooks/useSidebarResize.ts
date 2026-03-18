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
    onMouseDown: (e: React.MouseEvent) => void;
    onDoubleClick: () => void;
    role: string;
    'aria-label': string;
    'aria-orientation': string;
    tabIndex: number;
    style: React.CSSProperties;
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

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
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

  const handleMouseUp = useCallback(
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
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
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

  const getHandleProps = useCallback(
    () => ({
      ref: handleRef,
      onMouseDown: handleMouseDown,
      onDoubleClick: resetWidth,
      role: 'separator',
      'aria-label': 'Resize sidebar',
      'aria-orientation': 'vertical' as const,
      tabIndex: 0,
      style: {
        cursor: 'col-resize',
        width: '4px',
        position: 'absolute' as const,
        top: 0,
        bottom: 0,
        insetInlineEnd: 0,
        zIndex: 10,
      },
    }),
    [handleMouseDown, resetWidth],
  );

  return { width, isResizing, handleRef, getHandleProps, resetWidth };
}
