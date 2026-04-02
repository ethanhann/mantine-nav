'use client';

import type { ReactNode } from 'react';

// --- Active matching ---
export type ActiveMatchStrategy = 'exact' | 'prefix' | 'regex';

export type ActiveMatcher =
  | ActiveMatchStrategy
  | RegExp
  | ((currentPath: string, itemHref: string) => boolean);

// --- CSS variable typing ---
export type NavCSSVariable = `--nav-${string}`;

// --- Base item properties shared across all types ---
interface NavItemBase {
  id: string;
  disabled?: boolean;
  visible?: boolean | (() => boolean);
  weight?: number;
}

// --- Discriminated union item types ---

export interface NavLinkItem<TData = unknown> extends NavItemBase {
  type: 'link';
  label: string;
  href: string;
  icon?: ReactNode;
  badge?: ReactNode;
  data?: TData;
  activeMatch?: ActiveMatcher;
  activeExact?: boolean;
  'aria-label'?: string;
  external?: boolean;
  onClick?: (event: React.MouseEvent) => void;
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

// Legacy NavItem alias (unified form)
export interface NavItem<TData = unknown> {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  children?: NavItem<TData>[];
  defaultOpened?: boolean;
  disabled?: boolean;
  visible?: boolean | (() => boolean);
  weight?: number;
  badge?: ReactNode;
  data?: TData;
  activeMatch?: ActiveMatcher;
  activeExact?: boolean;
  'aria-label'?: string;
}

// --- Callbacks ---
export interface NavCallbacks<TData = unknown> {
  onItemClick?: (item: NavLinkItem<TData>, event: React.MouseEvent) => void;
  onGroupToggle?: (item: NavGroupItem<TData>, opened: boolean) => void;
  onActiveChange?: (item: NavLinkItem<TData> | null) => void;
}

// --- Sidebar variants ---
export type SidebarVariant = 'full' | 'rail' | 'mini';

// --- Animation config ---
export interface NavAnimationConfig {
  enabled: boolean;
  duration: number;
  timingFunction: string;
  reducedMotion: 'disable' | 'reduce' | 'system';
}

// --- Workspace / User types (SaaS) ---
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
