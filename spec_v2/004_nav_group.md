# Spec v2 004: NavGroup -- Navigation Items

## Category
Navigation Structure

## Status
Draft

## Summary
`NavGroup` renders a tree of navigation items using Mantine's `NavLink` component.
It handles multi-level nesting, active state detection, accordion behavior, and
adapts to sidebar collapsed state automatically.

## Motivation
This is the core navigation component. Unlike v1 which reimplemented nav links
with raw `<a>` and `<button>` elements plus custom CSS, v2 uses Mantine's `NavLink`
directly. `NavLink` already provides active states, nested children, icons,
descriptions, badges, disabled states, and collapse animation.

## Mantine Foundation
- `NavLink` -- Primary navigation link with built-in:
  - `label`, `description`, `leftSection`, `rightSection`
  - `active` state with `color` and `variant` (filled/light/subtle)
  - `children` for nested links with `childrenOffset`
  - `opened` / `defaultOpened` for collapse control
  - `disabled` state
  - Built-in chevron rotation for groups
- `Tooltip` -- Labels in collapsed/rail mode
- `Indicator` -- Badge dots on nav items

## API Design

### NavItem Type

```typescript
interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: ReactNode;
  description?: string;
  badge?: ReactNode;             // Rendered as rightSection
  disabled?: boolean;
  children?: NavItem[];          // Nested items (makes this a group)
  defaultOpened?: boolean;
  data?: Record<string, unknown>; // Arbitrary user data
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `NavItem[]` | `[]` | Tree of navigation items |
| `currentPath` | `string` | `undefined` | Current URL path for auto-active detection |
| `activeItem` | `string` | `undefined` | Manually set active item by ID |
| `activeMatcher` | `'exact' \| 'prefix' \| ((path: string, href: string) => boolean)` | `'prefix'` | How to match active state |
| `onItemClick` | `(item: NavItem, event: MouseEvent) => void` | `undefined` | Click callback |
| `onGroupToggle` | `(item: NavItem, opened: boolean) => void` | `undefined` | Group expand/collapse callback |
| `accordion` | `boolean` | `false` | Only one group open at a time |
| `maxDepth` | `number` | `3` | Maximum nesting depth |
| `variant` | `NavLinkVariant` | `'subtle'` | Mantine NavLink variant |
| `color` | `MantineColor` | `undefined` | Active state color |

### Hooks

```typescript
function useNavItems(items: NavItem[]): {
  flatItems: NavItem[];
  expandedKeys: Set<string>;
  toggleGroup: (id: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
};

function useActiveNavItem(items: NavItem[], options: {
  currentPath?: string;
  matcher?: 'exact' | 'prefix' | ((path: string, href: string) => boolean);
}): {
  activeItem: NavItem | null;
  isActive: (item: NavItem) => boolean;
};
```

## Component Structure

```tsx
<NavGroup
  items={[
    { id: 'home', label: 'Home', href: '/', icon: <IconHome size={18} /> },
    { id: 'settings', label: 'Settings', icon: <IconSettings size={18} />, children: [
      { id: 'general', label: 'General', href: '/settings/general' },
      { id: 'security', label: 'Security', href: '/settings/security' },
    ]},
  ]}
  currentPath="/settings/general"
/>

// Renders internally:
<>
  <NavLink
    label="Home"
    leftSection={<IconHome size={18} />}
    href="/"
    active={false}
    variant="subtle"
  />
  <NavLink
    label="Settings"
    leftSection={<IconSettings size={18} />}
    defaultOpened
    variant="subtle"
  >
    <NavLink label="General" href="/settings/general" active variant="subtle" />
    <NavLink label="Security" href="/settings/security" active={false} variant="subtle" />
  </NavLink>
</>
```

### In collapsed/rail mode:

```tsx
// When useNavShell().desktopCollapsed is true:
<Tooltip label="Home" position="right">
  <NavLink
    label=""           // Hidden
    leftSection={<IconHome size={18} />}
    href="/"
    active={false}
  />
</Tooltip>
// Groups show a Menu on click instead of inline collapse
<Menu position="right-start">
  <Menu.Target>
    <NavLink label="" leftSection={<IconSettings size={18} />} />
  </Menu.Target>
  <Menu.Dropdown>
    <Menu.Label>Settings</Menu.Label>
    <Menu.Item>General</Menu.Item>
    <Menu.Item>Security</Menu.Item>
  </Menu.Dropdown>
</Menu>
```

## Behavior
- Each `NavItem` with `children` renders as a collapsible `NavLink` with nested children
- `NavLink`'s built-in chevron handles expand/collapse indicator
- Active state: auto-detected from `currentPath` via `activeMatcher`, or manual via `activeItem`
- Accordion mode: expanding one group collapses siblings
- `maxDepth` limits nesting -- items beyond are not rendered (dev warning)
- In collapsed/rail mode (from `useNavShell()`):
  - Labels hidden, only icons shown
  - Leaf items get `Tooltip` with label
  - Groups use `Menu` popover instead of inline collapse
- Section headers: items with `type: 'section'` render as `NavLink` with `label` only,
  non-interactive, styled as section headers
- Dividers: items with `type: 'divider'` render as `Divider` component

## Accessibility
- Root element: `role="tree"`, `aria-label="Navigation"`
- NavLink items: `role="treeitem"` with `aria-expanded` for groups
- Nested lists: `role="group"`
- Active item: `aria-current="page"`
- Disabled items: `aria-disabled="true"`
- Keyboard: Arrow keys navigate, Enter activates, Space toggles groups
- In rail mode, icons have `aria-label` set to item label

## Dependencies
- **Spec v2 001** -- NavShell (`useNavShell()` for collapsed state)
- **Spec v2 002** -- NavSidebar (rendering context)

## Testing Criteria
- [ ] Renders flat list of NavLink items
- [ ] Renders nested items with correct indentation (via `childrenOffset`)
- [ ] Active state detected from `currentPath`
- [ ] Active state set manually via `activeItem`
- [ ] Accordion mode: only one group open at a time
- [ ] `maxDepth` limits rendering depth
- [ ] Rail mode: labels hidden, tooltips shown
- [ ] Rail mode: groups use Menu popover
- [ ] Section headers render as non-interactive labels
- [ ] Dividers render correctly
- [ ] `onItemClick` and `onGroupToggle` fire correctly
- [ ] Keyboard navigation works
- [ ] Storybook stories for all variants

## Open Questions
- Should we support `renderItem` for fully custom item rendering, or is Mantine's
  NavLink flexible enough via `leftSection`/`rightSection`?
