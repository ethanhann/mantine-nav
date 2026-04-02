'use client';

import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { NavItemType, NavGroupItem } from '../types';

/**
 * A JSON-serializable nav item definition as received from an API.
 * Same shape as `NavItemType` but with `icon` and `badge` as string keys
 * instead of ReactNode, and without function-typed fields (`onClick`, `visible` callbacks).
 */
export interface RemoteNavItem {
  id: string;
  type: 'link' | 'group' | 'section' | 'divider';
  label?: string;
  href?: string;
  icon?: string;
  badge?: string;
  children?: RemoteNavItem[];
  defaultOpened?: boolean;
  disabled?: boolean;
  visible?: boolean;
  weight?: number;
  external?: boolean;
  activeExact?: boolean;
  'aria-label'?: string;
  data?: unknown;
}

/** Maps string keys from the API to React nodes or click handlers. */
export interface NavItemResolvers {
  /** Map icon string keys to React nodes. */
  icons?: Record<string, ReactNode>;
  /** Map badge string keys to React nodes. */
  badges?: Record<string, ReactNode>;
  /** Map item IDs to click handlers. */
  onClick?: Record<string, (event: React.MouseEvent) => void>;
  /** Map item IDs to visibility callbacks (overrides the static `visible` field). */
  visible?: Record<string, boolean | (() => boolean)>;
}

export interface UseRemoteNavItemsOptions {
  /** Raw JSON items from the API. */
  items: RemoteNavItem[] | undefined | null;
  /** Resolvers that hydrate string keys into React nodes and callbacks. */
  resolvers?: NavItemResolvers;
}

export interface UseRemoteNavItemsReturn {
  /** Hydrated nav items ready to pass to `<NavGroup>`. */
  items: NavItemType[];
  /** `true` while `options.items` is nullish (i.e. still loading). */
  isLoading: boolean;
}

function hydrateItems(
  raw: RemoteNavItem[],
  resolvers: NavItemResolvers,
): NavItemType[] {
  return raw.map((item) => {
    const icon = item.icon ? resolvers.icons?.[item.icon] : undefined;
    const badge = item.badge ? resolvers.badges?.[item.badge] : undefined;
    const onClick = resolvers.onClick?.[item.id];
    const visible = item.id in (resolvers.visible ?? {})
      ? resolvers.visible![item.id]
      : item.visible;

    const base = {
      id: item.id,
      disabled: item.disabled,
      weight: item.weight,
      visible,
    };

    switch (item.type) {
      case 'divider':
        return { ...base, type: 'divider' as const, label: item.label };

      case 'section':
        return { ...base, type: 'section' as const, label: item.label! };

      case 'group':
        return {
          ...base,
          type: 'group' as const,
          label: item.label!,
          href: item.href,
          icon,
          badge,
          defaultOpened: item.defaultOpened,
          activeExact: item.activeExact,
          'aria-label': item['aria-label'],
          data: item.data,
          children: item.children ? hydrateItems(item.children, resolvers) : [],
        } as NavGroupItem;

      case 'link':
      default:
        return {
          ...base,
          type: 'link' as const,
          label: item.label!,
          href: item.href!,
          icon,
          badge,
          external: item.external,
          activeExact: item.activeExact,
          'aria-label': item['aria-label'],
          data: item.data,
          onClick,
        };
    }
  });
}

/**
 * Hook that hydrates JSON-serializable nav item definitions from an API
 * into fully-typed `NavItemType[]` with React nodes and callbacks.
 *
 * @example
 * ```tsx
 * const { items, isLoading } = useRemoteNavItems({
 *   items: apiResponse?.navigation,
 *   resolvers: {
 *     icons: { home: <IconHome size={18} />, settings: <IconSettings size={18} /> },
 *     badges: { new: <Badge size="xs">New</Badge> },
 *     onClick: { feedback: () => openFeedbackModal() },
 *   },
 * });
 *
 * <NavGroup items={items} currentPath={pathname} />
 * ```
 */
export function useRemoteNavItems({
  items: rawItems,
  resolvers = {},
}: UseRemoteNavItemsOptions): UseRemoteNavItemsReturn {
  const isLoading = rawItems == null;

  const items = useMemo(
    () => (rawItems ? hydrateItems(rawItems, resolvers) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rawItems],
  );

  return { items, isLoading };
}
