# Spec 032: Breakpoint-Driven Toggle

## Category
Responsive & Layout

## Status
Draft

## Summary
Automatically switch between persistent sidebar and mobile drawer based on viewport width breakpoints, with configurable thresholds and transition behavior.

## Motivation
Navigation must adapt seamlessly to different screen sizes. A persistent sidebar on desktop should become a dismissible drawer on mobile, without requiring the developer to manually manage this transition — the foundational responsive pattern for all sidebar-based layouts.

## Mantine Foundation
- `AppShell` — Has built-in responsive support with `navbar.breakpoint`
- `Burger` — Toggle button for mobile drawer
- `Drawer` — Mobile navigation container
- `useMediaQuery` / `em` — Breakpoint detection

## API Design

### Props

#### `NavLayout` additions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sidebarBreakpoint` | `MantineBreakpoint \| number` | `'md'` | Below this, sidebar becomes a drawer |
| `navbarBreakpoint` | `MantineBreakpoint \| number` | `'sm'` | Below this, navbar links collapse to burger |
| `drawerPosition` | `'left' \| 'right'` | `'left'` | Which side the mobile drawer opens from |
| `drawerSize` | `number \| string` | `'85%'` | Width of the mobile drawer |
| `drawerOverlay` | `boolean` | `true` | Show overlay behind drawer |
| `closeOnNavigate` | `boolean` | `true` | Close drawer when a nav item is clicked |
| `transitionDuration` | `number` | `200` | Drawer transition duration (ms) |

#### `Burger` integration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `burgerPosition` | `'navbar-left' \| 'navbar-right' \| 'custom'` | `'navbar-left'` | Where the burger button appears |

### Hooks

```typescript
function useResponsiveNav(): {
  isMobile: boolean;           // Below sidebar breakpoint
  isTablet: boolean;           // Between navbar and sidebar breakpoints
  isDesktop: boolean;          // Above sidebar breakpoint
  sidebarMode: 'persistent' | 'drawer';
  navbarMode: 'full' | 'collapsed';
  drawerOpened: boolean;
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};
```

## Component Structure

```
<NavLayout sidebarBreakpoint="md" navbarBreakpoint="sm">
  <NavBar burgerPosition="navbar-left" />
  <Sidebar />                    // Persistent on desktop
  <Drawer>                       // Replaces sidebar on mobile
    <Sidebar />
  </Drawer>
  <MainContent />
</NavLayout>
```

## Behavior
- Above `sidebarBreakpoint`: sidebar renders as persistent panel alongside content
- Below `sidebarBreakpoint`: sidebar renders inside a `Drawer` that opens from the side
- A `Burger` button appears in the navbar when the sidebar is in drawer mode
- Clicking the burger toggles the drawer; clicking a nav item closes it (if `closeOnNavigate`)
- The transition between persistent and drawer mode is seamless — no content flash
- Below `navbarBreakpoint`: navbar links collapse; shown in the drawer or a mobile menu
- Breakpoints use Mantine's responsive system (`em()` for consistent breakpoints)
- Drawer overlay prevents interaction with content while open
- Drawer supports swipe-to-close on touch devices

## Accessibility
- Burger: `aria-label="Toggle navigation"`, `aria-expanded`
- Drawer: `role="dialog"`, `aria-label="Navigation"`, focus trap when open
- Closing drawer returns focus to the burger button
- `Escape` closes the drawer

## Dependencies
- **Spec 007** — Programmatic API (drawer state in `useNav`)
- **Spec 013** — Transition animations (drawer transitions)

## Testing Criteria
- [ ] Sidebar persistent above breakpoint
- [ ] Sidebar in drawer below breakpoint
- [ ] Burger appears at correct breakpoint
- [ ] Burger toggles drawer
- [ ] `closeOnNavigate` closes drawer on item click
- [ ] Navbar links collapse at navbar breakpoint
- [ ] Drawer overlay renders
- [ ] Escape closes drawer
- [ ] Focus trap in drawer
- [ ] `useResponsiveNav` returns correct states
- [ ] Storybook story with resizable viewport

## Open Questions
- Should the drawer support a "peek" preview (partially open) on swipe?
- Should breakpoints be configurable per-component or only at the layout level?
