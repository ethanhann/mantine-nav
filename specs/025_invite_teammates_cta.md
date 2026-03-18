# Spec 025: Invite Teammates CTA

## Category
SaaS & Multi-Tenant

## Status
Draft

## Summary
A dedicated slot in the sidebar for a team invitation prompt — a visually distinct call-to-action encouraging users to invite teammates to their workspace.

## Motivation
Team growth is a key SaaS growth lever. An in-navigation invite CTA keeps team building top-of-mind and provides a friction-free path to invite teammates, driving adoption and retention — a pattern used by Slack, Figma, and Linear.

## Mantine Foundation
- `Button` — CTA button
- `Card` — Container for richer invite prompt
- `TextInput` — Quick email input
- `Avatar.Group` — Show existing team members

## API Design

### Props

#### `InviteTeamCTA` component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'button' \| 'card' \| 'inline'` | `'button'` | Visual style |
| `label` | `string` | `"Invite teammates"` | CTA text |
| `icon` | `ReactNode` | `<IconUserPlus />` | CTA icon |
| `onClick` | `() => void` | `undefined` | Callback when CTA is clicked |
| `href` | `string` | `undefined` | Link alternative to callback |
| `teamMembers` | `Array<{ name: string; avatar?: string }>` | `undefined` | Show existing team avatars |
| `maxAvatars` | `number` | `3` | Max avatars to show before "+N" |
| `description` | `string` | `undefined` | Subtitle text for card variant |
| `dismissible` | `boolean` | `true` | Allow user to dismiss |
| `onDismiss` | `() => void` | `undefined` | Dismiss callback |
| `placement` | `'sidebar' \| 'sidebar-footer' \| 'custom'` | `'sidebar'` | Where to render |

### Hooks

```typescript
function useInviteCTA(): {
  isDismissed: boolean;
  dismiss: () => void;
  reset: () => void;
};
```

## Component Structure

```
<Sidebar>
  <Sidebar.Content>
    <NavGroup ... />
  </Sidebar.Content>
  <InviteTeamCTA
    variant="card"
    teamMembers={members}
    onClick={() => openInviteModal()}
    description="Collaborate with your team"
  />
</Sidebar>

// Button variant:    [👤+ Invite teammates]
//
// Card variant:      ┌───────────────────────┐
//                    │ 👤👤👤 +2 more        │
//                    │ Invite teammates       │
//                    │ Collaborate with your  │
//                    │ team                   │
//                    │ [Invite]         ✕     │
//                    └───────────────────────┘
//
// Inline variant:    👤+ Invite teammates →
```

## Behavior
- The CTA renders as a distinct visual element in the sidebar, separate from nav items
- Button variant: simple button with icon and label
- Card variant: a compact card with team avatars, description, and button
- Inline variant: a subtle link-style element
- `teamMembers` renders an `Avatar.Group` showing who's already on the team
- Clicking the CTA calls `onClick` or navigates to `href`
- `dismissible={true}` shows a close button; dismissal persists via sessionStorage/localStorage
- In rail mode (Spec 008), renders as an icon-only button
- The CTA should be hidden when the user has no invite permissions

## Accessibility
- CTA button: standard button semantics with descriptive `aria-label`
- Dismiss button: `aria-label="Dismiss invite prompt"`
- Team avatars: `aria-label="Team members: <names>"`

## Dependencies
- **Spec 008** — Collapsible rail mode (compact CTA)
- **Spec 012** — Scrollable with sticky zones (placement options)

## Testing Criteria
- [ ] All three variants render correctly
- [ ] Clicking CTA calls `onClick`
- [ ] Team member avatars render
- [ ] `maxAvatars` limits shown avatars with "+N" overflow
- [ ] Dismiss button hides the CTA
- [ ] Dismissed state persists
- [ ] Rail mode shows icon-only
- [ ] Storybook story with all variants

## Open Questions
- Should the CTA include a quick email input for inline invites?
- After how many team members should the CTA auto-hide?
