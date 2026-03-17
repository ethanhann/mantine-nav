# Spec 046: Headless Hooks

## Category
Developer Experience

## Status
Draft

## Summary
Expose `useSidebar` and `useNavBar` hooks that provide all nav state and behavior without rendering any UI, enabling fully custom navigation designs that leverage the library's logic layer.

## Motivation
Some teams need the navigation logic (active state, keyboard nav, responsive behavior, collapse state) but want to build their own visual layer. Headless hooks provide the complete behavioral API without imposing any markup or styling, following the pattern established by Radix Primitives, TanStack Table, and Downshift.

## Mantine Foundation
- React hooks — Core pattern
- `@mantine/hooks` — Utility hooks for DOM interactions

## API Design

### Hooks

#### `useSidebar` — Complete sidebar behavior

```typescript
function useSidebar<TData = unknown>(options: UseSidebarOptions<TData>): {
  // Items
  items: NavItem<TData>[];
  flatVisibleItems: NavItem<TData>[];
  activeItem: NavItem<TData> | null;
  isActive: (item: NavItem<TData>) => boolean;

  // Groups
  expandedKeys: Set<string>;
  toggleGroup: (key: string) => void;
  expandGroup: (key: string) => void;
  collapseGroup: (key: string) => void;
  expandAll: () => void;
  collapseAll: () => void;

  // Collapse
  collapsed: boolean;
  variant: SidebarVariant;
  collapse: () => void;
  expand: () => void;
  toggleCollapse: () => void;
  setVariant: (variant: SidebarVariant) => void;

  // Resize
  width: number;
  isResizing: boolean;
  resizeHandleProps: HTMLAttributes<HTMLElement>;

  // Keyboard
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  containerProps: HTMLAttributes<HTMLElement>;  // Attach to container

  // Responsive
  isMobile: boolean;
  drawerOpened: boolean;
  toggleDrawer: () => void;

  // Item props generator
  getItemProps: (item: NavItem<TData>, index: number) => HTMLAttributes<HTMLElement>;
  getGroupProps: (item: NavItem<TData>) => HTMLAttributes<HTMLElement>;
};

interface UseSidebarOptions<TData = unknown> {
  items: NavItem<TData>[];
  activeHref?: string;
  activeMatcher?: ActiveMatcher;
  accordion?: boolean;
  collapsible?: boolean;
  resizable?: boolean;
  defaultCollapsed?: boolean;
  defaultWidth?: number;
  breakpoint?: number;
  onItemClick?: (item: NavItem<TData>) => void;
  onActiveChange?: (item: NavItem<TData> | null) => void;
  onCollapsedChange?: (collapsed: boolean) => void;
}
```

#### `useNavBar` — Complete navbar behavior

```typescript
function useNavBar<TData = unknown>(options: UseNavBarOptions<TData>): {
  items: NavBarItem<TData>[];
  activeItem: NavBarItem<TData> | null;
  isActive: (item: NavBarItem<TData>) => boolean;
  focusedIndex: number;
  containerProps: HTMLAttributes<HTMLElement>;
  getItemProps: (item: NavBarItem<TData>, index: number) => HTMLAttributes<HTMLElement>;
  getMegaMenuProps: (item: NavBarItem<TData>) => {
    opened: boolean;
    toggle: () => void;
    panelProps: HTMLAttributes<HTMLElement>;
    triggerProps: HTMLAttributes<HTMLElement>;
  };
  burgerProps: HTMLAttributes<HTMLButtonElement>;
  isMobile: boolean;
};
```

#### Prop generators

```typescript
// getItemProps returns everything needed for a nav item:
const itemProps = sidebar.getItemProps(item, index);
// Returns:
{
  role: 'treeitem',
  tabIndex: index === focusedIndex ? 0 : -1,
  'aria-expanded': hasChildren ? isExpanded : undefined,
  'aria-current': isActive ? 'page' : undefined,
  'aria-disabled': item.disabled ? true : undefined,
  'data-active': isActive || undefined,
  onClick: handleClick,
  onKeyDown: handleKeyDown,
  style: { paddingInlineStart: depth * indentWidth },
}
```

## Component Structure

```tsx
// Fully custom sidebar using headless hook:
function CustomSidebar() {
  const sidebar = useSidebar({
    items: navItems,
    collapsible: true,
    resizable: true,
  });

  return (
    <aside {...sidebar.containerProps} style={{ width: sidebar.width }}>
      {sidebar.flatVisibleItems.map((item, index) => (
        <div key={item.key} {...sidebar.getItemProps(item, index)}>
          {item.icon}
          {!sidebar.collapsed && <span>{item.label}</span>}
        </div>
      ))}
      <div {...sidebar.resizeHandleProps} />
    </aside>
  );
}
```

## Behavior
- Headless hooks manage all state internally but expose it for reading
- `getItemProps` and `getGroupProps` return all HTML attributes needed for accessibility and interaction
- Keyboard navigation is handled via event handlers in `containerProps` and `getItemProps`
- No DOM elements are created by the hooks — the consumer renders everything
- Hooks compose: `useSidebar` internally uses `useNavItems`, `useActiveNavItem`, `useNavKeyboard`, etc.
- All callbacks and state updates match the behavior of the rendered components exactly
- Hooks return stable references (memoized) to prevent unnecessary re-renders

## Accessibility
- `getItemProps` includes all required ARIA attributes
- `containerProps` includes `role`, `aria-label`, and keyboard event handlers
- The consumer is responsible for rendering the correct HTML elements, but the props ensure accessibility if applied correctly

## Dependencies
- **Spec 001-013** — All sidebar behavior (hooks implement these)
- **Spec 014-018** — All navbar behavior (hooks implement these)
- **Spec 044** — TypeScript-first (hooks are generic)

## Testing Criteria
- [ ] `useSidebar` manages item expansion state
- [ ] `useSidebar` manages active state
- [ ] `useSidebar` manages collapse state
- [ ] `useSidebar` manages resize state
- [ ] `useSidebar` handles keyboard navigation
- [ ] `getItemProps` returns correct ARIA attributes
- [ ] `useNavBar` manages active state and mega menu
- [ ] Hooks work without any rendered components (headless)
- [ ] All returned references are stable (memoized)
- [ ] Storybook story with custom sidebar using headless hooks

## Open Questions
- Should headless hooks be in a separate package (`@nav/headless`)?
- Should there be a `useNavLayout` hook that combines sidebar + navbar?
