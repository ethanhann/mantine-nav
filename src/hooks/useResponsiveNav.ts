'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export type SidebarMode = 'persistent' | 'temporary' | 'overlay';

export interface ResponsiveBreakpointConfig {
  sidebarMode: SidebarMode;
  sidebarCollapsed: boolean;
  navbarVisible: boolean;
}

export interface UseResponsiveNavOptions {
  sidebarBreakpoint?: number;
  navbarBreakpoint?: number;
  strategy?: Record<string, ResponsiveBreakpointConfig>;
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
    typeof window !== 'undefined' ? window.innerWidth : 1024,
  );
  const [sidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Auto-hide sidebar on mobile
  useEffect(() => {
    if (viewportWidth < sidebarBreakpoint) {
      setSidebarVisible(false);
    } else {
      setSidebarVisible(true);
    }
  }, [viewportWidth, sidebarBreakpoint]);

  // Print styles
  useEffect(() => {
    if (!printFriendly || typeof window === 'undefined') return;
    const style = document.createElement('style');
    style.id = 'nav-print-styles';
    style.textContent = `@media print { [data-nav-sidebar], [data-nav-navbar] { display: none !important; } }`;
    if (!document.getElementById('nav-print-styles')) {
      document.head.appendChild(style);
    }
    return () => {
      document.getElementById('nav-print-styles')?.remove();
    };
  }, [printFriendly]);

  const isMobile = viewportWidth < sidebarBreakpoint;
  const isTablet = viewportWidth >= sidebarBreakpoint && viewportWidth < navbarBreakpoint;
  const isDesktop = viewportWidth >= navbarBreakpoint;

  const sidebarMode: SidebarMode = useMemo(() => {
    if (isMobile) return 'overlay';
    if (isTablet) return 'temporary';
    return 'persistent';
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
