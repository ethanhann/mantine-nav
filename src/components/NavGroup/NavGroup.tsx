'use client';

import { useCallback, useRef, useState, type ReactNode } from 'react';
import { Collapse } from '@mantine/core';
import type {
  ActiveMatcher,
  NavAnimationConfig,
  NavCallbacks,
  NavGroupItem,
  NavItemType,
} from '../../types';
import { useActiveNavItem } from '../../hooks/useActiveNavItem';
import { useNavAnimation } from '../../hooks/useNavAnimation';
import { useNavKeyboard } from '../../hooks/useNavKeyboard';
import classes from './NavGroup.module.css';

export interface NavGroupProps<TData = unknown> extends NavCallbacks<TData> {
  items: NavItemType<TData>[];
  maxDepth?: number;
  indentPerLevel?: number;
  renderItem?: (item: NavItemType<TData>, depth: number) => ReactNode;
  activeItem?: string | null;
  activeMatcher?: ActiveMatcher;
  currentPath?: string;
  animation?: Partial<NavAnimationConfig>;
  transitionDuration?: number;
  // Spec 002: Accordion
  accordion?: boolean;
  accordionScope?: 'global' | 'sibling';
  onAccordionChange?: (openedKey: string | null) => void;
  // Spec 006: Keyboard
  enableKeyboardNav?: boolean;
  typeAhead?: boolean;
  typeAheadTimeout?: number;
  loopNavigation?: boolean;
}

interface InternalNavItemProps<TData = unknown> {
  item: NavItemType<TData>;
  depth: number;
  maxDepth: number;
  indentPerLevel: number;
  expandedGroups: Set<string>;
  onToggleGroup: (key: string) => void;
  isActive: (item: NavItemType<TData>) => boolean;
  onItemClick?: NavCallbacks<TData>['onItemClick'];
  onGroupToggle?: NavCallbacks<TData>['onGroupToggle'];
  renderItem?: (item: NavItemType<TData>, depth: number) => ReactNode;
  transitionDuration: number;
}

function NavItemRenderer<TData>({
  item,
  depth,
  maxDepth,
  indentPerLevel,
  expandedGroups,
  onToggleGroup,
  isActive,
  onItemClick,
  onGroupToggle,
  renderItem,
  transitionDuration,
}: InternalNavItemProps<TData>) {
  if (renderItem) {
    return <>{renderItem(item, depth)}</>;
  }

  const paddingLeft = depth * indentPerLevel;

  if (item.type === 'divider') {
    return <div className={classes.divider} role="separator" />;
  }

  if (item.type === 'section') {
    return (
      <div className={classes.sectionHeader} role="presentation">
        {item.label}
      </div>
    );
  }

  if (item.type === 'link') {
    const active = isActive(item);
    return (
      <li className={classes.item} role="none">
        <a
          className={classes.link}
          href={item.href}
          role="treeitem"
          data-item-id={item.id}
          data-active={active || undefined}
          data-disabled={item.disabled || undefined}
          aria-current={active ? 'page' : undefined}
          aria-disabled={item.disabled || undefined}
          aria-label={item['aria-label']}
          style={{ paddingInlineStart: `${paddingLeft + 12}px` }}
          tabIndex={-1}
          onClick={(e) => {
            if (item.disabled) {
              e.preventDefault();
              return;
            }
            onItemClick?.(item, e);
          }}
        >
          {item.icon && <span className={classes.icon}>{item.icon}</span>}
          <span className={classes.label}>{item.label}</span>
          {item.badge && <span className={classes.badge}>{item.badge}</span>}
        </a>
      </li>
    );
  }

  // type === 'group'
  const groupItem = item as NavGroupItem<TData>;
  const isExpanded = expandedGroups.has(groupItem.id);
  const groupActive = isActive(groupItem);

  if (depth >= maxDepth) {
    return null;
  }

  return (
    <li className={classes.item} role="none">
      <button
        className={classes.link}
        type="button"
        role="treeitem"
        data-item-id={groupItem.id}
        aria-expanded={isExpanded}
        data-active={groupActive || undefined}
        data-disabled={groupItem.disabled || undefined}
        aria-disabled={groupItem.disabled || undefined}
        aria-label={groupItem['aria-label']}
        style={{ paddingInlineStart: `${paddingLeft + 12}px` }}
        tabIndex={-1}
        onClick={() => {
          if (groupItem.disabled) return;
          onToggleGroup(groupItem.id);
          onGroupToggle?.(groupItem, !isExpanded);
        }}
      >
        {groupItem.icon && <span className={classes.icon}>{groupItem.icon}</span>}
        <span className={classes.label}>{groupItem.label}</span>
        {groupItem.badge && <span className={classes.badge}>{groupItem.badge}</span>}
        <span
          className={classes.chevron}
          data-expanded={isExpanded || undefined}
          aria-hidden="true"
        >
          ▸
        </span>
      </button>
      <Collapse in={isExpanded} transitionDuration={transitionDuration}>
        <ul className={classes.children} role="group">
          {groupItem.children.map((child) => (
            <NavItemRenderer
              key={child.id}
              item={child}
              depth={depth + 1}
              maxDepth={maxDepth}
              indentPerLevel={indentPerLevel}
              expandedGroups={expandedGroups}
              onToggleGroup={onToggleGroup}
              isActive={isActive}
              onItemClick={onItemClick}
              onGroupToggle={onGroupToggle}
              renderItem={renderItem}
              transitionDuration={transitionDuration}
            />
          ))}
        </ul>
      </Collapse>
    </li>
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
        // Return all sibling group IDs at this level
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

function getAllGroupIds<TData>(items: NavItemType<TData>[]): string[] {
  const ids: string[] = [];
  for (const item of items) {
    if (item.type === 'group') {
      ids.push(item.id);
      ids.push(...getAllGroupIds(item.children));
    }
  }
  return ids;
}

// Collect initial defaultOpened, respecting accordion constraints
function collectDefaultExpanded<TData>(
  items: NavItemType<TData>[],
  accordion: boolean,
  accordionScope: 'global' | 'sibling',
): Set<string> {
  const defaults = new Set<string>();

  if (accordion && accordionScope === 'sibling') {
    // Process each sibling group independently
    collectSiblingLevel(items, defaults);
  } else if (accordion && accordionScope === 'global') {
    // Only first defaultOpened across entire tree
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

export function NavGroup<TData = unknown>({
  items,
  maxDepth = 3,
  indentPerLevel = 16,
  renderItem,
  activeItem,
  activeMatcher = 'prefix',
  currentPath,
  animation,
  transitionDuration: transitionDurationProp,
  onItemClick,
  onGroupToggle,
  onActiveChange: _onActiveChange, // reserved for future auto-active tracking
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
  const containerRef = useRef<HTMLUListElement>(null);

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
              // Close all other groups
              next.clear();
            } else {
              // Close sibling groups only
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
    expandedKeys: expandedGroups,
    onToggle: handleToggleGroup,
    onSelect: (item) => {
      if (item.type === 'link' && onItemClick) {
        const syntheticEvent = new MouseEvent('click', { bubbles: true }) as unknown as React.MouseEvent;
        onItemClick(item, syntheticEvent);
      }
    },
    containerRef: containerRef as React.RefObject<HTMLElement>,
    typeAhead,
    typeAheadTimeout,
    loop: loopNavigation,
    enabled: enableKeyboardNav,
  });

  return (
    <ul
      className={classes.root}
      role="tree"
      aria-label="Navigation"
      ref={containerRef}
      onKeyDown={enableKeyboardNav ? handleKeyDown as React.KeyboardEventHandler<HTMLUListElement> : undefined}
    >
      {items.map((item) => (
        <NavItemRenderer
          key={item.id}
          item={item}
          depth={0}
          maxDepth={maxDepth}
          indentPerLevel={indentPerLevel}
          expandedGroups={expandedGroups}
          onToggleGroup={handleToggleGroup}
          isActive={isActive}
          onItemClick={onItemClick}
          onGroupToggle={onGroupToggle}
          renderItem={renderItem}
          transitionDuration={resolvedDuration}
        />
      ))}
    </ul>
  );
}
