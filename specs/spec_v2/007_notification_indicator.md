# Spec v2 007: NotificationIndicator

## Category
SaaS & Multi-Tenant

## Status
Draft

## Summary
A notification bell icon with unread count indicator, built on Mantine's
`ActionIcon`, `Indicator`, `Menu`, and `Text` components.

## Motivation
Notification indicators are ubiquitous in SaaS apps. The v1 implementation used
an emoji bell with inline-styled badge. v2 uses Mantine's `Indicator` for the
badge dot/count and `Menu` for the notification dropdown.

## Mantine Foundation
- `ActionIcon` -- Icon button
- `Indicator` -- Badge overlay (count, dot, processing animation)
- `Menu` + sub-components -- Notification dropdown
- `Text` -- Notification text
- `Group` -- Layout
- `ScrollArea` -- Scrollable notification list
- `@tabler/icons-react` -- `IconBell`

## API Design

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | `0` | Unread notification count |
| `maxCount` | `number` | `99` | Max count before showing "99+" |
| `notifications` | `NotificationItem[]` | `[]` | Notification list for dropdown |
| `onRead` | `(id: string) => void` | `undefined` | Mark single as read |
| `onReadAll` | `() => void` | `undefined` | Mark all as read |
| `onClick` | `() => void` | `undefined` | Bell click callback |
| `showDropdown` | `boolean` | `true` | Show notification dropdown vs just trigger onClick |
| `color` | `MantineColor` | `'red'` | Indicator color |

### Types

```typescript
interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  read?: boolean;
  timestamp?: Date;
  icon?: ReactNode;
  href?: string;
}
```

## Component Structure

```tsx
<NotificationIndicator
  count={3}
  notifications={notifications}
  onRead={handleRead}
  onReadAll={handleReadAll}
/>

// Renders:
<Menu width={340} position="bottom-end" withinPortal>
  <Menu.Target>
    <Indicator
      label={count > maxCount ? `${maxCount}+` : count}
      size={16}
      color={color}
      disabled={count === 0}
      processing={count > 0}
    >
      <ActionIcon variant="subtle" size="lg" aria-label={ariaLabel}>
        <IconBell size={20} />
      </ActionIcon>
    </Indicator>
  </Menu.Target>

  <Menu.Dropdown>
    <Group justify="space-between" px="sm" py="xs">
      <Text fw={600} size="sm">Notifications</Text>
      {onReadAll && hasUnread && (
        <Anchor size="xs" onClick={onReadAll}>Mark all as read</Anchor>
      )}
    </Group>
    <Menu.Divider />
    <ScrollArea.Autosize mah={300}>
      {notifications.length === 0 ? (
        <Text c="dimmed" ta="center" py="lg" size="sm">No notifications</Text>
      ) : (
        notifications.map(n => (
          <Menu.Item
            key={n.id}
            leftSection={n.icon}
            onClick={() => onRead?.(n.id)}
            opacity={n.read ? 0.6 : 1}
            component={n.href ? 'a' : undefined}
            href={n.href}
          >
            <Text size="sm" fw={n.read ? 400 : 600}>{n.title}</Text>
            {n.description && <Text size="xs" c="dimmed">{n.description}</Text>}
          </Menu.Item>
        ))
      )}
    </ScrollArea.Autosize>
  </Menu.Dropdown>
</Menu>
```

## Behavior
- Bell icon with `Indicator` showing unread count
- Count of 0 hides the indicator
- Count exceeding `maxCount` shows "99+"
- `processing` animation pulses when there are unread notifications
- Click opens dropdown if `showDropdown` is true, otherwise fires `onClick`
- Notifications listed with read/unread visual distinction
- "Mark all as read" link at top when `onReadAll` provided
- Scrollable when notifications exceed dropdown height
- Items with `href` navigate on click

## Accessibility
- ActionIcon: `aria-label="Notifications (3 unread)"` (dynamic)
- Indicator count announced to screen readers
- Menu follows standard menu a11y pattern
- Keyboard: Enter opens, arrow keys navigate

## Dependencies
- **Spec v2 003** -- NavHeader (typically rendered in header rightSection)

## Testing Criteria
- [ ] Shows bell icon with count indicator
- [ ] Count of 0 hides indicator
- [ ] Count > maxCount shows "99+"
- [ ] Dropdown opens with notification list
- [ ] Read/unread visual distinction
- [ ] `onRead` fires when clicking notification
- [ ] `onReadAll` fires and link appears only when applicable
- [ ] Empty state shows "No notifications"
- [ ] Keyboard navigation works
- [ ] Storybook story

## Open Questions
- Should the dropdown support tabs (All / Unread)?
