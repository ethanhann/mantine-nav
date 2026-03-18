# Spec 008: Collapsible Rail Mode

## Category
Sidebar-Specific

## Status
Draft

## Summary
Allow the sidebar to collapse into a narrow icon-only "rail" mode, showing only icons with tooltips on hover, and expand back to full width on demand.

## Motivation
Rail mode maximizes screen real estate for content-heavy apps (dashboards, editors, IDEs) while keeping navigation one click away. It's a standard pattern in tools like VS Code, Google Admin, and AWS Console.

## Mantine Foundation
- `AppShell.Navbar` — Mantine's navbar within AppShell supports width changes
- `Tooltip` — Shows item labels on hover when collapsed
- `Transition` — Animates the width change
- `NavLink` — Renders in compact mode when collapsed

## API Design

### Props

#### `Sidebar` component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `collapsible` | `boolean` | `true` | Whether the sidebar can collapse to rail mode |
| `collapsed` | `boolean` | `undefined` | Controlled collapsed state |
| `defaultCollapsed` | `boolean` | `false` | Initial collapsed state (uncontrolled) |
| `onCollapsedChange` | `(collapsed: boolean) => void` | `undefined` | Callback when collapsed state changes |
| `expandedWidth` | `number \| string` | `260` | Width when fully expanded (px or CSS value) |
| `collapsedWidth` | `number \| string` | `60` | Width when collapsed to rail (px or CSS value) |
| `collapseBreakpoint` | `MantineBreakpoint` | `undefined` | Auto-collapse at this breakpoint |
| `collapseTooltip` | `boolean` | `true` | Show tooltips on hover in rail mode |
| `collapseTransition` | `MantineTransition` | `'scale-x'` | Transition used for label show/hide |
| `collapseTransitionDuration` | `number` | `200` | Transition duration in ms |

#### `CollapseToggle` component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `'top' \| 'bottom' \| 'inline'` | `'bottom'` | Where the toggle button appears |
| `icon` | `ReactNode` | `<ChevronLeft/Right>` | Custom icon for the toggle |
| `label` | `string` | `"Toggle sidebar"` | Accessible label |

### Hooks

```typescript
function useSidebarCollapse(): {
  collapsed: boolean;
  toggle: () => void;
  expand: () => void;
  collapse: () => void;
};
```

## Component Structure

```
<Sidebar collapsed={collapsed} expandedWidth={260} collapsedWidth={60}>
  <Sidebar.Header>
    <Logo collapsed={collapsed} />     // Shows icon-only when collapsed
  </Sidebar.Header>
  <Sidebar.Content>
    <NavGroup>
      <NavLink>
        <Icon />
        <Transition>{label}</Transition>  // Label hidden in rail mode
      </NavLink>
    </NavGroup>
  </Sidebar.Content>
  <Sidebar.Footer>
    <CollapseToggle />
  </Sidebar.Footer>
</Sidebar>
```

## Behavior
- When collapsed, the sidebar width animates from `expandedWidth` to `collapsedWidth`
- Labels, badges, and nested children are hidden; only icons are shown
- Hovering over an icon in rail mode shows a `Tooltip` with the item label
- Groups in rail mode show a popover/flyout with children on hover (instead of inline expand)
- The `CollapseToggle` button (chevron icon) triggers the collapse; its icon flips direction based on state
- If `collapseBreakpoint` is set, the sidebar auto-collapses when the viewport is below that breakpoint and auto-expands above it
- Collapse state is accessible via `useSidebarCollapse()` and `useNav()` (Spec 007)
- Width transition is smooth (CSS `transition: width`) and does not cause layout thrash

## Accessibility
- `CollapseToggle`: `aria-label="Collapse sidebar"` / `"Expand sidebar"`, `aria-expanded`
- In rail mode, each item has `aria-label` set to the item label (since visual label is hidden)
- Tooltips are not sufficient for screen readers — icon items must have accessible names
- Flyout menus in rail mode behave as `role="menu"` with focus trap

## Dependencies
- **Spec 001** — Multi-level nesting (groups behave differently in rail mode)
- **Spec 013** — Transition animations (shared animation system)

## Testing Criteria
- [ ] Sidebar collapses to `collapsedWidth` and expands to `expandedWidth`
- [ ] Labels are hidden in collapsed mode
- [ ] Tooltips appear on hover in collapsed mode
- [ ] CollapseToggle button triggers collapse/expand
- [ ] `onCollapsedChange` fires with correct value
- [ ] `collapseBreakpoint` auto-collapses at correct viewport width
- [ ] Groups show flyout in rail mode
- [ ] Width transition animates smoothly
- [ ] `useSidebarCollapse()` returns correct state
- [ ] Accessible names present on rail mode items
- [ ] Storybook story with toggle and breakpoint demo

## Open Questions
- Should the flyout in rail mode use Mantine's `Popover` or `HoverCard`?
- Should there be a "peek" mode where hovering the rail temporarily expands the full sidebar?
