# Spec 030: Recently Viewed

## Category
Analytics & Dashboard

## Status
Draft

## Summary
An auto-populated list in the sidebar showing recently visited pages/dashboards, providing quick access to frequently accessed content without manual pinning.

## Motivation
Users often revisit the same pages. A "Recently Viewed" section provides instant access to recent context without requiring the user to remember or search for pages — a standard pattern in Salesforce, Jira, and most file managers.

## Mantine Foundation
- `NavLink` — Items in the recent list
- `ScrollArea` — If the list is long
- `ActionIcon` — Clear/remove individual items

## API Design

### Props

#### `RecentlyViewed` component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `RecentItem[]` | `undefined` | Controlled list of recent items; if omitted, auto-tracked |
| `maxItems` | `number` | `10` | Maximum items to show |
| `storageKey` | `string` | `'nav-recent'` | localStorage key for persistence |
| `trackAutomatically` | `boolean` | `true` | Auto-track page visits |
| `onItemClick` | `(item: RecentItem) => void` | `undefined` | Click callback |
| `onRemove` | `(item: RecentItem) => void` | `undefined` | Remove callback |
| `onClearAll` | `() => void` | `undefined` | Clear all callback |
| `showTimestamp` | `boolean` | `false` | Show relative time (e.g., "5m ago") |
| `showRemoveOnHover` | `boolean` | `true` | Show remove button on hover |
| `emptyMessage` | `ReactNode` | `"No recent pages"` | Empty state |
| `label` | `string` | `"Recently Viewed"` | Section header |
| `collapsible` | `boolean` | `true` | Section can be collapsed |

#### `RecentItem` type

```typescript
interface RecentItem {
  href: string;
  label: string;
  icon?: ReactNode;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}
```

### Hooks

```typescript
function useRecentlyViewed(options?: {
  maxItems?: number;
  storageKey?: string;
}): {
  items: RecentItem[];
  addItem: (item: Omit<RecentItem, 'timestamp'>) => void;
  removeItem: (href: string) => void;
  clearAll: () => void;
};
```

## Component Structure

```
<Sidebar>
  <NavGroup items={mainItems} />
  <NavSection label="Recently Viewed" collapsible>
    <RecentlyViewed maxItems={5} showTimestamp />
  </NavSection>
</Sidebar>

// Renders:
// Recently Viewed              ▼
// 📊 Sales Dashboard     5m ago
// 📈 Revenue Report     15m ago
// 👥 Team Settings       1h ago
// 📋 Project Alpha       2h ago
```

## Behavior
- When `trackAutomatically={true}`, navigation events are captured and items are added to the list
- Items are deduplicated by `href` — revisiting a page moves it to the top
- The list is capped at `maxItems`; oldest items are evicted
- Items persist to localStorage via `storageKey`
- Hovering an item reveals a remove (✕) button
- "Clear all" option in the section header's right section
- Timestamps render as relative time and update periodically
- Items removed from the main nav tree remain in recents (they're still valid pages)
- The section starts collapsed if empty

## Accessibility
- Section: standard `NavSection` accessibility (Spec 011)
- Remove buttons: `aria-label="Remove <item label> from recent"`
- Timestamps: `<time>` element with `datetime` attribute
- Clear all: `aria-label="Clear all recently viewed items"`

## Dependencies
- **Spec 005** — Route-aware active state (auto-tracking uses route detection)
- **Spec 011** — Sections & dividers (renders within a section)

## Testing Criteria
- [ ] Auto-tracks page visits
- [ ] Deduplicates by href (moves to top)
- [ ] Respects `maxItems` limit
- [ ] Persists to localStorage
- [ ] Remove button hides item
- [ ] Clear all removes everything
- [ ] Timestamps render as relative time
- [ ] Empty state renders
- [ ] `useRecentlyViewed` hook works standalone
- [ ] Storybook story with recent items

## Open Questions
- Should automatic tracking be opt-in per page (some pages may not be worth tracking)?
- Should there be a "Frequently Visited" variant that sorts by visit count instead of recency?
