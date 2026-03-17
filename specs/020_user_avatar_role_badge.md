# Spec 020: User Avatar + Role Badge

## Category
SaaS & Multi-Tenant

## Status
Draft

## Summary
Display user identity (avatar, name, email) and their role (Admin, Member, Viewer) in the sidebar footer or navbar, with a dropdown menu for profile actions.

## Motivation
Users need to know which account they're signed in as, especially in multi-tenant apps where they may have different roles. A user menu in the navigation provides quick access to profile settings, role information, and sign-out.

## Mantine Foundation
- `Avatar` — User avatar with fallback initials
- `Menu` — Dropdown menu for profile actions
- `Badge` — Role indicator
- `Text` — Name and email display
- `UnstyledButton` — Trigger element

## API Design

### Props

#### `UserMenu` component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `user` | `UserInfo` | — | User data |
| `menuItems` | `UserMenuItem[]` | `[]` | Additional menu items |
| `onSignOut` | `() => void` | `undefined` | Sign out callback |
| `showRole` | `boolean` | `true` | Display role badge |
| `showEmail` | `boolean` | `true` | Display email in the trigger |
| `placement` | `'sidebar-footer' \| 'navbar-right' \| 'custom'` | `'sidebar-footer'` | Where the menu appears |
| `avatarSize` | `MantineSize` | `'sm'` | Size of the avatar |
| `menuPosition` | `'top' \| 'bottom' \| 'right'` | `'top'` | Direction the menu opens |

#### `UserInfo` type

```typescript
interface UserInfo {
  name: string;
  email?: string;
  avatar?: string;        // URL
  role?: string;
  roleColor?: MantineColor;
  status?: 'online' | 'away' | 'busy' | 'offline';
}
```

#### `UserMenuItem` type

```typescript
interface UserMenuItem {
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
  divider?: boolean;      // Render a divider before this item
  color?: MantineColor;   // e.g., 'red' for sign out
}
```

### Hooks

```typescript
function useUserMenu(): {
  opened: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};
```

## Component Structure

```
<Sidebar.Footer>
  <UserMenu
    user={{ name: "Jane Doe", email: "jane@acme.com", role: "Admin" }}
    menuItems={[
      { label: "Profile", icon: <IconUser />, href: "/profile" },
      { label: "Settings", icon: <IconSettings />, href: "/settings" },
      { divider: true, label: "Sign out", icon: <IconLogout />, color: "red" },
    ]}
    onSignOut={handleSignOut}
  />
</Sidebar.Footer>

// Trigger renders:
// ┌──────────────────────────┐
// │ 👤 Jane Doe    [Admin]   │
// │    jane@acme.com         │
// └──────────────────────────┘
```

## Behavior
- The trigger shows the user's avatar, name, and optionally email and role badge
- Clicking the trigger opens a `Menu` dropdown with the provided `menuItems`
- If `onSignOut` is provided, a "Sign out" item is automatically appended (with red color and divider)
- In rail mode (Spec 008), only the avatar is shown; name/email/role are hidden
- Avatar falls back to initials (first letter of first + last name) when no image URL provided
- User status (online/away/busy/offline) shown as a colored dot on the avatar
- The menu opens in the direction specified by `menuPosition` (e.g., "top" for sidebar footer, "bottom" for navbar)

## Accessibility
- Trigger: `aria-label="User menu for <name>"`, `aria-haspopup="menu"`, `aria-expanded`
- Menu: standard `role="menu"` with `role="menuitem"` children
- Role badge: `aria-label="Role: <role>"`
- Status dot: `aria-label="Status: <status>"`

## Dependencies
- **Spec 008** — Collapsible rail mode (compact avatar-only trigger)
- **Spec 012** — Scrollable with sticky zones (footer slot)

## Testing Criteria
- [ ] Trigger renders avatar, name, email, and role
- [ ] Menu opens with provided items
- [ ] Sign out item appended when `onSignOut` provided
- [ ] Avatar falls back to initials
- [ ] Status dot renders with correct color
- [ ] Rail mode shows avatar only
- [ ] Menu opens in correct direction
- [ ] Keyboard navigation through menu items
- [ ] Storybook story with user menu

## Open Questions
- Should the user menu support theme switching (light/dark mode toggle)?
- Should there be a "Switch account" option for multi-account setups?
