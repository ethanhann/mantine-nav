# Spec 021: Plan / Tier Badge

## Category
SaaS & Multi-Tenant

## Status
Draft

## Summary
Display the current subscription plan or tier (e.g., "Free", "Pro", "Enterprise") in the sidebar or navbar, with an optional upgrade call-to-action.

## Motivation
SaaS apps with tiered pricing need to communicate the current plan to users and encourage upgrades. A visible plan badge in the navigation serves both informational and conversion purposes — patterns seen in Slack, Notion, and Figma.

## Mantine Foundation
- `Badge` — Plan tier label
- `Button` — Upgrade CTA
- `Tooltip` — Plan details on hover
- `Card` — For richer plan display

## API Design

### Props

#### `PlanBadge` component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `plan` | `string` | — | Plan name (e.g., "Free", "Pro") |
| `color` | `MantineColor` | auto | Badge color; auto-maps common plan names |
| `variant` | `'badge' \| 'card' \| 'inline'` | `'badge'` | Visual style |
| `showUpgrade` | `boolean` | `false` | Show upgrade CTA button |
| `upgradeLabel` | `string` | `"Upgrade"` | Text on the upgrade button |
| `onUpgrade` | `() => void` | `undefined` | Callback when upgrade is clicked |
| `upgradeHref` | `string` | `undefined` | Link for upgrade (alternative to callback) |
| `tooltip` | `ReactNode` | `undefined` | Content shown on hover |
| `expiresAt` | `Date` | `undefined` | Trial/plan expiration date |
| `placement` | `'sidebar-footer' \| 'sidebar-header' \| 'navbar' \| 'custom'` | `'sidebar-footer'` | Where the badge appears |

#### Default color mapping

```typescript
const defaultPlanColors: Record<string, MantineColor> = {
  free: 'gray',
  starter: 'blue',
  pro: 'violet',
  business: 'orange',
  enterprise: 'gold',
  trial: 'teal',
};
```

### Hooks

```typescript
function usePlanBadge(): {
  plan: string;
  isFreeTier: boolean;
  isTrial: boolean;
  daysRemaining: number | null;  // For trial/expiring plans
};
```

## Component Structure

```
<Sidebar.Footer>
  <PlanBadge
    plan="Pro"
    showUpgrade={false}
  />
  // or
  <PlanBadge
    plan="Free"
    showUpgrade
    onUpgrade={() => navigate('/billing')}
    tooltip="Upgrade to Pro for unlimited projects"
  />
</Sidebar.Footer>

// Badge variant:      [Pro ✨]
// Card variant:       ┌──────────────────┐
//                     │ Free Plan         │
//                     │ 3/5 projects used │
//                     │ [Upgrade to Pro]  │
//                     └──────────────────┘
// Inline variant:     Current plan: Pro
```

## Behavior
- Badge renders with the plan name and auto-mapped color
- If `showUpgrade={true}`, an "Upgrade" button renders below/beside the badge
- If `expiresAt` is set and in the future, shows "X days remaining" text
- If `expiresAt` is within 7 days, the badge pulses or shows a warning color
- Hovering the badge shows the `tooltip` if provided
- In rail mode (Spec 008), the badge variant shows a small icon/dot; card variant is hidden
- The upgrade CTA navigates to `upgradeHref` or calls `onUpgrade`
- Card variant can include usage statistics (passed as children)

## Accessibility
- Badge: `aria-label="Current plan: <plan>"`
- Upgrade button: standard button semantics
- Expiration warning: `role="alert"` when within 3 days of expiry

## Dependencies
- **Spec 008** — Collapsible rail mode (compact display)
- **Spec 012** — Scrollable with sticky zones (footer slot)

## Testing Criteria
- [ ] Badge renders with correct plan name and color
- [ ] Auto-color mapping for common plan names
- [ ] Upgrade button renders when `showUpgrade={true}`
- [ ] `onUpgrade` fires on click
- [ ] Expiration countdown renders correctly
- [ ] Warning state within 7 days of expiry
- [ ] Tooltip shows on hover
- [ ] Rail mode shows compact variant
- [ ] Card variant renders with children
- [ ] Storybook story with all variants and plans

## Open Questions
- Should the card variant support usage bars (e.g., "3/5 projects")?
- Should the plan badge integrate with a billing API or remain purely presentational?
