# Spec 028: Live Data Status Dot

## Category
Analytics & Dashboard

## Status
Draft

## Summary
A small colored status indicator showing the connection state of real-time data sources (connected, stale, error, disconnected), with hover details.

## Motivation
Dashboards with real-time data need to communicate data freshness. Users must know whether they're seeing live data, stale data, or if the connection is broken — preventing decisions based on outdated information. Datadog, Grafana, and trading platforms all use this pattern.

## Mantine Foundation
- `Indicator` — Colored dot
- `Tooltip` — Hover details
- `ThemeIcon` — Status icon wrapper
- `Popover` — Detailed status panel

## API Design

### Props

#### `LiveDataStatus` component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `'connected' \| 'stale' \| 'error' \| 'disconnected' \| 'connecting'` | `'disconnected'` | Current connection status |
| `label` | `string` | auto | Status label text (auto-generated from status if omitted) |
| `lastUpdated` | `Date` | `undefined` | Timestamp of last data update |
| `staleDuration` | `number` | `30000` | Milliseconds after which "connected" becomes "stale" |
| `details` | `ReactNode` | `undefined` | Rich content for the detail popover |
| `onReconnect` | `() => void` | `undefined` | Reconnect action callback |
| `variant` | `'dot' \| 'badge' \| 'detailed'` | `'dot'` | Visual style |
| `animate` | `boolean` | `true` | Pulse animation for connected state |
| `placement` | `'navbar' \| 'sidebar-header' \| 'custom'` | `'navbar'` | Where to render |

#### Status colors

```typescript
const statusColors = {
  connected: 'green',
  stale: 'yellow',
  error: 'red',
  disconnected: 'gray',
  connecting: 'blue',
};
```

### Hooks

```typescript
function useLiveDataStatus(options?: {
  staleDuration?: number;
  lastUpdated?: Date;
}): {
  status: LiveDataStatusType;
  isStale: boolean;
  timeSinceUpdate: number | null;
  formattedTime: string;   // "5s ago", "2m ago"
};
```

## Component Structure

```
<NavBar.RightSection>
  <LiveDataStatus
    status="connected"
    lastUpdated={lastUpdate}
    staleDuration={30000}
    onReconnect={handleReconnect}
  />
</NavBar.RightSection>

// Dot variant:      🟢 (tooltip: "Connected · Updated 5s ago")
// Badge variant:    [🟢 Live · 5s ago]
// Detailed variant: [🟢 Live] → Popover with connection details
```

## Behavior
- Dot variant: small colored circle with tooltip on hover
- Badge variant: labeled badge with status text and relative time
- Detailed variant: clickable badge that opens a popover with connection details
- When `animate={true}` and status is "connected", the dot pulses gently
- Auto-stale detection: if `lastUpdated` is older than `staleDuration`, status auto-downgrades to "stale"
- The "error" state shows a reconnect button (calls `onReconnect`)
- `lastUpdated` renders as relative time ("5s ago", "2m ago") that updates live
- "Connecting" state shows a spinner or animated dots
- Status transitions are animated (color fade)

## Accessibility
- Status dot: `role="status"` with `aria-label="Data status: <status>"`
- `aria-live="polite"` announces status changes
- Color is supplemented by text label for color-blind users
- Reconnect button: standard button semantics

## Dependencies
- None (standalone component)

## Testing Criteria
- [ ] Correct color for each status
- [ ] Tooltip shows status and last updated time
- [ ] Pulse animation on connected state
- [ ] Auto-stale when lastUpdated exceeds staleDuration
- [ ] Reconnect button appears on error state
- [ ] Relative time updates live
- [ ] All three variants render correctly
- [ ] `aria-live` announces status changes
- [ ] Storybook story with status cycling

## Open Questions
- Should the status support multiple data sources (array of statuses)?
- Should there be a sound/visual alert on status change to error?
