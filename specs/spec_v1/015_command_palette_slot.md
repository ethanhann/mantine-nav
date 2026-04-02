# Spec 015: Command Palette Slot

## Category
NavBar-Specific

## Status
Draft

## Summary
An integration point in the navbar for a search/command palette (Cmd+K / Ctrl+K), providing a consistent trigger button and the wiring for a modal-based search experience.

## Motivation
Command palettes (Cmd+K) have become a standard UX pattern in developer tools and SaaS apps (Linear, Vercel, GitHub). The navbar needs a dedicated slot for the search trigger and seamless integration with the palette modal.

## Mantine Foundation
- `Spotlight` — Mantine's built-in command palette/search component
- `Kbd` — Renders keyboard shortcut hints
- `TextInput` — Search input styling
- `Modal` — If using a custom palette instead of Spotlight

## API Design

### Props

#### `CommandPaletteSlot` component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `shortcut` | `string[]` | `['mod+K']` | Keyboard shortcut(s) to open the palette |
| `placeholder` | `string` | `"Search..."` | Placeholder text in the trigger button |
| `showShortcutHint` | `boolean` | `true` | Show keyboard shortcut badge in the trigger |
| `onClick` | `() => void` | `undefined` | Custom click handler (overrides built-in Spotlight) |
| `variant` | `'input' \| 'button' \| 'icon'` | `'input'` | Visual style of the trigger |
| `width` | `number \| string` | `240` | Width of the trigger element |
| `spotlight` | `boolean` | `true` | Use Mantine Spotlight integration |
| `spotlightProps` | `SpotlightProps` | `undefined` | Props passed to Mantine Spotlight |

#### `NavBar` additions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `commandPalette` | `ReactNode \| CommandPaletteSlotProps` | `undefined` | Content for the command palette slot |

### Hooks

```typescript
function useCommandPalette(): {
  opened: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  query: string;
  setQuery: (query: string) => void;
};
```

## Component Structure

```
<NavBar>
  <NavBar.Logo />
  <NavBar.Links />
  <NavBar.CommandPalette>
    <CommandPaletteSlot
      placeholder="Search or jump to..."
      shortcut={['mod+K']}
    />
  </NavBar.CommandPalette>
  <NavBar.RightSection />
</NavBar>
```

Trigger variants:
```
// 'input' variant — looks like a search input
┌──────────────────────────┐
│ 🔍 Search...       ⌘K   │
└──────────────────────────┘

// 'button' variant — compact button
┌──────────┐
│ 🔍 Search │
└──────────┘

// 'icon' variant — icon only
┌────┐
│ 🔍 │
└────┘
```

## Behavior
- The trigger renders in the navbar's center or right section (configurable)
- Clicking the trigger or pressing the keyboard shortcut opens Mantine's `Spotlight` (or a custom modal)
- The shortcut hint (e.g., `⌘K`) is shown inside the trigger using Mantine's `Kbd` component
- When `spotlight={true}`, the component automatically registers the keyboard shortcut with `Spotlight`
- When `spotlight={false}`, `onClick` is called instead, allowing integration with any custom palette
- The trigger is responsive: on small screens, `'input'` variant shrinks to `'icon'` variant
- `useCommandPalette()` exposes state for external control

## Accessibility
- Trigger: `role="button"`, `aria-label="Open command palette"`
- Keyboard shortcut announced via `aria-keyshortcuts`
- When opened, focus moves to the search input
- Escape closes the palette and returns focus to the trigger

## Dependencies
- **Spec 006** — Keyboard navigation (shortcut integration)
- **Spec 032** — Breakpoint-driven toggle (responsive trigger variant)

## Testing Criteria
- [ ] Trigger renders in all three variants
- [ ] Clicking trigger opens Spotlight/modal
- [ ] Keyboard shortcut (Cmd+K) opens palette
- [ ] Shortcut hint renders with `Kbd`
- [ ] Responsive: input shrinks to icon on small screens
- [ ] `useCommandPalette()` controls open state
- [ ] Custom `onClick` works when `spotlight={false}`
- [ ] Focus moves to search input on open
- [ ] Escape closes and restores focus
- [ ] Storybook story with all variants

## Open Questions
- Should the command palette include navigation items by default (search through nav items)?
- Should recent searches be tracked and displayed?
