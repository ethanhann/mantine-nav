# Spec v2 001: NavShell -- AppShell Wrapper

## Category
Layout

## Status
Draft

## Summary
`NavShell` is a thin wrapper around Mantine's `AppShell` that provides opinionated
defaults for a sidebar + header navigation layout, with responsive collapse behavior
built in.

## Motivation
Mantine's `AppShell` is powerful but requires boilerplate to wire up responsive
navbar collapse, burger menus, and coordinated header/sidebar state. `NavShell`
provides a single component that handles this plumbing.

## Mantine Foundation
- `AppShell` -- Core layout shell with header, navbar, aside, footer, main
- `AppShell.Header`, `AppShell.Navbar`, `AppShell.Main`
- `Burger` -- Mobile menu toggle
- `useDisclosure` -- Toggle state management
- `useMediaQuery` -- Responsive breakpoint detection

## API Design

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `header` | `ReactNode` | `undefined` | Content for `AppShell.Header` |
| `sidebar` | `ReactNode` | `undefined` | Content for `AppShell.Navbar` |
| `aside` | `ReactNode` | `undefined` | Content for `AppShell.Aside` |
| `footer` | `ReactNode` | `undefined` | Content for `AppShell.Footer` |
| `children` | `ReactNode` | -- | Main content area |
| `headerHeight` | `number \| AppShellResponsiveSize` | `60` | Header height |
| `sidebarWidth` | `number \| AppShellResponsiveSize` | `260` | Sidebar width |
| `sidebarCollapsedWidth` | `number` | `60` | Sidebar width in rail mode |
| `sidebarBreakpoint` | `MantineBreakpoint` | `'sm'` | Breakpoint for mobile collapse |
| `sidebarCollapsible` | `boolean` | `true` | Enable rail mode collapse on desktop |
| `layout` | `'default' \| 'alt'` | `'default'` | AppShell layout mode |
| `withBorder` | `boolean` | `true` | Borders between sections |
| `padding` | `MantineSpacing` | `'md'` | Main content padding |
| `transitionDuration` | `number` | `200` | Collapse transition ms |

### Hooks

```typescript
// Provided via context by NavShell
function useNavShell(): {
  // Mobile drawer
  mobileOpened: boolean;
  toggleMobile: () => void;
  openMobile: () => void;
  closeMobile: () => void;
  // Desktop rail collapse
  desktopCollapsed: boolean;
  toggleDesktop: () => void;
  collapseDesktop: () => void;
  expandDesktop: () => void;
  // Computed
  isMobile: boolean;
};
```

## Component Structure

```tsx
<NavShell
  header={<NavHeader logo={<Logo />} />}
  sidebar={
    <NavSidebar>
      <NavGroup items={items} />
    </NavSidebar>
  }
>
  <h1>Page content</h1>
</NavShell>

// Renders internally:
<NavShellProvider>
  <AppShell
    header={{ height: 60 }}
    navbar={{
      width: { base: 260 },
      breakpoint: 'sm',
      collapsed: { mobile: !mobileOpened, desktop: desktopCollapsed },
    }}
    padding="md"
    transitionDuration={200}
  >
    <AppShell.Header>
      <Group h="100%" px="md">
        <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" />
        {header}
      </Group>
    </AppShell.Header>

    <AppShell.Navbar>
      {sidebar}
    </AppShell.Navbar>

    <AppShell.Main>
      {children}
    </AppShell.Main>
  </AppShell>
</NavShellProvider>
```

## Behavior
- On mobile (below `sidebarBreakpoint`): sidebar is hidden, `Burger` in header toggles it as an overlay
- On desktop: sidebar is always visible; if `sidebarCollapsible`, it can be collapsed to rail width
- `useNavShell()` exposes both mobile and desktop state for child components
- All transitions use Mantine's built-in AppShell transitions
- The `Burger` component is automatically placed in the header on mobile

## Accessibility
- `Burger` has `aria-label="Toggle navigation"`
- AppShell.Navbar gets `role="navigation"`
- Mobile overlay is focus-trapped
- Escape closes mobile drawer

## Dependencies
- None (foundational)

## Testing Criteria
- [ ] Renders AppShell with header and navbar
- [ ] Mobile: sidebar hidden by default, burger visible
- [ ] Mobile: clicking burger shows sidebar overlay
- [ ] Desktop: sidebar visible, burger hidden
- [ ] Desktop collapse: sidebar narrows to `sidebarCollapsedWidth`
- [ ] `useNavShell()` returns correct state
- [ ] Transitions animate smoothly
- [ ] Storybook story with responsive demo

## Open Questions
- Should `NavShell` also handle `AppShell.Aside` for filter panels?
