# Spec 044: TypeScript-First

## Category
Developer Experience

## Status
Draft

## Summary
Strict TypeScript generics, comprehensive type exports, and discriminated unions for nav item data, providing full autocompletion, type safety, and inference throughout the library.

## Motivation
TypeScript adoption in the React ecosystem exceeds 80%. A library with excellent TypeScript support (not just basic types, but generics, inference, and discriminated unions) provides a superior DX that catches bugs at compile time and accelerates development.

## Mantine Foundation
- Mantine v8 is fully TypeScript-first
- Mantine's `factory` pattern for typed component creation
- Generic component props patterns

## API Design

### Core types

```typescript
// Generic NavItem with user data
interface NavItem<TData = unknown> {
  key: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  children?: NavItem<TData>[];
  data?: TData;
  // ... all other props
}

// Discriminated union for item types
type NavItemType<TData = unknown> =
  | NavLinkItem<TData>       // Has href, no children
  | NavGroupItem<TData>      // Has children, optional href
  | NavSectionHeader         // label only, no href, no children
  | NavDividerItem;          // Renders a divider

interface NavLinkItem<TData = unknown> {
  type: 'link';
  href: string;
  label: string;
  data?: TData;
  // ...
}

interface NavGroupItem<TData = unknown> {
  type: 'group';
  label: string;
  children: NavItemType<TData>[];
  data?: TData;
  // ...
}

// Strict callback typing
interface NavCallbacks<TData = unknown> {
  onItemClick?: (item: NavLinkItem<TData>, event: React.MouseEvent) => void;
  onGroupToggle?: (item: NavGroupItem<TData>, opened: boolean) => void;
  onActiveChange?: (item: NavLinkItem<TData> | null) => void;
}
```

### Generic components

```typescript
// NavGroup is generic — TData flows to callbacks
function NavGroup<TData = unknown>(
  props: NavGroupProps<TData>
): ReactElement;

// Usage:
interface ProjectData {
  projectId: string;
  color: string;
}

<NavGroup<ProjectData>
  items={items}
  onItemClick={(item) => {
    // item.data is typed as ProjectData
    console.log(item.data.projectId);  // ✓ Autocomplete works
  }}
/>
```

### Exported types

```typescript
// All types are exported for consumer use
export type {
  NavItem,
  NavItemType,
  NavLinkItem,
  NavGroupItem,
  NavConfig,
  NavColorConfig,
  SidebarVariant,
  ActiveMatcher,
  Workspace,
  UserInfo,
  // ... all types
};
```

### Hooks with generics

```typescript
function useNavItems<TData = unknown>(
  items: NavItem<TData>[]
): {
  flatItems: NavItem<TData>[];
  expandedKeys: Set<string>;
  // ...
};
```

## Behavior
- All props are strictly typed — no `any` types in the public API
- Generic `TData` parameter flows through from items to callbacks
- Discriminated unions enable narrowing: `if (item.type === 'link')` narrows to `NavLinkItem`
- All component props types are exported (e.g., `SidebarProps`, `NavBarProps`)
- `as const` compatible — item arrays defined with `as const` maintain literal types
- Strict `null` checks enforced throughout
- Template literal types for CSS variable names: `--nav-${string}`
- Module augmentation support for extending built-in types

## Accessibility
- TypeScript types enforce required accessibility props (e.g., `aria-label` on icon-only items)
- Type-level enforcement: items without `label` require `aria-label`

## Dependencies
- None (cross-cutting concern affecting all specs)

## Testing Criteria
- [ ] Generic `TData` flows to callbacks with correct type
- [ ] Discriminated union narrowing works
- [ ] All public types are exported
- [ ] No `any` types in public API (`eslint no-explicit-any`)
- [ ] Autocompletion works in VS Code for all props
- [ ] `as const` item arrays work
- [ ] Required `aria-label` enforced for icon-only items
- [ ] Type-only imports work (`import type { NavItem }`)
- [ ] tsd or dtslint type tests pass

## Open Questions
- Should we enforce `key` on every `NavItem` or derive it from `href`?
- Should there be a `NavItem` builder utility for type-safe item creation?
