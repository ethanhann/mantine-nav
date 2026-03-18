'use client';

import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export interface NavAPI {
  // Sidebar
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
  sidebarCollapsed: boolean;
  collapseSidebar: () => void;
  expandSidebar: () => void;
  toggleSidebarCollapse: () => void;

  // Navbar
  navbarOpen: boolean;
  openNavbar: () => void;
  closeNavbar: () => void;
  toggleNavbar: () => void;

  // Navigation groups
  expandGroup: (key: string) => void;
  collapseGroup: (key: string) => void;
  toggleGroup: (key: string) => void;
  expandAllGroups: () => void;
  collapseAllGroups: () => void;
  isGroupExpanded: (key: string) => boolean;

  // Navigation
  navigate: (href: string) => void;
  activeHref: string | null;
  setActiveHref: (href: string | null) => void;

  // Callbacks
  onNavigate?: (href: string) => void;
}

export const NavContext = createContext<NavAPI | null>(null);

export interface NavProviderProps {
  children: ReactNode;
  defaultSidebarOpen?: boolean;
  defaultNavbarOpen?: boolean;
  onNavigate?: (href: string) => void;
}

export function NavProvider({
  children,
  defaultSidebarOpen = true,
  defaultNavbarOpen = true,
  onNavigate,
}: NavProviderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(defaultSidebarOpen);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [navbarOpen, setNavbarOpen] = useState(defaultNavbarOpen);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [activeHref, setActiveHref] = useState<string | null>(null);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);

  const collapseSidebar = useCallback(() => setSidebarCollapsed(true), []);
  const expandSidebar = useCallback(() => setSidebarCollapsed(false), []);
  const toggleSidebarCollapse = useCallback(() => setSidebarCollapsed((v) => !v), []);

  const openNavbar = useCallback(() => setNavbarOpen(true), []);
  const closeNavbar = useCallback(() => setNavbarOpen(false), []);
  const toggleNavbar = useCallback(() => setNavbarOpen((v) => !v), []);

  const expandGroup = useCallback((key: string) => {
    setExpandedGroups((prev) => new Set(prev).add(key));
  }, []);

  const collapseGroup = useCallback((key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const toggleGroup = useCallback((key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const expandAllGroups = useCallback(() => {
    // This will be populated by consumers with known group keys
    // For now, it's a no-op that can be extended
  }, []);

  const collapseAllGroups = useCallback(() => {
    setExpandedGroups(new Set());
  }, []);

  const isGroupExpanded = useCallback(
    (key: string) => expandedGroups.has(key),
    [expandedGroups],
  );

  const navigate = useCallback(
    (href: string) => {
      setActiveHref(href);
      onNavigate?.(href);
    },
    [onNavigate],
  );

  const api = useMemo<NavAPI>(
    () => ({
      sidebarOpen,
      openSidebar,
      closeSidebar,
      toggleSidebar,
      sidebarCollapsed,
      collapseSidebar,
      expandSidebar,
      toggleSidebarCollapse,
      navbarOpen,
      openNavbar,
      closeNavbar,
      toggleNavbar,
      expandGroup,
      collapseGroup,
      toggleGroup,
      expandAllGroups,
      collapseAllGroups,
      isGroupExpanded,
      navigate,
      activeHref,
      setActiveHref,
      onNavigate,
    }),
    [
      sidebarOpen, openSidebar, closeSidebar, toggleSidebar,
      sidebarCollapsed, collapseSidebar, expandSidebar, toggleSidebarCollapse,
      navbarOpen, openNavbar, closeNavbar, toggleNavbar,
      expandGroup, collapseGroup, toggleGroup, expandAllGroups, collapseAllGroups,
      isGroupExpanded, navigate, activeHref, onNavigate,
    ],
  );

  return <NavContext.Provider value={api}>{children}</NavContext.Provider>;
}
