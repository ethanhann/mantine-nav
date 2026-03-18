# Spec v2 002: NavSidebar -- Sidebar Content

## Category
Sidebar

## Status
Draft

## Summary
`NavSidebar` provides the content structure for the sidebar, using Mantine's
`AppShell.Section` and `ScrollArea` to create header, scrollable content, and
footer zones. It is rendered inside `AppShell.Navbar` (via `NavShell`).

## Motivation
A navigation sidebar typically has a fixed header (logo/workspace), scrollable
navigation links, and a fixed footer (user menu/collapse toggle). Mantine's
`AppShell.Section` with `grow` and `ScrollArea` provides exactly this pattern.
`NavSidebar` composes these into an opinionated layout.

## Mantine Foundation
- `AppShell.Section` -- Sectioning within navbar (`grow` prop for flex expansion)
- `ScrollArea` -- Scrollable content area
- `ActionIcon` -- Collapse toggle button
- `Tooltip` -- Label on collapse toggle
- `Collapse` -- (Not needed here; AppShell handles width transitions)

## API Design

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `header` | `ReactNode` | `undefined` | Fixed top section (logo, workspace switcher) |
| `children` | `ReactNode` | -- | Scrollable nav content (NavGroup, etc.) |
| `footer` | `ReactNode` | `undefined` | Fixed bottom section (user menu, collapse toggle) |
| `showCollapseToggle` | `boolean` | `true` | Show the rail-mode collapse toggle in footer |
| `collapseTogglePosition` | `'header' \| 'footer'` | `'footer'` | Where collapse toggle renders |

### Sub-components

None -- `NavSidebar` is a single component that sections content via props.

## Component Structure

```tsx
<NavSidebar
  header={<WorkspaceSwitcher ... />}
  footer={<UserMenu ... />}
>
  <NavGroup items={items} />
</NavSidebar>

// Renders internally:
<>
  {header && (
    <AppShell.Section>
      {header}
      {collapseTogglePosition === 'header' && <CollapseToggle />}
    </AppShell.Section>
  )}

  <AppShell.Section grow component={ScrollArea} type="hover">
    {children}
  </AppShell.Section>

  {(footer || showCollapseToggle) && (
    <AppShell.Section>
      {footer}
      {collapseTogglePosition === 'footer' && showCollapseToggle && <CollapseToggle />}
    </AppShell.Section>
  )}
</>
```

Where `CollapseToggle` is:

```tsx
function CollapseToggle() {
  const { desktopCollapsed, toggleDesktop } = useNavShell();
  return (
    <Tooltip label={desktopCollapsed ? 'Expand' : 'Collapse'} position="right">
      <ActionIcon variant="subtle" onClick={toggleDesktop} fullWidth>
        <IconChevronsLeft style={{
          transform: desktopCollapsed ? 'rotate(180deg)' : undefined,
          transition: 'transform 200ms ease',
        }} />
      </ActionIcon>
    </Tooltip>
  );
}
```

## Behavior
- Header section is fixed at top (does not scroll)
- Content section fills remaining space with `ScrollArea` (hover scrollbar)
- Footer section is fixed at bottom (does not scroll)
- Collapse toggle reads state from `useNavShell()` context
- In collapsed/rail mode, `NavSidebar` still renders all sections; child components
  should adapt (e.g., `NavGroup` shows icons only, `WorkspaceSwitcher` shows avatar only)

## Accessibility
- Sections use semantic HTML via `AppShell.Section`
- Collapse toggle: `aria-label="Collapse sidebar"` / `"Expand sidebar"`
- ScrollArea is keyboard-navigable

## Dependencies
- **Spec v2 001** -- NavShell (provides `useNavShell()` context)

## Testing Criteria
- [ ] Renders header, scrollable content, and footer sections
- [ ] Content section scrolls when overflowing
- [ ] Header and footer remain fixed
- [ ] Collapse toggle changes sidebar state
- [ ] Collapse toggle icon rotates based on state
- [ ] Works correctly in both expanded and collapsed states
- [ ] Storybook story with all sections populated

## Open Questions
- Should `NavSidebar` expose `scrollAreaProps` for customizing scrollbar behavior?
