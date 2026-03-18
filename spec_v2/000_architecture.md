# Spec v2 000: Architecture & Design Philosophy

## Problem Statement

The v1 implementation reinvents UI primitives (buttons, dropdowns, menus, popovers,
scrollable areas, avatars, badges, tooltips) using raw HTML elements and inline styles.
This produces unstyled, inconsistent components that don't integrate with the Mantine
ecosystem. It defeats the purpose of building on Mantine.

## Design Philosophy

**This library is a Mantine v8 extension, not a standalone component library.**

Every component must be built on top of Mantine primitives. We do not reimplement
things Mantine already provides. The value-add of `@ethanhann/nav` is:

1. **Opinionated composition** -- wiring together Mantine's AppShell, NavLink, Menu,
   Tabs, Breadcrumbs, Avatar, Badge, etc. into a cohesive navigation system.
2. **Navigation-specific logic** -- active-state matching, multi-level nesting,
   accordion behavior, keyboard navigation, collapse/rail mode.
3. **SaaS patterns** -- workspace switcher, user menu, plan badges, notification
   indicators composed from Mantine primitives.
4. **Theme integration** -- CSS variables that extend (not replace) Mantine's theme
   system.

## Core Principles

### 1. Mantine-First

Every visual element uses a Mantine component:

| Need              | Use                          | NOT                        |
|-------------------|------------------------------|----------------------------|
| Nav items         | `NavLink`                    | `<a>` + CSS module         |
| Dropdowns/menus   | `Menu` / `Menu.Sub`          | `<div>` with `useState`    |
| Popovers          | `Popover`                    | Absolute-positioned `<div>`|
| Shell layout      | `AppShell` + sub-components  | Custom flex layout          |
| Scrollable areas  | `ScrollArea`                 | `overflow: auto`           |
| Buttons           | `Button` / `ActionIcon` / `UnstyledButton` | `<button>` + inline styles |
| Avatars           | `Avatar`                     | `<img>` + border-radius    |
| Badges            | `Badge`                      | `<span>` + inline styles   |
| Tooltips          | `Tooltip`                    | Title attribute             |
| Keyboard shortcut | `Kbd`                        | `<kbd>` + inline styles    |
| Tabs              | `Tabs`                       | Custom tab CSS              |
| Breadcrumbs       | `Breadcrumbs`                | Custom breadcrumb CSS       |
| Collapse          | `Collapse`                   | Custom height animation     |
| Icons             | `@tabler/icons-react`        | Emoji characters            |

### 2. AppShell Integration

The library's layout components wrap Mantine's `AppShell` pattern:

```
<MantineProvider>
  <AppShell
    header={{ height: 60 }}
    navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
  >
    <AppShell.Header>
      <NavHeader />         <!-- Our component, renders inside AppShell.Header -->
    </AppShell.Header>
    <AppShell.Navbar>
      <NavSidebar />        <!-- Our component, renders inside AppShell.Navbar -->
    </AppShell.Navbar>
    <AppShell.Main>
      {children}
    </AppShell.Main>
  </AppShell>
</MantineProvider>
```

### 3. Extend, Don't Replace Mantine's Theme

- Use `createTheme()` to define nav-specific theme extensions
- CSS variables extend Mantine's variables (prefixed `--nav-*`)
- Color scheme support comes from Mantine's `useMantineColorScheme()`
- All components respond to Mantine's light/dark mode automatically

### 4. No Emojis

All icons use `@tabler/icons-react` or accept `ReactNode` icon props.
No emoji characters in any component.

### 5. Minimal Custom CSS

CSS modules are only used for layout-specific concerns that Mantine doesn't
cover. Most styling comes from Mantine's `classNames`, `styles`, and `vars` APIs.

## Peer Dependencies

```json
{
  "@mantine/core": "^8.0.0",
  "@mantine/hooks": "^8.0.0",
  "@tabler/icons-react": "^3.0.0",
  "react": "^19.0.0",
  "react-dom": "^19.0.0"
}
```

## Package Exports

```typescript
// Layout (wraps AppShell)
export { NavShell } from './NavShell';
export { NavSidebar } from './NavSidebar';
export { NavHeader } from './NavHeader';

// Navigation
export { NavGroup } from './NavGroup';

// SaaS composites
export { WorkspaceSwitcher } from './WorkspaceSwitcher';
export { UserMenu } from './UserMenu';
export { NotificationIndicator } from './NotificationIndicator';
export { PlanBadge } from './PlanBadge';

// Hooks
export { useNavItems } from './hooks/useNavItems';
export { useActiveNavItem } from './hooks/useActiveNavItem';
export { useSidebarState } from './hooks/useSidebarState';

// Types
export type { NavItem, NavShellProps, NavSidebarProps, NavHeaderProps } from './types';
```

## What Gets Removed (vs v1)

These v1 components are replaced by direct Mantine usage or simplified composites:

| v1 Component         | v2 Replacement                              |
|----------------------|---------------------------------------------|
| `Sidebar`            | `NavSidebar` (wraps `AppShell.Navbar`)      |
| `NavBar`             | `NavHeader` (wraps `AppShell.Header`)       |
| `NavLayout`          | `NavShell` (wraps `AppShell`)               |
| `NavBreadcrumbs`     | Mantine `Breadcrumbs` directly              |
| `EnvironmentIndicator` | `Badge` with color prop                   |
| `CommandPaletteSlot` | `Spotlight` from `@mantine/spotlight`       |
| `NavSection`         | Mantine `AppShell.Section`                  |
| `DashboardSwitcher`  | `Menu` composite                            |
| `FilterPanel`        | `AppShell.Aside` + Mantine form controls    |
| `LiveDataStatus`     | `Indicator` + `Badge`                       |
| `FilterIndicator`    | `Badge` + `Group`                           |
| `InviteTeamCTA`      | `Button` with variant                       |
| `OnboardingProgress` | `Progress` + `List`                         |
| `NavThemeProvider`   | `createTheme()` extension                   |
| Custom CSS variables | Mantine theme + minimal `--nav-*` overrides |
