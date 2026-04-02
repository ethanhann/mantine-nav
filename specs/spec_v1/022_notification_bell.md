# Spec 022: Notification Bell

## Category
SaaS & Multi-Tenant

## Status
Draft

## Summary
A notification bell icon with an unread count badge in the navbar, opening a dropdown panel of notifications with mark-as-read, filtering, and action capabilities.

## Motivation
In-app notifications are a core SaaS feature for keeping users informed about activity in their workspace. A navbar bell icon with unread count is the universally recognized pattern (GitHub, Slack, Linear) for accessing notifications without leaving the current page.

## Mantine Foundation
- `ActionIcon` — Bell icon button
- `Indicator` — Unread count badge overlay
- `Popover` — Notification panel
- `ScrollArea` — Scrollable notification list
- `Tabs` — Filter tabs within the panel

## API Design

### Props

#### `NotificationBell` component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | `0` | Number of unread notifications |
| `maxCount` | `number` | `99` | Max displayed count (shows "99+" above this) |
| `notifications` | `NotificationItem[]` | `[]` | Notification data |
| `onRead` | `(id: string) => void` | `undefined` | Mark single notification as read |
| `onReadAll` | `() => void` | `undefined` | Mark all as read |
| `onAction` | `(id: string, action: string) => void` | `undefined` | Notification action callback |
| `onClick` | `(notification: NotificationItem) => void` | `undefined` | Click notification callback |
| `filterTabs` | `string[]` | `undefined` | Filter categories (e.g., ["All", "Mentions", "Updates"]) |
| `emptyMessage` | `ReactNode` | `"No notifications"` | Empty state content |
| `panelWidth` | `number` | `380` | Width of the notification panel |
| `panelMaxHeight` | `number` | `480` | Max height before scrolling |
| `renderNotification` | `(item: NotificationItem) => ReactNode` | `undefined` | Custom notification renderer |

#### `NotificationItem` type

```typescript
interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  timestamp: Date;
  read: boolean;
  icon?: ReactNode;
  avatar?: string;
  category?: string;
  actions?: Array<{ label: string; action: string }>;
  href?: string;
}
```

### Hooks

```typescript
function useNotificationBell(): {
  count: number;
  opened: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
};
```

## Component Structure

```
<NavBar.RightSection>
  <NotificationBell count={5} notifications={notifications}>
    // Panel renders:
    // ┌────────────────────────────┐
    // │ Notifications    Mark all  │
    // │ [All] [Mentions] [Updates] │
    // ├────────────────────────────┤
    // │ 🔵 John commented on PR    │
    // │    "Looks great!" · 5m ago │
    // │                            │
    // │ 🔵 Deploy succeeded        │
    // │    main → prod · 1h ago    │
    // │                            │
    // │ ○ New member joined        │
    // │    jane@acme.com · 2h ago  │
    // └────────────────────────────┘
  </NotificationBell>
</NavBar.RightSection>
```

## Behavior
- The bell icon shows an `Indicator` badge with the unread count
- When `count > maxCount`, displays "99+" (or custom max)
- When `count === 0`, the indicator is hidden
- Clicking the bell opens a `Popover` panel with the notification list
- Unread notifications have a blue dot indicator; read notifications do not
- "Mark all as read" button in the panel header calls `onReadAll`
- If `filterTabs` is provided, tab buttons filter by category
- Clicking a notification marks it as read and calls `onClick`
- Each notification can have action buttons (e.g., "View", "Dismiss")
- Panel scrolls when notifications exceed `panelMaxHeight`
- Closing the panel preserves read/unread state
- Bell icon animates (brief shake) when a new notification arrives (count increases)

## Accessibility
- Bell button: `aria-label="Notifications, <count> unread"`
- Panel: `role="dialog"` with `aria-label="Notifications"`
- Notifications: `role="list"` with `role="listitem"` children
- "Mark all as read": standard button
- Filter tabs: `role="tablist"`
- Unread indicator: `aria-label="Unread"` on the dot

## Dependencies
- None (standalone component, placed in NavBar)

## Testing Criteria
- [ ] Bell renders with correct unread count
- [ ] Count capped at `maxCount` with "+" suffix
- [ ] Zero count hides indicator
- [ ] Panel opens on click
- [ ] Notifications render with correct data
- [ ] Unread/read visual distinction
- [ ] "Mark all as read" works
- [ ] Filter tabs filter notifications
- [ ] Clicking notification calls `onClick` and `onRead`
- [ ] Panel scrolls for many notifications
- [ ] Bell animates on count increase
- [ ] Storybook story with notification panel

## Open Questions
- Should the notification panel support infinite scrolling / pagination?
- Should there be a "View all" link to a full notifications page?
