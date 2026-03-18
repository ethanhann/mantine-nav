# Spec 002: Accordion Mode

## Category
Navigation Structure & Behavior

## Status
Draft

## Summary
Provide an option to restrict sidebar navigation groups so that only one group can be expanded at a time (accordion behavior), as an alternative to independent expand/collapse.

## Motivation
In dense navigation structures, allowing all groups to be open simultaneously can push items far off-screen. Accordion mode keeps the sidebar compact and focused, which is particularly valuable for dashboards with many top-level sections.

## Mantine Foundation
- `Accordion` — Mantine's accordion component provides the behavioral pattern, though we apply it to the nav tree rather than using the component directly
- `NavLink` — Already supports `opened` prop for controlled expand/collapse
- `Collapse` — Used under the hood for animation

## API Design

### Props

Extends `NavGroup` from Spec 001:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `accordion` | `boolean` | `false` | When `true`, only one group at each depth level can be open at a time |
| `accordionScope` | `'global' \| 'sibling'` | `'sibling'` | `'sibling'`: accordion applies among siblings only; `'global'`: only one group open across the entire tree |
| `onAccordionChange` | `(openedKey: string \| null) => void` | `undefined` | Callback when the active accordion group changes |

### Hooks

Extends `useNavItems` from Spec 001:

```typescript
function useNavItems(items: NavItem[], options?: {
  accordion?: boolean;
  accordionScope?: 'global' | 'sibling';
}): {
  flatItems: NavItem[];
  expandedKeys: Set<string>;
  toggleGroup: (key: string) => void;
  expandAll: () => void;   // No-op in accordion mode, logs warning
  collapseAll: () => void;
};
```

## Component Structure

Same as Spec 001 — accordion mode is a behavioral modifier, not a structural change. The `NavGroup` component internally tracks which group is open and collapses others when a new group is expanded.

## Behavior
- When `accordion={true}` and `accordionScope="sibling"`: expanding a group at depth N collapses any other open group at depth N that shares the same parent
- When `accordion={true}` and `accordionScope="global"`: expanding any group collapses all other open groups in the entire tree
- Collapsing the currently-open group is always allowed (results in no groups open)
- `expandAll()` is a no-op in accordion mode and logs a development-mode warning
- If `defaultOpened` is set on multiple siblings, only the first one is respected in accordion mode
- Transitions use the same `Collapse` animation as Spec 001

## Accessibility
- No additional ARIA attributes beyond Spec 001
- Screen readers should announce that opening one group closes another (via `aria-expanded` state changes)

## Dependencies
- **Spec 001** — Multi-level nesting (this spec modifies its behavior)

## Testing Criteria
- [ ] With `accordion={true}`, opening group B auto-closes group A (sibling scope)
- [ ] With `accordionScope="global"`, opening any group closes all others
- [ ] Collapsing the open group results in no groups open
- [ ] `expandAll()` is a no-op and warns in dev mode
- [ ] Multiple `defaultOpened` siblings — only first is respected
- [ ] `onAccordionChange` fires with the correct key
- [ ] Accordion mode works correctly at depth > 1
- [ ] Storybook story demonstrating both scopes

## Open Questions
- Should there be a `multiple` variant that allows N groups open (e.g., max 2)?
