# Spec v2 003: NavHeader -- Top Navigation Bar

## Category
Navigation Bar

## Status
Draft

## Summary
`NavHeader` provides the top navigation bar content, rendered inside
`AppShell.Header` (via `NavShell`). It composes Mantine's `Group`, `Tabs`,
`Breadcrumbs`, `Badge`, and other primitives into a structured header layout.

## Motivation
The top navigation bar typically contains a logo, navigation links or tabs,
and a right-aligned section with actions (search, notifications, user menu).
`NavHeader` provides this layout using Mantine components.

## Mantine Foundation
- `Group` -- Horizontal layout with gap
- `Tabs` -- Tab-style navigation variant
- `Breadcrumbs` -- Breadcrumb navigation
- `Badge` -- Environment indicator
- `Kbd` -- Keyboard shortcut display
- `ActionIcon` -- Icon buttons (search, notifications)
- `Burger` -- Mobile menu toggle (handled by NavShell)

## API Design

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `logo` | `ReactNode` | `undefined` | Logo/brand element, left-aligned |
| `children` | `ReactNode` | `undefined` | Center content (nav links, tabs, breadcrumbs) |
| `rightSection` | `ReactNode` | `undefined` | Right-aligned actions |
| `variant` | `'links' \| 'tabs'` | `'links'` | Navigation style |
| `environment` | `{ label: string; color: MantineColor }` | `undefined` | Environment badge (staging, dev) |

## Component Structure

```tsx
<NavHeader
  logo={<Text fw={700}>MyApp</Text>}
  rightSection={
    <Group gap="xs">
      <NotificationIndicator count={3} />
      <UserMenu user={user} />
    </Group>
  }
>
  <Anchor href="/">Home</Anchor>
  <Anchor href="/products">Products</Anchor>
</NavHeader>

// Renders internally:
<Group h="100%" px="md" justify="space-between" wrap="nowrap">
  <Group gap="md" wrap="nowrap">
    {logo}
    {environment && (
      <Badge color={environment.color} variant="light" size="sm">
        {environment.label}
      </Badge>
    )}
  </Group>

  <Group gap="xs" style={{ flex: 1 }} justify="center">
    {children}
  </Group>

  <Group gap="xs" wrap="nowrap">
    {rightSection}
  </Group>
</Group>
```

For `variant="tabs"`:

```tsx
<Tabs value={activeTab} onChange={onTabChange}>
  <Tabs.List>
    <Tabs.Tab value="overview">Overview</Tabs.Tab>
    <Tabs.Tab value="analytics">Analytics</Tabs.Tab>
  </Tabs.List>
</Tabs>
```

## Behavior
- Logo is always left-aligned, right section always right-aligned
- Center content stretches to fill available space
- `variant="tabs"` renders children as `Tabs` component
- `variant="links"` renders children as-is (typically `Anchor` or `NavLink`)
- Environment badge renders between logo and center content
- On mobile, center content may overflow; header should not wrap
- The mobile `Burger` is handled by `NavShell`, not `NavHeader`

## Accessibility
- Header uses `role="banner"` via AppShell.Header
- Tab navigation follows WAI-ARIA Tabs pattern automatically (Mantine)
- Links have proper `role="menubar"` when used as navigation
- Environment badge has `role="status"`

## Dependencies
- **Spec v2 001** -- NavShell (provides AppShell.Header context)

## Testing Criteria
- [ ] Renders logo, children, and right section in correct positions
- [ ] `variant="tabs"` renders Mantine Tabs
- [ ] `variant="links"` renders children directly
- [ ] Environment badge displays with correct color
- [ ] Layout does not wrap on overflow
- [ ] Storybook stories for both variants

## Open Questions
- Should `NavHeader` support a `sticky` prop, or is that always handled by AppShell?
