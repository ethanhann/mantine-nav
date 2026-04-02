# Spec 031: Starred / Bookmarked Pages

## Category
Analytics & Dashboard

## Status
Draft

## Summary
A user-managed list of bookmarked/starred pages in the sidebar, distinct from pinned items (Spec 004) by being content-specific (dashboards, reports) rather than navigation-structure-specific.

## Motivation
While Spec 004 (Pinned Items) pins nav items from the navigation tree, starring/bookmarking applies to content pages — specific dashboards, reports, or records that the user wants quick access to. This is the pattern used in Salesforce, GitHub (starred repos), and Chrome bookmarks.

## Mantine Foundation
- `NavLink` — Starred items
- `ActionIcon` — Star toggle button
- `Transition` — Add/remove animation

## API Design

### Props

#### `StarredPages` component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `StarredItem[]` | `[]` | Currently starred items |
| `onUnstar` | `(item: StarredItem) => void` | `undefined` | Remove star callback |
| `onReorder` | `(items: StarredItem[]) => void` | `undefined` | Reorder callback |
| `maxItems` | `number` | `25` | Maximum starred items |
| `reorderable` | `boolean` | `false` | Allow drag-to-reorder |
| `emptyMessage` | `ReactNode` | `"No starred pages"` | Empty state |
| `label` | `string` | `"Starred"` | Section header |
| `collapsible` | `boolean` | `true` | Section can be collapsed |
| `storageKey` | `string` | `'nav-starred'` | localStorage key |

#### `StarredItem` type

```typescript
interface StarredItem {
  id: string;
  label: string;
  href: string;
  icon?: ReactNode;
  type?: string;         // "dashboard", "report", "page"
  starredAt?: Date;
}
```

#### `StarButton` component (placed on content pages)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `page` | `Omit<StarredItem, 'starredAt'>` | — | Page to star |
| `starred` | `boolean` | `undefined` | Controlled starred state |
| `onToggle` | `(starred: boolean) => void` | `undefined` | Toggle callback |
| `size` | `MantineSize` | `'sm'` | Button size |

### Hooks

```typescript
function useStarredPages(options?: {
  storageKey?: string;
  maxItems?: number;
}): {
  items: StarredItem[];
  star: (item: Omit<StarredItem, 'starredAt'>) => void;
  unstar: (id: string) => void;
  toggleStar: (item: Omit<StarredItem, 'starredAt'>) => void;
  isStarred: (id: string) => boolean;
};
```

## Component Structure

```
// In sidebar:
<NavSection label="Starred" collapsible>
  <StarredPages items={starredItems} reorderable />
</NavSection>

// On content pages:
<PageHeader>
  <h1>Sales Dashboard</h1>
  <StarButton page={{ id: 'dash-1', label: 'Sales Dashboard', href: '/dashboards/sales' }} />
</PageHeader>
```

## Behavior
- Starred items appear in a dedicated sidebar section
- The `StarButton` (placed on individual pages) toggles the star state
- Star icon is filled when starred, outlined when not
- Adding/removing items triggers an enter/exit animation
- `reorderable={true}` enables drag-to-reorder (integrates with Spec 003)
- Items persist to localStorage via `storageKey`
- `maxItems` caps the list; attempting to star beyond the limit shows a tooltip warning
- Starred items that no longer exist (404) are indicated with a warning style
- Items can be grouped by `type` (dashboards, reports, etc.)

## Accessibility
- Star button: `aria-label="Star <page>"` / `aria-label="Unstar <page>"`, `aria-pressed`
- Starred list: standard list semantics
- Unstar on hover: `aria-label="Remove <page> from starred"`

## Dependencies
- **Spec 003** — Drag-and-drop reordering (optional reorder)
- **Spec 011** — Sections & dividers (renders within a section)

## Testing Criteria
- [ ] `StarButton` toggles star state
- [ ] Starred items appear in sidebar section
- [ ] Unstarring removes from list
- [ ] `maxItems` prevents over-starring
- [ ] Persists to localStorage
- [ ] Reorderable when enabled
- [ ] Enter/exit animation plays
- [ ] Empty state renders
- [ ] `useStarredPages` hook works
- [ ] Storybook story with star toggle

## Open Questions
- Should starred items sync across devices (require server-side storage)?
- Should there be folders/categories within starred items?
