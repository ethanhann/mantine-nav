'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { Collapse } from '@mantine/core';
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
          data-active={active || undefined}
          data-disabled={item.disabled || undefined}
          aria-current={active ? 'page' : undefined}
          aria-disabled={item.disabled || undefined}
          aria-label={item['aria-label']}
          style={{ paddingInlineStart: `${paddingLeft + 12}px` }}
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
    return null; // maxDepth exceeded
  }

  return (
    <li className={classes.item} role="none">
      <button
        className={classes.link}
        type="button"
        role="treeitem"
        aria-expanded={isExpanded}
        data-active={groupActive || undefined}
        data-disabled={groupItem.disabled || undefined}
        aria-disabled={groupItem.disabled || undefined}
        aria-label={groupItem['aria-label']}
        style={{ paddingInlineStart: `${paddingLeft + 12}px` }}
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
  onActiveChange: _onActiveChange,
}: NavGroupProps<TData>) {
  // Manage expanded state
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const defaults = new Set<string>();
    function collectDefaults(items: NavItemType<TData>[]) {
      for (const item of items) {
        if (item.type === 'group' && item.defaultOpened) {
          defaults.add(item.id);
        }
        if (item.type === 'group') {
          collectDefaults(item.children);
        }
      }
    }
    collectDefaults(items);
    return defaults;
  });

  const handleToggleGroup = useCallback((key: string) => {
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

  return (
    <ul className={classes.root} role="tree" aria-label="Navigation">
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
