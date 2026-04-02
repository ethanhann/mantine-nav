# Spec 006: Keyboard Navigation

## Category
Navigation Structure & Behavior

## Status
Draft

## Summary
Full keyboard navigation support for the sidebar and navbar following WAI-ARIA TreeView and Menubar patterns — arrow keys, Home/End, type-ahead search, and Enter/Space activation.

## Motivation
Keyboard accessibility is a core requirement for any navigation component. Power users also prefer keyboard-driven workflows. Implementing this correctly from the start ensures compliance with WCAG 2.1 AA and avoids costly retrofitting.

## Mantine Foundation
- `NavLink` — Focusable by default
- `@mantine/hooks` — `useHotkeys` for global shortcuts, `useFocusTrap` for focus containment
- Mantine components already handle basic focus styles

## API Design

### Props

#### `NavGroup` additions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableKeyboardNav` | `boolean` | `true` | Enable/disable keyboard navigation |
| `typeAhead` | `boolean` | `true` | Enable type-ahead search (pressing letter keys jumps to matching item) |
| `typeAheadTimeout` | `number` | `500` | Milliseconds before type-ahead buffer resets |
| `loopNavigation` | `boolean` | `true` | Whether arrow navigation wraps from last to first item |
| `homeEndKeys` | `boolean` | `true` | Whether Home/End jump to first/last visible item |

### Hooks

```typescript
function useNavKeyboard(options: {
  items: NavItem[];
  expandedKeys: Set<string>;
  onToggle: (key: string) => void;
  onSelect: (item: NavItem) => void;
  containerRef: RefObject<HTMLElement>;
  typeAhead?: boolean;
  typeAheadTimeout?: number;
  loop?: boolean;
}): {
  focusedIndex: number;
  setFocusedIndex: (index: number) => void;
  handleKeyDown: (event: KeyboardEvent) => void;
};
```

## Component Structure

No new visual components. Keyboard handling is attached to the `NavGroup` container:

```
<nav role="tree" onKeyDown={handleKeyDown} ref={containerRef}>
  <NavLink role="treeitem" tabIndex={focusedIndex === 0 ? 0 : -1} />
  <NavLink role="treeitem" tabIndex={focusedIndex === 1 ? 0 : -1} />
</nav>
```

## Behavior

### Key mappings (Sidebar — TreeView pattern)

| Key | Action |
|-----|--------|
| `ArrowDown` | Move focus to next visible item |
| `ArrowUp` | Move focus to previous visible item |
| `ArrowRight` | If on collapsed group: expand it. If on expanded group or leaf: move to first child / no-op |
| `ArrowLeft` | If on expanded group: collapse it. If on child: move focus to parent group |
| `Home` | Move focus to first visible item |
| `End` | Move focus to last visible item |
| `Enter` / `Space` | Activate (navigate) the focused item; if group, toggle expand |
| `a-z` / `A-Z` | Type-ahead: jump to next item whose label starts with typed characters |
| `Escape` | Move focus to the sidebar container (blur nav items) |

### Key mappings (NavBar — Menubar pattern)

| Key | Action |
|-----|--------|
| `ArrowRight` | Move focus to next nav link |
| `ArrowLeft` | Move focus to previous nav link |
| `ArrowDown` | Open dropdown (if item has submenu) |
| `Home` / `End` | First / last nav link |
| `Enter` / `Space` | Activate link or toggle dropdown |

### Focus management
- Uses roving `tabIndex` — only the focused item has `tabIndex={0}`, all others have `tabIndex={-1}`
- When a group is collapsed, its children are removed from the tab order
- Focus follows the DOM order of visible items only
- Type-ahead: characters typed within `typeAheadTimeout` are concatenated; the buffer jumps to the next item matching the accumulated string

## Accessibility
- Root element: `role="tree"` (sidebar) or `role="menubar"` (navbar)
- Items: `role="treeitem"` or `role="menuitem"`
- Groups: `role="group"` wrapping children
- `aria-expanded` on group items
- `aria-activedescendant` may be used as alternative to roving tabIndex
- Visible focus indicator (inherits Mantine's focus ring styles)

## Dependencies
- **Spec 001** — Multi-level nesting (keyboard nav traverses the item tree)
- **Spec 002** — Accordion mode (arrow-right/left interacts with accordion state)
- **Spec 005** — Route-aware active state (Enter activates navigation)

## Testing Criteria
- [ ] ArrowDown/Up moves focus through visible items
- [ ] ArrowRight expands collapsed group
- [ ] ArrowLeft collapses expanded group
- [ ] ArrowLeft on child moves focus to parent
- [ ] Home/End jump to first/last item
- [ ] Enter/Space navigates or toggles group
- [ ] Type-ahead jumps to matching item
- [ ] Focus wraps when `loopNavigation={true}`
- [ ] Collapsed children are excluded from tab order
- [ ] Roving tabIndex is applied correctly
- [ ] Works correctly with accordion mode
- [ ] Storybook story with keyboard interaction demo

## Open Questions
- Should we support `*` key to expand all siblings (WAI-ARIA tree pattern optional)?
- Should type-ahead be case-sensitive?
