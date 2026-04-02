# Spec 017: Tab-Style Variant

## Category
NavBar-Specific

## Status
Draft

## Summary
An alternative navbar rendering that displays top-level navigation as horizontal tabs with an active indicator, suitable for section-based layouts.

## Motivation
Some apps use a tab metaphor for top-level navigation (e.g., GitHub repo tabs, Figma file tabs). This variant provides the visual treatment without requiring a separate tab component, maintaining consistency with the nav system.

## Mantine Foundation
- `Tabs` — Mantine's tab component provides the visual pattern
- `NavLink` — Adapted for horizontal tab-style rendering
- `Indicator` — Animated active indicator

## API Design

### Props

#### `NavBar` additions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'links' \| 'tabs'` | `'links'` | NavBar display mode |
| `tabsProps` | `TabsNavProps` | `undefined` | Configuration when `variant="tabs"` |

#### `TabsNavProps`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `indicatorStyle` | `'underline' \| 'background' \| 'pill'` | `'underline'` | Visual style of the active indicator |
| `indicatorColor` | `MantineColor` | `theme.primaryColor` | Color of the active indicator |
| `animated` | `boolean` | `true` | Animate indicator position on tab change |
| `grow` | `boolean` | `false` | Tabs grow to fill available space |
| `position` | `'left' \| 'center' \| 'right'` | `'left'` | Alignment of tabs within the navbar |

### Hooks

```typescript
function useNavBarVariant(): {
  variant: 'links' | 'tabs';
  setVariant: (variant: 'links' | 'tabs') => void;
};
```

## Component Structure

```
<NavBar variant="tabs">
  <NavBar.Logo />
  <NavBar.Tabs indicatorStyle="underline">
    <NavTab label="Overview" href="/overview" />
    <NavTab label="Projects" href="/projects" />
    <NavTab label="Analytics" href="/analytics" />
    <NavTab label="Settings" href="/settings" />
  </NavBar.Tabs>
  <NavBar.RightSection />
</NavBar>
```

Indicator styles:
```
underline:    [Overview]  [Projects]  [Analytics]
              ──────────

background:   [Overview]  ▐Projects▌  [Analytics]

pill:         [Overview]  (Projects)  [Analytics]
```

## Behavior
- Tab items render horizontally in the navbar's center area
- The active tab is determined by route matching (Spec 005)
- When `animated={true}`, the indicator slides smoothly between tabs on route change
- `grow={true}` distributes tabs evenly across available width
- On small screens, tabs that overflow can scroll horizontally or collapse into a "More" dropdown
- Tabs with `megaMenu` (Spec 014) render the mega menu below on hover/click
- `indicatorStyle` changes the visual treatment of the active state

## Accessibility
- Tab list: `role="tablist"`
- Individual tabs: `role="tab"` with `aria-selected`
- Since these are navigation tabs (not panel-switching tabs), they use `role="tab"` for visual semantics but navigate via `<a>` elements
- Arrow keys move focus between tabs (horizontal)

## Dependencies
- **Spec 005** — Route-aware active state (determines active tab)
- **Spec 006** — Keyboard navigation (horizontal arrow key movement)
- **Spec 014** — Mega menu dropdowns (tabs can have mega menus)
- **Spec 032** — Breakpoint-driven toggle (responsive overflow)

## Testing Criteria
- [ ] Tabs render horizontally
- [ ] Active tab indicator matches route
- [ ] Indicator animates between tabs
- [ ] All three indicator styles render correctly
- [ ] `grow` distributes tabs evenly
- [ ] Overflow tabs scroll or collapse to "More"
- [ ] Arrow keys move focus between tabs
- [ ] `aria-selected` on active tab
- [ ] Storybook story with all indicator styles

## Open Questions
- Should tab overflow use horizontal scrolling or a "More" dropdown?
- Should there be a vertical tab variant for sidebar usage?
