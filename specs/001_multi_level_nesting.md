# Spec 001: Multi-Level Nesting

## Category
Navigation Structure & Behavior

## Status
Draft

## Summary
Support 2–3+ levels of nested navigation groups in the sidebar, allowing complex app hierarchies to be represented with expandable/collapsible sub-menus.

## Motivation
Enterprise SaaS apps and analytics dashboards commonly have deep information architectures (e.g., Settings → Team → Permissions). Without multi-level nesting, developers are forced to flatten navigation or build custom solutions. This is a foundational capability that many other specs build upon.

## Mantine Foundation
- `NavLink` — Mantine's built-in nav link already supports a `children` prop for one level of nesting
- `Collapse` / `UnstyledButton` — For animated expand/collapse of groups
- `ScrollArea` — When deeply nested trees overflow

## API Design

### Props

#### `NavItem` (shared type used across the library)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Display text for the nav item |
| `icon` | `ReactNode` | `undefined` | Icon rendered before the label |
| `href` | `string` | `undefined` | Navigation target; if omitted, item acts as a group header |
| `children` | `NavItem[]` | `undefined` | Nested child items — presence makes this a group |
| `defaultOpened` | `boolean` | `false` | Whether this group starts expanded |
| `disabled` | `boolean` | `false` | Disables the item and its children |
| `badge` | `ReactNode` | `undefined` | Optional badge rendered after the label |
| `data` | `Record<string, unknown>` | `undefined` | Arbitrary user data attached to the item |

#### `NavGroup` component props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `NavItem[]` | `[]` | The tree of navigation items |
| `maxDepth` | `number` | `3` | Maximum nesting depth rendered (items beyond this are flattened) |
| `indentPerLevel` | `number` | `16` | Pixels of left padding added per nesting level |
| `onItemClick` | `(item: NavItem, event: MouseEvent) => void` | `undefined` | Callback when any item is clicked |
| `onGroupToggle` | `(item: NavItem, opened: boolean) => void` | `undefined` | Callback when a group is expanded or collapsed |
| `renderItem` | `(item: NavItem, depth: number) => ReactNode` | `undefined` | Custom render function for individual items |

### Hooks

```typescript
function useNavItems(items: NavItem[]): {
  flatItems: NavItem[];       // Flattened visible items (respecting open/closed state)
  expandedKeys: Set<string>;  // Currently expanded group keys
  toggleGroup: (key: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
};
```

## Component Structure

```
<NavGroup>
  <NavItem depth={0}>
    <NavLink />                    // Mantine NavLink
    <Collapse>                     // Mantine Collapse for animated show/hide
      <NavItem depth={1}>
        <NavLink />
        <Collapse>
          <NavItem depth={2} />
        </Collapse>
      </NavItem>
    </Collapse>
  </NavItem>
</NavGroup>
```

## Behavior
- Each `NavItem` with `children` is rendered as a collapsible group
- Clicking a group header toggles its expanded/collapsed state
- Groups respect `defaultOpened` on first render; subsequent state is controlled internally or via `useNavItems`
- `maxDepth` limits rendering depth — items beyond the limit are not rendered (a console warning is emitted in development)
- Indentation scales linearly: `depth * indentPerLevel` pixels of left padding
- Transition animation for expand/collapse uses Mantine's `Collapse` component (default 200ms ease)

## Accessibility
- Group headers use `role="treeitem"` with `aria-expanded` reflecting open/closed state
- The entire nav tree uses `role="tree"` on the root element
- Nested lists use `role="group"`
- Focus management follows WAI-ARIA TreeView pattern (see Spec 006 for full keyboard nav)

## Dependencies
- None (foundational spec)

## Testing Criteria
- [ ] Renders a flat list of items with no nesting
- [ ] Renders 2 levels of nesting with correct indentation
- [ ] Renders 3+ levels and respects `maxDepth`
- [ ] Clicking a group toggles its expanded state
- [ ] `defaultOpened` controls initial expansion
- [ ] `onItemClick` fires with correct item reference
- [ ] `onGroupToggle` fires with correct open/close state
- [ ] `useNavItems` returns correct `flatItems` and `expandedKeys`
- [ ] ARIA tree roles are applied correctly
- [ ] Storybook story with 3-level deep hierarchy

## Open Questions
- Should items deeper than `maxDepth` be silently hidden or rendered as a flat overflow list?
- Should the `NavItem` type use `key`/`id` for identity, or derive identity from `href`?
