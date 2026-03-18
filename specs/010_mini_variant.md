# Spec 010: Mini Variant

## Category
Sidebar-Specific

## Status
Draft

## Summary
A sidebar mode between fully expanded and rail — a slim sidebar that shows icons alongside truncated labels, providing more context than icon-only rail while saving more space than full width.

## Motivation
Rail mode (icon-only) can be too minimal for apps where icons alone are ambiguous. Mini variant offers a middle ground: the sidebar stays compact but labels remain partially visible, reducing cognitive load. This pattern is used in Material Design's navigation drawer.

## Mantine Foundation
- `AppShell.Navbar` — Width control
- `NavLink` — Label rendering
- `Text` — `truncate` prop for text truncation
- `Tooltip` — Full label on hover for truncated text

## API Design

### Props

#### `Sidebar` additions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'full' \| 'mini' \| 'rail'` | `'full'` | Current sidebar display mode |
| `defaultVariant` | `'full' \| 'mini' \| 'rail'` | `'full'` | Initial variant (uncontrolled) |
| `onVariantChange` | `(variant: SidebarVariant) => void` | `undefined` | Callback when variant changes |
| `miniWidth` | `number \| string` | `120` | Width in mini variant mode |
| `miniLabelMaxChars` | `number` | `8` | Max characters shown before truncation in mini mode |
| `miniShowBadges` | `boolean` | `false` | Whether badges are visible in mini mode |

### Hooks

```typescript
type SidebarVariant = 'full' | 'mini' | 'rail';

function useSidebarVariant(): {
  variant: SidebarVariant;
  setVariant: (variant: SidebarVariant) => void;
  cycleVariant: () => void;   // full → mini → rail → full
  isFull: boolean;
  isMini: boolean;
  isRail: boolean;
};
```

## Component Structure

```
<Sidebar variant="mini" miniWidth={120}>
  <NavLink>
    <Icon />
    <Text truncate="end" maw={miniLabelMaxChars + 'ch'}>
      {label}
    </Text>
    <Tooltip label={fullLabel} disabled={variant !== 'mini'} />
  </NavLink>
</Sidebar>
```

## Behavior
- Mini variant sets the sidebar width to `miniWidth` (default 120px)
- Labels are truncated to `miniLabelMaxChars` characters with ellipsis
- Hovering a truncated label shows a `Tooltip` with the full label
- Nested groups are flattened to a single level in mini mode (same as rail) — children appear in a flyout on hover
- `cycleVariant()` transitions through full → mini → rail → full with each call
- Badges are hidden by default in mini mode (`miniShowBadges={false}`) to save space
- Width transitions between variants are animated (see Spec 013)
- `variant` integrates with `useNav()` (Spec 007) — `useSidebarVariant()` reads/writes the same state

## Accessibility
- Truncated labels: full label in `aria-label` on the item
- Tooltips supplement but do not replace accessible names
- `aria-expanded` still reflects group state even in mini mode

## Dependencies
- **Spec 008** — Collapsible rail mode (mini is a mode alongside rail)
- **Spec 001** — Multi-level nesting (groups flatten in mini mode)
- **Spec 007** — Programmatic API (variant controlled via `useNav`)
- **Spec 013** — Transition animations (width transitions)

## Testing Criteria
- [ ] Sidebar renders at `miniWidth` in mini variant
- [ ] Labels are truncated to `miniLabelMaxChars`
- [ ] Tooltip shows full label on hover
- [ ] Nested groups show flyout in mini mode
- [ ] `cycleVariant()` cycles through all three modes
- [ ] Badges hidden when `miniShowBadges={false}`
- [ ] Width transition animates between variants
- [ ] ARIA labels include full text
- [ ] Storybook story with variant cycle button

## Open Questions
- Should mini mode support two-line labels (icon + short label below) as an alternative to icon + truncated label side-by-side?
- Should `miniLabelMaxChars` be adaptive based on `miniWidth`?
