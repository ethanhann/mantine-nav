'use client';

import { useCallback, useRef, useState, type ReactNode } from 'react';
import { Center, Divider, NavLink, Text, Tooltip, Menu } from '@mantine/core';
import type { MantineColor } from '@mantine/core';
import type {
  ActiveMatcher,
  NavAnimationConfig,
  NavCallbacks,
  NavGroupItem,
  NavItemType,
  NavLinkItem,
} from '../../types';
import { useActiveNavItem } from '../../hooks/useActiveNavItem';
import { useNavAnimation } from '../../hooks/useNavAnimation';
import { useNavKeyboard } from '../../hooks/useNavKeyboard';
import { useOptionalNavShell } from '../NavShell';

/** Props for the navigation item tree component. */
export interface NavGroupProps<TData = unknown> extends NavCallbacks<TData> {
  items: NavItemType<TData>[];
  maxDepth?: number;
  renderItem?: (item: NavItemType<TData>, depth: number) => ReactNode;
  activeItem?: string | null;
  activeMatcher?: ActiveMatcher;
  currentPath?: string;
  animation?: Partial<NavAnimationConfig>;
  transitionDuration?: number;
  variant?: 'subtle' | 'light' | 'filled';
  color?: MantineColor;
  // Accordion
  accordion?: boolean;
  accordionScope?: 'global' | 'sibling';
  onAccordionChange?: (openedKey: string | null) => void;
  // Keyboard
  enableKeyboardNav?: boolean;
  typeAhead?: boolean;
  typeAheadTimeout?: number;
  loopNavigation?: boolean;
}

interface InternalNavItemProps<TData = unknown> {
  item: NavItemType<TData>;
  depth: number;
  maxDepth: number;
  expandedGroups: Set<string>;
  onToggleGroup: (key: string) => void;
  isActive: (item: NavItemType<TData>) => boolean;
  onItemClick?: NavCallbacks<TData>['onItemClick'];
  onGroupToggle?: NavCallbacks<TData>['onGroupToggle'];
  renderItem?: (item: NavItemType<TData>, depth: number) => ReactNode;
  transitionDuration: number;
  variant: 'subtle' | 'light' | 'filled';
  color?: MantineColor;
  collapsed?: boolean;
}

function NavItemRenderer<TData>({
  item,
  depth,
  maxDepth,
  expandedGroups,
  onToggleGroup,
  isActive,
  onItemClick,
  onGroupToggle,
  renderItem,
  transitionDuration,
  variant,
  color,
  collapsed,
}: InternalNavItemProps<TData>) {
  if (renderItem) {
    return <>{renderItem(item, depth)}</>;
  }

  if (item.type === 'divider') {
    if (collapsed) return <Divider my="xs" />;
    return <Divider my="xs" />;
  }

  if (item.type === 'section') {
    if (collapsed) return null;
    return (
      <Text
        size="xs"
        fw={700}
        c="dimmed"
        tt="uppercase"
        px="sm"
        pt="md"
        pb={4}
      >
        {item.label}
      </Text>
    );
  }

  if (item.type === 'link') {
    const active = isActive(item);

    // In collapsed mode, show icon-only with tooltip
    if (collapsed && depth === 0) {
      return (
        <Tooltip label={item.label} position="right" withArrow>
          <NavLink
            label=""
            leftSection={item.icon}
            href={item.href}
            active={active}
            variant={variant}
            color={color}
            disabled={item.disabled}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            data-item-id={item.id}
            role="treeitem"
            tabIndex={-1}
            styles={{
              root: { justifyContent: 'center', padding: '8px 0' },
              section: { marginRight: 0 },
            }}
            onClick={(e) => {
              if (item.disabled) {
                e.preventDefault();
                return;
              }
              onItemClick?.(item, e);
            }}
          />
        </Tooltip>
      );
    }

    return (
      <NavLink
        label={item.label}
        leftSection={item.icon}
        rightSection={item.badge}
        href={item.href}
        active={active}
        variant={variant}
        color={color}
        disabled={item.disabled}
        aria-current={active ? 'page' : undefined}
        data-item-id={item.id}
        role="treeitem"
        tabIndex={-1}
        onClick={(e) => {
          if (item.disabled) {
            e.preventDefault();
            return;
          }
          onItemClick?.(item, e);
        }}
      />
    );
  }

  // type === 'group'
  const groupItem = item as NavGroupItem<TData>;
  const isExpanded = expandedGroups.has(groupItem.id);
  const groupActive = isActive(groupItem);

  if (depth >= maxDepth) {
    return null;
  }

  // In collapsed mode, show icon-only group with popover submenu
  if (collapsed && depth === 0) {
    return (
      <Menu position="right-start" withArrow offset={8} withinPortal>
        <Menu.Target>
          <Tooltip label={groupItem.label} position="right" withArrow disabled={groupItem.children.length > 0}>
            <NavLink
              label=""
              leftSection={groupItem.icon}
              active={groupActive}
              variant={variant}
              color={color}
              disabled={groupItem.disabled}
              data-item-id={groupItem.id}
              role="treeitem"
              aria-label={groupItem.label}
              tabIndex={-1}
              styles={{
                root: { justifyContent: 'center', padding: '8px 0' },
                section: { marginRight: 0 },
              }}
            />
          </Tooltip>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>{groupItem.label}</Menu.Label>
          {groupItem.children
            .filter((child): child is NavLinkItem<TData> => child.type === 'link')
            .map((child) => (
              <Menu.Item
                key={child.id}
                leftSection={child.icon}
                disabled={child.disabled}
                component={child.href ? 'a' : undefined}
                {...(child.href ? { href: child.href } : {})}
                onClick={(e: React.MouseEvent) => {
                  if (child.disabled) return;
                  onItemClick?.(child, e);
                }}
              >
                {child.label}
              </Menu.Item>
            ))}
        </Menu.Dropdown>
      </Menu>
    );
  }

  return (
    <NavLink
      label={groupItem.label}
      leftSection={groupItem.icon}
      rightSection={groupItem.badge}
      active={groupActive}
      variant={variant}
      color={color}
      disabled={groupItem.disabled}
      opened={isExpanded}
      data-item-id={groupItem.id}
      role="treeitem"
      aria-expanded={isExpanded}
      tabIndex={-1}
      onClick={() => {
        if (groupItem.disabled) return;
        onToggleGroup(groupItem.id);
        onGroupToggle?.(groupItem, !isExpanded);
      }}
    >
      {groupItem.children.map((child) => (
        <NavItemRenderer
          key={child.id}
          item={child}
          depth={depth + 1}
          maxDepth={maxDepth}
          expandedGroups={expandedGroups}
          onToggleGroup={onToggleGroup}
          isActive={isActive}
          onItemClick={onItemClick}
          onGroupToggle={onGroupToggle}
          renderItem={renderItem}
          transitionDuration={transitionDuration}
          variant={variant}
          color={color}
          collapsed={collapsed}
        />
      ))}
    </NavLink>
  );
}

// Collect sibling group IDs at each level
function getSiblingGroupIds<TData>(
  items: NavItemType<TData>[],
  targetId: string,
): string[] {
  for (const item of items) {
    if (item.type === 'group') {
      if (item.id === targetId) {
        return items
          .filter((i): i is NavGroupItem<TData> => i.type === 'group')
          .map((i) => i.id);
      }
      const found = getSiblingGroupIds(item.children, targetId);
      if (found.length > 0) return found;
    }
  }
  return [];
}

// Collect initial defaultOpened, respecting accordion constraints
function collectDefaultExpanded<TData>(
  items: NavItemType<TData>[],
  accordion: boolean,
  accordionScope: 'global' | 'sibling',
): Set<string> {
  const defaults = new Set<string>();

  if (accordion && accordionScope === 'sibling') {
    collectSiblingLevel(items, defaults);
  } else if (accordion && accordionScope === 'global') {
    findFirstDefault(items, defaults);
  } else {
    collectAll(items, defaults);
  }

  return defaults;
}

function collectAll<TData>(items: NavItemType<TData>[], out: Set<string>) {
  for (const item of items) {
    if (item.type === 'group') {
      if (item.defaultOpened) out.add(item.id);
      collectAll(item.children, out);
    }
  }
}

function collectSiblingLevel<TData>(items: NavItemType<TData>[], out: Set<string>) {
  let foundAtThisLevel = false;
  for (const item of items) {
    if (item.type === 'group') {
      if (item.defaultOpened && !foundAtThisLevel) {
        out.add(item.id);
        foundAtThisLevel = true;
      }
      collectSiblingLevel(item.children, out);
    }
  }
}

function findFirstDefault<TData>(items: NavItemType<TData>[], out: Set<string>): boolean {
  for (const item of items) {
    if (item.type === 'group') {
      if (item.defaultOpened) {
        out.add(item.id);
        return true;
      }
      if (findFirstDefault(item.children, out)) return true;
    }
  }
  return false;
}

// Flatten visible items for keyboard navigation
function flattenVisibleItems<TData>(
  items: NavItemType<TData>[],
  expanded: Set<string>,
  maxDepth: number,
  depth: number = 0,
): NavItemType<TData>[] {
  const result: NavItemType<TData>[] = [];
  for (const item of items) {
    if (item.type === 'divider' || item.type === 'section') continue;
    result.push(item);
    if (item.type === 'group' && expanded.has(item.id) && depth < maxDepth) {
      result.push(...flattenVisibleItems(item.children, expanded, maxDepth, depth + 1));
    }
  }
  return result;
}

/**
 * Renders a tree of navigation items using Mantine NavLink.
 *
 * Handles multi-level nesting, active state detection, accordion behavior,
 * and keyboard navigation. Adapts to sidebar collapsed state automatically.
 *
 * @example
 * ```tsx
 * <NavGroup
 *   items={navItems}
 *   currentPath="/settings/general"
 *   accordion
 * />
 * ```
 */
export function NavGroup<TData = unknown>({
  items,
  maxDepth = 3,
  renderItem,
  activeItem,
  activeMatcher = 'prefix',
  currentPath,
  animation,
  transitionDuration: transitionDurationProp,
  variant = 'subtle',
  color,
  onItemClick,
  onGroupToggle,
  onActiveChange: _onActiveChange,
  // Accordion
  accordion = false,
  accordionScope = 'sibling',
  onAccordionChange,
  // Keyboard
  enableKeyboardNav = true,
  typeAhead = true,
  typeAheadTimeout = 500,
  loopNavigation = true,
}: NavGroupProps<TData>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shell = useOptionalNavShell();

  // Detect collapsed state for icon rail mode
  const isCollapsed = shell ? (shell.desktopCollapsed && !shell.isMobile) : false;

  // Auto-close mobile drawer on link click
  const wrappedOnItemClick: NavCallbacks<TData>['onItemClick'] = useCallback(
    (item: NavLinkItem<TData>, event: React.MouseEvent) => {
      onItemClick?.(item, event);
      if (shell?.isMobile) {
        shell.closeMobile();
      }
    },
    [onItemClick, shell],
  );

  // Manage expanded state with accordion support
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => collectDefaultExpanded(items, accordion, accordionScope),
  );

  const handleToggleGroup = useCallback(
    (key: string) => {
      setExpandedGroups((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
          if (accordion) onAccordionChange?.(null);
        } else {
          if (accordion) {
            if (accordionScope === 'global') {
              next.clear();
            } else {
              const siblings = getSiblingGroupIds(items, key);
              for (const s of siblings) {
                if (s !== key) next.delete(s);
              }
            }
            onAccordionChange?.(key);
          }
          next.add(key);
        }
        return next;
      });
    },
    [accordion, accordionScope, items, onAccordionChange],
  );

  // Active state
  const { isActive: isActiveByRoute } = useActiveNavItem(items, {
    currentPath,
    matcher: activeMatcher,
  });

  const isActive = useCallback(
    (item: NavItemType<TData>): boolean => {
      if (activeItem !== undefined && activeItem !== null) {
        if (item.type === 'link') return item.id === activeItem || item.href === activeItem;
        if (item.type === 'group') return item.id === activeItem;
        return false;
      }
      return isActiveByRoute(item);
    },
    [activeItem, isActiveByRoute],
  );

  // Animation
  const { duration } = useNavAnimation(animation);
  const resolvedDuration = transitionDurationProp ?? duration;

  // Keyboard navigation
  const visibleItems = flattenVisibleItems(items, expandedGroups, maxDepth);

  const { handleKeyDown } = useNavKeyboard({
    items: visibleItems,
    treeItems: items,
    expandedKeys: expandedGroups,
    onToggle: handleToggleGroup,
    onSelect: (item) => {
      if (item.type === 'link') {
        const syntheticEvent = new MouseEvent('click', { bubbles: true }) as unknown as React.MouseEvent;
        wrappedOnItemClick(item, syntheticEvent);
      }
    },
    containerRef: containerRef as React.RefObject<HTMLElement>,
    typeAhead,
    typeAheadTimeout,
    loop: loopNavigation,
    enabled: enableKeyboardNav,
  });

  return (
    <div
      role="tree"
      aria-label="Navigation"
      ref={containerRef}
      onKeyDown={enableKeyboardNav ? handleKeyDown as React.KeyboardEventHandler<HTMLDivElement> : undefined}
    >
      {items.map((item) => (
        <NavItemRenderer
          key={item.id}
          item={item}
          depth={0}
          maxDepth={maxDepth}
          expandedGroups={expandedGroups}
          onToggleGroup={handleToggleGroup}
          isActive={isActive}
          onItemClick={wrappedOnItemClick}
          onGroupToggle={onGroupToggle}
          renderItem={renderItem}
          transitionDuration={resolvedDuration}
          variant={variant}
          color={color}
          collapsed={isCollapsed}
        />
      ))}
    </div>
  );
}
