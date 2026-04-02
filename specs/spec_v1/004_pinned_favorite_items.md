# Spec 004: Pinned / Favorite Items

## Category
Navigation Structure & Behavior

## Status
Draft

## Summary
Allow users to pin or favorite navigation items, surfacing them in a dedicated "Pinned" section at the top of the sidebar for quick access.

## Motivation
In apps with large navigation trees, users repeatedly visit a small subset of pages. A pinned/favorites section eliminates scrolling and searching, mirroring patterns seen in tools like Jira, Linear, and Notion.

## Mantine Foundation
- `NavLink` — Renders each pinned item
- `ActionIcon` — Pin/unpin toggle button
- `Divider` — Separates the pinned section from the main nav
- `Transition` — Animate items entering/leaving the pinned section

## API Design

### Props

#### `PinnedSection` component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pinnedItems` | `NavItem[]` | `[]` | The currently pinned items |
| `onUnpin` | `(item: NavItem) => void` | `undefined` | Callback when a user unpins an item |
| `maxPinned` | `number` | `10` | Maximum number of pinnable items |
| `emptyMessage` | `ReactNode` | `"No pinned items"` | Shown when no items are pinned |
| `label` | `string` | `"Pinned"` | Section header text |
| `collapsible` | `boolean` | `true` | Whether the pinned section can be collapsed |

#### Pin action on `NavItem` (extends Spec 001 type)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pinnable` | `boolean` | `true` | Whether this item can be pinned |
| `pinned` | `boolean` | `false` | Whether this item is currently pinned |

#### `NavGroup` additions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onPin` | `(item: NavItem) => void` | `undefined` | Callback when a user pins an item |
| `showPinOnHover` | `boolean` | `true` | Show pin icon on item hover |

### Hooks

```typescript
function usePinnedItems(options?: {
  storageKey?: string;   // localStorage key for persistence
  maxPinned?: number;
}): {
  pinnedItems: NavItem[];
  pin: (item: NavItem) => void;
  unpin: (item: NavItem) => void;
  togglePin: (item: NavItem) => void;
  isPinned: (item: NavItem) => boolean;
  clearAll: () => void;
};
```

## Component Structure

```
<Sidebar>
  <PinnedSection>
    <SectionHeader label="Pinned" />
    <NavLink rightSection={<UnpinButton />} />
    <NavLink rightSection={<UnpinButton />} />
    <Divider />
  </PinnedSection>
  <NavGroup>
    <NavLink rightSection={<PinButton />} />  // Shown on hover
    ...
  </NavGroup>
</Sidebar>
```

## Behavior
- Hovering over a pinnable nav item reveals a pin icon (pushpin) in the right section
- Clicking the pin icon adds the item to the `PinnedSection` and calls `onPin`
- Pinned items appear in a dedicated section at the top of the sidebar, above the main nav
- Each pinned item has an unpin icon (shown on hover) that removes it and calls `onUnpin`
- When `maxPinned` is reached, the pin icon on unpinned items becomes disabled with a tooltip: "Maximum pins reached"
- `usePinnedItems` optionally persists to `localStorage` via `storageKey`
- Pinned items that are removed from the main `items` array are automatically cleaned from the pinned list
- Clicking a pinned item navigates the same way as clicking it in the main nav

## Accessibility
- Pin button: `aria-label="Pin <item label>"` / `aria-label="Unpin <item label>"`
- Pinned section: `aria-label="Pinned navigation items"`
- Pin/unpin actions announce via live region: "Pinned <item>" / "Unpinned <item>"

## Dependencies
- **Spec 001** — Multi-level nesting (operates on `NavItem` type)
- **Spec 011** — Sections & dividers (PinnedSection is a section variant)

## Testing Criteria
- [ ] Pin icon appears on hover for pinnable items
- [ ] Clicking pin adds item to PinnedSection
- [ ] Clicking unpin removes item from PinnedSection
- [ ] `maxPinned` disables further pinning with tooltip
- [ ] `usePinnedItems` persists to localStorage when `storageKey` provided
- [ ] Removing item from main nav auto-removes from pinned
- [ ] Clicking pinned item navigates correctly
- [ ] Empty state renders `emptyMessage`
- [ ] Storybook story with pinnable sidebar

## Open Questions
- Should pinned items be reorderable within the pinned section (cross-reference Spec 003)?
- Should pinning be available via right-click context menu in addition to hover icon?
