# Spec v2 006: UserMenu

## Category
SaaS & Multi-Tenant

## Status
Draft

## Summary
A user avatar + dropdown menu component built on Mantine's `Menu`, `Avatar`,
`Group`, and `Text` components for user profile actions.

## Motivation
Every SaaS app needs a user menu. The v1 implementation used raw buttons with no
dropdown styling. v2 uses Mantine's `Menu` for a polished, accessible dropdown.

## Mantine Foundation
- `Menu` + sub-components -- Dropdown menu
- `Avatar` -- User avatar with initials fallback
- `Group` -- Layout
- `Text` -- Name, email, role labels
- `UnstyledButton` -- Trigger

## API Design

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `user` | `UserInfo` | -- | User data |
| `menuItems` | `UserMenuItem[]` | `[]` | Menu actions |
| `showEmail` | `boolean` | `false` | Show email in trigger |
| `showRole` | `boolean` | `false` | Show role in trigger |
| `avatarSize` | `MantineSize \| number` | `'sm'` | Avatar size |

### Types

```typescript
interface UserInfo {
  name: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
}

interface UserMenuItem {
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  color?: MantineColor;     // e.g., 'red' for logout
  dividerBefore?: boolean;  // Render divider above this item
}
```

## Component Structure

```tsx
<UserMenu
  user={{ name: 'Jane', email: 'jane@acme.com', role: 'Admin' }}
  menuItems={[
    { label: 'Profile', icon: <IconUser size={14} /> },
    { label: 'Settings', icon: <IconSettings size={14} /> },
    { label: 'Sign out', icon: <IconLogout size={14} />, color: 'red', dividerBefore: true },
  ]}
  showEmail
/>

// Renders:
<Menu width={200} position="top-start" withinPortal>
  <Menu.Target>
    <UnstyledButton p="xs" style={{ width: '100%' }}>
      <Group gap="sm" wrap="nowrap">
        <Avatar src={user.avatarUrl} size="sm" radius="xl" name={user.name} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" fw={500} truncate>{user.name}</Text>
          {showEmail && <Text size="xs" c="dimmed" truncate>{user.email}</Text>}
        </div>
      </Group>
    </UnstyledButton>
  </Menu.Target>

  <Menu.Dropdown>
    <Menu.Label>{user.name}</Menu.Label>
    {user.role && <Menu.Label>{user.role}</Menu.Label>}
    <Menu.Divider />
    {menuItems.map((item, i) => (
      <Fragment key={i}>
        {item.dividerBefore && <Menu.Divider />}
        <Menu.Item
          leftSection={item.icon}
          color={item.color}
          onClick={item.onClick}
          component={item.href ? 'a' : undefined}
          href={item.href}
        >
          {item.label}
        </Menu.Item>
      </Fragment>
    ))}
  </Menu.Dropdown>
</Menu>
```

## Behavior
- Trigger shows avatar + name (+ email if `showEmail`)
- Click opens Menu dropdown with user info header and action items
- Items with `href` render as links; items with `onClick` render as buttons
- Items with `color` get colored text (e.g., red for destructive actions)
- `dividerBefore` adds a visual separator above the item
- In collapsed/rail mode: trigger shows avatar only, dropdown still opens
- Avatar uses Mantine's initials fallback when no `avatarUrl`

## Accessibility
- Menu.Target: `aria-haspopup="menu"`, `aria-expanded`
- Menu items: `role="menuitem"`
- Keyboard: arrow keys navigate, Enter activates, Escape closes
- Focus trap within dropdown

## Dependencies
- **Spec v2 001** -- NavShell (collapsed state)
- **Spec v2 002** -- NavSidebar (rendered in sidebar footer)

## Testing Criteria
- [ ] Trigger shows user avatar and name
- [ ] Dropdown opens with menu items
- [ ] Items with `onClick` fire callback
- [ ] Items with `href` render as links
- [ ] Items with `color` display correct color
- [ ] Dividers render correctly
- [ ] Avatar falls back to initials
- [ ] Collapsed mode shows avatar only
- [ ] Keyboard navigation works
- [ ] Storybook story

## Open Questions
- Should `UserMenu` support a `children` prop for fully custom dropdown content?
