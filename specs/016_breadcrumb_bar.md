# Spec 016: Breadcrumb Bar

## Category
NavBar-Specific

## Status
Draft

## Summary
Auto-generated breadcrumb navigation derived from the current route and the navigation item hierarchy, rendered in the navbar or below it.

## Motivation
Breadcrumbs provide context about the user's location in the app hierarchy and enable quick navigation to parent pages. Auto-generating them from the nav tree eliminates manual maintenance and keeps breadcrumbs in sync with the navigation structure.

## Mantine Foundation
- `Breadcrumbs` — Mantine's breadcrumb component with separator customization
- `Anchor` — Individual breadcrumb links

## API Design

### Props

#### `NavBreadcrumbs` component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `NavItem[]` | inherited | Nav item tree (auto-derived from NavProvider if omitted) |
| `separator` | `ReactNode` | `'/'` | Separator between breadcrumb segments |
| `maxItems` | `number` | `undefined` | Max visible items; middle items collapse to `...` |
| `collapseFrom` | `'start' \| 'end'` | `'start'` | Which end to collapse from when `maxItems` reached |
| `homeItem` | `NavItem \| false` | `undefined` | Override the first breadcrumb (home); `false` to omit |
| `renderItem` | `(item: NavItem, isLast: boolean) => ReactNode` | `undefined` | Custom render for each breadcrumb |
| `showIcons` | `boolean` | `false` | Show nav item icons in breadcrumbs |
| `currentPath` | `string` | auto-detected | Override the current path |

### Hooks

```typescript
function useBreadcrumbs(options?: {
  items?: NavItem[];
  currentPath?: string;
  homeItem?: NavItem | false;
}): {
  breadcrumbs: Array<{
    label: string;
    href: string;
    icon?: ReactNode;
    isLast: boolean;
  }>;
};
```

## Component Structure

```
<NavBar>
  <NavBar.Logo />
  <NavBar.Links />
</NavBar>
<NavBreadcrumbs />   // Below navbar or in a sub-bar

// Renders:
// Home / Settings / Team / Permissions
//  ↑       ↑         ↑       ↑ (current, not a link)
```

## Behavior
- Breadcrumbs are derived by walking the `NavItem` tree to find the path from root to the active item
- The last breadcrumb (current page) is rendered as plain text, not a link
- When `maxItems` is set and there are more breadcrumbs, middle items collapse to an ellipsis menu that expands on click
- `homeItem` allows prepending a "Home" breadcrumb regardless of nav tree structure
- Breadcrumbs update reactively when the route changes (via Spec 005 active state detection)
- If the current route doesn't match any nav item, breadcrumbs fall back to path segments (e.g., `/settings/team` → `["Settings", "Team"]` with title-cased path segments)
- `renderItem` allows full customization of each breadcrumb element

## Accessibility
- Container: `nav` element with `aria-label="Breadcrumb"`
- Items: `<ol>` with `<li>` elements
- Current page: `aria-current="page"` on the last item
- Collapsed items: expandable menu with `aria-label="Show more breadcrumbs"`

## Dependencies
- **Spec 001** — Multi-level nesting (nav tree traversal)
- **Spec 005** — Route-aware active state (determines current location)

## Testing Criteria
- [ ] Breadcrumbs render from root to active item
- [ ] Last item is plain text (not a link)
- [ ] `maxItems` collapses middle items to ellipsis
- [ ] Ellipsis expands on click to show collapsed items
- [ ] `homeItem` prepends correctly
- [ ] Falls back to path segments when route not in nav tree
- [ ] `useBreadcrumbs` returns correct array
- [ ] `aria-current="page"` on last item
- [ ] Storybook story with deep navigation

## Open Questions
- Should breadcrumbs support route params (e.g., `/users/:id` → "User: John")?
- Should the fallback path-segment behavior be opt-in or opt-out?
