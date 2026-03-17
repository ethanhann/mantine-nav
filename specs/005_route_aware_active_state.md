# Spec 005: Route-Aware Active State

## Category
Navigation Structure & Behavior

## Status
Draft

## Summary
Automatically highlight the active navigation item based on the current route, with support for exact matching, prefix/wildcard matching, and custom matchers for any routing library.

## Motivation
Active state indication is essential for user orientation in any navigation system. Rather than requiring developers to manually manage active state, the library should integrate with common routing solutions and offer flexible matching strategies.

## Mantine Foundation
- `NavLink` — Has built-in `active` and `variant` props for active styling
- Mantine does not provide routing integration — this spec adds that layer

## API Design

### Props

#### `NavGroup` additions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `activeItem` | `string \| null` | `undefined` | Controlled active item key/href; overrides automatic detection |
| `activeMatcher` | `ActiveMatcher` | `'prefix'` | Strategy for matching the current route to a nav item |
| `onActiveChange` | `(item: NavItem \| null) => void` | `undefined` | Callback when the active item changes |

#### `NavItem` additions (extends Spec 001)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `activeMatch` | `ActiveMatcher` | inherited | Per-item override for the matching strategy |
| `activeExact` | `boolean` | `false` | Shorthand to force exact matching on this item |

#### `ActiveMatcher` type

```typescript
type ActiveMatchStrategy = 'exact' | 'prefix' | 'regex';

type ActiveMatcher =
  | ActiveMatchStrategy
  | RegExp
  | ((currentPath: string, itemHref: string) => boolean);
```

### Hooks

```typescript
function useActiveNavItem(
  items: NavItem[],
  options?: {
    currentPath?: string;           // Override auto-detected path
    matcher?: ActiveMatcher;        // Default matching strategy
    router?: 'react-router' | 'next' | 'custom';  // Router hint
  }
): {
  activeItem: NavItem | null;
  activeHref: string | null;
  isActive: (item: NavItem) => boolean;
};
```

```typescript
function useCurrentPath(router?: 'react-router' | 'next' | 'custom'): string;
```

## Component Structure

No new components — this spec adds behavior to `NavGroup` and individual `NavLink` items via the `active` prop.

```
<NavGroup activeMatcher="prefix">
  <NavLink active={isActive(item)} />   // active prop auto-set
</NavGroup>
```

## Behavior
- **Auto-detection**: By default, reads `window.location.pathname`. When `router` is specified:
  - `'react-router'`: Uses `useLocation()` from `react-router-dom`
  - `'next'`: Uses `usePathname()` from `next/navigation`
  - `'custom'`: Requires `currentPath` to be provided
- **Matching strategies**:
  - `'exact'`: `currentPath === item.href`
  - `'prefix'`: `currentPath.startsWith(item.href)` (with `/` boundary awareness — `/settings` matches `/settings/team` but not `/settings-old`)
  - `'regex'`: `item.href` is treated as a regex pattern
  - Function: Custom `(currentPath, itemHref) => boolean`
- **Precedence**: When multiple items match (e.g., prefix matching), the most specific match wins (longest `href`)
- **Parent highlighting**: When a nested child is active, parent groups are also marked as active (with a distinct `variant` — default `"light"` vs child's `"filled"`)
- Per-item `activeMatch` overrides the group-level `activeMatcher`
- `activeExact={true}` is shorthand for `activeMatch="exact"`

## Accessibility
- Active item receives `aria-current="page"`
- Parent groups containing the active item receive `aria-current="true"` (indicating they contain the current page, but are not the page themselves)

## Dependencies
- **Spec 001** — Multi-level nesting (active state applies within the nav tree)

## Testing Criteria
- [ ] Exact matching: only `/settings` matches `/settings`
- [ ] Prefix matching: `/settings` matches `/settings/team` but not `/settings-old`
- [ ] Regex matching works with custom patterns
- [ ] Custom function matcher is called correctly
- [ ] Most specific match wins when multiple items match
- [ ] Parent groups are highlighted when child is active
- [ ] `aria-current="page"` on active item
- [ ] `activeItem` prop overrides auto-detection
- [ ] `useActiveNavItem` returns correct active item
- [ ] Works with `window.location.pathname` by default
- [ ] Storybook story demonstrating all matching strategies

## Open Questions
- Should we ship router adapters as separate entry points (`@nav/core/react-router`, `@nav/core/next`) to avoid bundling unused router code?
- How to handle hash routing (`/#/path`) vs. path routing?
