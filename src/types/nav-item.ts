'use client';

import type { ReactNode } from 'react';

// ─── Active matching ──────────────────────────────────────────────
export type ActiveMatchStrategy = 'exact' | 'prefix' | 'regex';

export type ActiveMatcher =
  | ActiveMatchStrategy
  | RegExp
  | ((currentPath: string, itemHref: string) => boolean);

// ─── CSS variable typing ──────────────────────────────────────────
export type NavCSSVariable = `--nav-${string}`;

// ─── Base item properties shared across all types ─────────────────
interface NavItemBase {
  id: string;
  disabled?: boolean;
}

// ─── Discriminated union item types ───────────────────────────────

export interface NavLinkItem<TData = unknown> extends NavItemBase {
  type: 'link';
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: ReactNode;
  data?: TData;
  activeMatch?: ActiveMatcher;
  activeExact?: boolean;
  /** Required when `icon` is provided but `label` is visually hidden (e.g. rail mode) */
  'aria-label'?: string;
}

export interface NavGroupItem<TData = unknown> extends NavItemBase {
  type: 'group';
  label: string;
  href?: string;
  icon?: ReactNode;
  badge?: ReactNode;
  children: NavItemType<TData>[];
  defaultOpened?: boolean;
  data?: TData;
  activeMatch?: ActiveMatcher;
  activeExact?: boolean;
  'aria-label'?: string;
}

export interface NavSectionHeader extends NavItemBase {
  type: 'section';
  label: string;
}

export interface NavDividerItem extends NavItemBase {
  type: 'divider';
  label?: string;
}

export type NavItemType<TData = unknown> =
  | NavLinkItem<TData>
  | NavGroupItem<TData>
  | NavSectionHeader
  | NavDividerItem;

// ─── Legacy NavItem alias (unified form from Spec 001) ───────────
// This generic interface is used when consumers don't need discriminated unions
export interface NavItem<TData = unknown> {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  children?: NavItem<TData>[];
  defaultOpened?: boolean;
  disabled?: boolean;
  badge?: ReactNode;
  data?: TData;
  activeMatch?: ActiveMatcher;
  activeExact?: boolean;
  'aria-label'?: string;
}

// ─── Callbacks ────────────────────────────────────────────────────
export interface NavCallbacks<TData = unknown> {
  onItemClick?: (item: NavLinkItem<TData>, event: React.MouseEvent) => void;
  onGroupToggle?: (item: NavGroupItem<TData>, opened: boolean) => void;
  onActiveChange?: (item: NavLinkItem<TData> | null) => void;
}

// ─── Sidebar variants ─────────────────────────────────────────────
export type SidebarVariant = 'full' | 'rail' | 'mini';

// ─── Animation config (Spec 013) ─────────────────────────────────
export interface NavAnimationConfig {
  enabled: boolean;
  duration: number;
  timingFunction: string;
  reducedMotion: 'disable' | 'reduce' | 'system';
}

// ─── NavGroup component props ─────────────────────────────────────
export interface NavGroupProps<TData = unknown> extends NavCallbacks<TData> {
  items: NavItemType<TData>[];
  maxDepth?: number;
  indentPerLevel?: number;
  renderItem?: (item: NavItemType<TData>, depth: number) => ReactNode;
  activeItem?: string | null;
  activeMatcher?: ActiveMatcher;
  animation?: Partial<NavAnimationConfig>;
  transitionDuration?: number;
}

// ─── Sidebar props ────────────────────────────────────────────────
export interface SidebarProps<TData = unknown> extends NavGroupProps<TData> {
  variant?: SidebarVariant;
  collapsed?: boolean;
  width?: number;
  collapsedWidth?: number;
  animation?: Partial<NavAnimationConfig>;
  collapseAnimation?: string;
  widthTransitionDuration?: number;
  groupTransitionDuration?: number;
  header?: ReactNode;
  footer?: ReactNode;
  vars?: Record<NavCSSVariable, string>;
}

// ─── NavBar props ─────────────────────────────────────────────────
export interface NavBarProps {
  logo?: ReactNode;
  rightSection?: ReactNode;
  height?: number;
  sticky?: boolean;
  vars?: Record<NavCSSVariable, string>;
}

// ─── NavLayout props ──────────────────────────────────────────────
export interface NavLayoutProps {
  sidebar?: ReactNode;
  navbar?: ReactNode;
  children: ReactNode;
}

// ─── Workspace / User types (SaaS specs) ──────────────────────────
export interface Workspace {
  id: string;
  name: string;
  logo?: ReactNode;
}

export interface UserInfo {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
}

// ─── Nav config (for Dual API, Spec 043) ──────────────────────────
export interface NavConfig<TData = unknown> {
  items: NavItemType<TData>[];
  sidebar?: Omit<SidebarProps<TData>, 'items'>;
  navbar?: NavBarProps;
  animation?: Partial<NavAnimationConfig>;
}

// ─── Color config (Spec 038/040) ──────────────────────────────────
export interface NavColorConfig {
  primary?: string;
  background?: string;
  text?: string;
  activeBackground?: string;
  activeText?: string;
  hoverBackground?: string;
  border?: string;
}
