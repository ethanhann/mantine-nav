# Spec 035: Coordinated Responsive State

## Category
Responsive & Layout

## Status
Draft

## Summary
Ensure the navbar and sidebar share responsive state — when one changes mode (persistent → drawer, expanded → collapsed), the other adapts accordingly to prevent layout conflicts.

## Motivation
When sidebar and navbar operate independently at breakpoints, they can conflict — e.g., both trying to render a burger menu, or the drawer opening while the navbar also expands. Coordinated state ensures a coherent responsive experience across all navigation components.

## Mantine Foundation
- `AppShell` — Already coordinates navbar and aside panels
- `useMediaQuery` — Breakpoint detection
- React Context — Shared state management

## API Design

### Props

#### `NavLayout` additions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `responsiveStrategy` | `ResponsiveStrategy` | `'coordinated'` | How navbar and sidebar coordinate |

#### `ResponsiveStrategy` type

```typescript
type ResponsiveStrategy =
  | 'coordinated'      // Navbar and sidebar coordinate automatically
  | 'independent'      // Each manages its own responsive state
  | ResponsiveConfig;  // Custom configuration

interface ResponsiveConfig {
  breakpoints: {
    mobile: number;      // Below this: full mobile mode
    tablet: number;      // Between mobile and tablet: partial collapse
    desktop: number;     // Above this: full desktop mode
  };
  mobile: {
    sidebar: 'drawer' | 'hidden';
    navbar: 'burger' | 'bottom-bar' | 'hidden';
  };
  tablet: {
    sidebar: 'rail' | 'drawer' | 'persistent';
    navbar: 'full' | 'compact';
  };
  desktop: {
    sidebar: 'persistent' | 'rail';
    navbar: 'full';
  };
}
```

### Hooks

```typescript
function useResponsiveLayout(): {
  mode: 'mobile' | 'tablet' | 'desktop';
  sidebarState: 'persistent' | 'rail' | 'drawer' | 'hidden';
  navbarState: 'full' | 'compact' | 'burger' | 'bottom-bar' | 'hidden';
  breakpoints: { mobile: number; tablet: number; desktop: number };
};
```

## Component Structure

```
<NavLayout responsiveStrategy={{
  breakpoints: { mobile: 480, tablet: 768, desktop: 1024 },
  mobile: { sidebar: 'drawer', navbar: 'burger' },
  tablet: { sidebar: 'rail', navbar: 'full' },
  desktop: { sidebar: 'persistent', navbar: 'full' },
}}>
  <NavBar />
  <Sidebar />
  <MainContent />
</NavLayout>
```

## Behavior
- **`'coordinated'` strategy** (default):
  - Desktop (≥1024px): Sidebar persistent, navbar full
  - Tablet (768-1023px): Sidebar collapses to rail, navbar full
  - Mobile (<768px): Sidebar becomes drawer, navbar shows burger
- The navbar burger button controls the sidebar drawer (single control point)
- Only one mobile navigation pattern is active at a time (no conflicting menus)
- When the sidebar transitions between modes, the navbar adapts (e.g., adding/removing burger)
- State is shared via `NavProvider` context — all components read the same responsive state
- Custom `ResponsiveConfig` overrides allow full control over behavior at each breakpoint
- Transition between breakpoints is smooth (no flash of wrong layout)

## Accessibility
- Screen readers should experience a consistent navigation structure regardless of viewport
- Landmark roles (`<nav>`) are preserved across all responsive modes
- Focus management adapts — no orphaned focus when a component transitions to hidden

## Dependencies
- **Spec 007** — Programmatic API (shared state via NavProvider)
- **Spec 008** — Collapsible rail mode (tablet state)
- **Spec 032** — Breakpoint-driven toggle (breakpoint detection)
- **Spec 033** — Overlay mode (mobile drawer behavior)

## Testing Criteria
- [ ] Desktop: sidebar persistent, navbar full
- [ ] Tablet: sidebar rail, navbar full
- [ ] Mobile: sidebar drawer, navbar burger
- [ ] Burger controls sidebar drawer
- [ ] No conflicting menus at any breakpoint
- [ ] Custom `ResponsiveConfig` applies correctly
- [ ] Smooth transition between breakpoints
- [ ] `useResponsiveLayout` returns correct state
- [ ] Focus not orphaned on mode transition
- [ ] Storybook story with responsive preview

## Open Questions
- Should the `bottom-bar` navbar variant (mobile tab bar) be part of this spec or separate?
- Should responsive breakpoints be configurable per-page (e.g., wider breakpoints for dashboard pages)?
