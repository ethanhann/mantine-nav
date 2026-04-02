# Spec v2 008: PlanBadge

## Category
SaaS & Multi-Tenant

## Status
Draft

## Summary
A small badge showing the workspace/user plan tier with optional upgrade action,
built entirely on Mantine's `Badge` and `Anchor` components.

## Motivation
SaaS apps display plan tier info and upsell upgrade paths. The v1 implementation
used inline styles. v2 uses Mantine's `Badge` which provides consistent sizing,
colors, and variants out of the box.

## Mantine Foundation
- `Badge` -- Plan tier display (variants: filled, light, outline, dot)
- `Anchor` -- Upgrade link
- `Group` -- Layout

## API Design

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `plan` | `string` | -- | Plan name (e.g., "Pro", "Team", "Enterprise") |
| `color` | `MantineColor` | `'blue'` | Badge color |
| `variant` | `BadgeVariant` | `'light'` | Mantine Badge variant |
| `size` | `MantineSize` | `'sm'` | Badge size |
| `showUpgrade` | `boolean` | `false` | Show upgrade action |
| `onUpgrade` | `() => void` | `undefined` | Upgrade click callback |
| `upgradeLabel` | `string` | `'Upgrade'` | Upgrade link text |
| `icon` | `ReactNode` | `undefined` | Icon in badge leftSection |

## Component Structure

```tsx
<PlanBadge plan="Pro" color="violet" showUpgrade onUpgrade={handleUpgrade} />

// Renders:
<Group gap="xs">
  <Badge color="violet" variant="light" size="sm" leftSection={icon}>
    {plan}
  </Badge>
  {showUpgrade && (
    <Anchor size="xs" onClick={onUpgrade}>{upgradeLabel}</Anchor>
  )}
</Group>
```

## Behavior
- Renders a Mantine `Badge` with the plan name
- Optional `icon` in leftSection
- `showUpgrade` adds an `Anchor` next to the badge
- Color maps to plan tiers (consumer decides mapping)

## Accessibility
- Badge: `role="status"`
- Upgrade link: standard anchor semantics

## Dependencies
- None (standalone)

## Testing Criteria
- [ ] Renders badge with plan name and color
- [ ] Upgrade link appears when `showUpgrade` is true
- [ ] `onUpgrade` fires on click
- [ ] All Mantine Badge variants work
- [ ] Storybook story

## Open Questions
- None
