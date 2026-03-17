# Spec 013: Transition Animations

## Category
Sidebar-Specific

## Status
Draft

## Summary
A configurable animation system for sidebar transitions — collapse/expand, variant changes, group toggle, and item enter/exit — built on Mantine's transition primitives.

## Motivation
Smooth animations make state changes feel intentional and help users track what changed. A centralized animation system ensures consistency and lets developers tune performance (or disable animations entirely for reduced-motion preferences).

## Mantine Foundation
- `Transition` — Mantine's animation wrapper with predefined transitions
- `Collapse` — Animated height transitions for group expand/collapse
- CSS `transition` property — For width/opacity changes
- `@mantine/hooks` — `useReducedMotion` for accessibility

## API Design

### Props

#### `NavAnimationConfig` type

```typescript
interface NavAnimationConfig {
  enabled: boolean;                    // Master toggle
  duration: number;                    // Default duration in ms
  timingFunction: string;             // CSS easing function
  reducedMotion: 'disable' | 'reduce' | 'system';  // Reduced motion strategy
}
```

#### `Sidebar` additions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animation` | `Partial<NavAnimationConfig>` | see defaults | Animation configuration |
| `collapseAnimation` | `MantineTransition` | `'scale-x'` | Transition for label hide/show in rail mode |
| `widthTransitionDuration` | `number` | `200` | Duration for width changes (ms) |
| `groupTransitionDuration` | `number` | `200` | Duration for group expand/collapse (ms) |

Default `NavAnimationConfig`:
```typescript
{
  enabled: true,
  duration: 200,
  timingFunction: 'ease',
  reducedMotion: 'system',
}
```

#### `NavGroup` additions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `transitionDuration` | `number` | inherited | Override animation duration for this group |

### Hooks

```typescript
function useNavAnimation(): {
  config: NavAnimationConfig;
  isEnabled: boolean;        // Resolved (accounts for reduced motion)
  duration: number;          // Resolved duration (0 when disabled)
  getTransitionProps: (type: 'collapse' | 'width' | 'fade') => {
    duration: number;
    timingFunction: string;
    transition: MantineTransition;
  };
};
```

## Component Structure

No new visual components. This spec provides configuration that is consumed by:
- Sidebar width transitions (Spec 008, 009, 010)
- Group expand/collapse (Spec 001, 002)
- Item enter/exit animations
- Rail mode label transitions (Spec 008)

## Behavior
- `enabled: false` disables all animations globally (instant transitions)
- `reducedMotion: 'system'` checks `prefers-reduced-motion` media query via `useReducedMotion()`
  - When reduced motion is active: `'disable'` sets duration to 0; `'reduce'` cuts duration in half and removes transform-based transitions
- All animations use the same `timingFunction` for consistency
- Component-level overrides (e.g., `groupTransitionDuration`) take precedence over global config
- Width transitions use CSS `transition: width <duration> <easing>` on the sidebar container
- Group collapse uses Mantine's `Collapse` with the configured duration
- Label show/hide in rail mode uses Mantine's `Transition` with the configured `collapseAnimation`

## Accessibility
- `prefers-reduced-motion: reduce` is respected by default
- When `reducedMotion: 'disable'`, all animations are removed (duration: 0)
- No animation should cause content to be inaccessible during transition

## Dependencies
- **Spec 008** — Collapsible rail mode (width + label transitions)
- **Spec 009** — Resizable width (live resize is not animated; only programmatic changes are)
- **Spec 010** — Mini variant (variant switch transitions)
- **Spec 001** — Multi-level nesting (group transitions)

## Testing Criteria
- [ ] Animations play at configured duration
- [ ] `enabled: false` makes all transitions instant
- [ ] `reducedMotion: 'system'` respects media query
- [ ] Component-level duration overrides work
- [ ] Width transition is smooth
- [ ] Group collapse animation plays
- [ ] `useNavAnimation()` returns resolved values
- [ ] Storybook story with animation config controls

## Open Questions
- Should there be predefined animation presets (e.g., "snappy", "smooth", "none")?
- Should enter/exit animations for individual items (e.g., when filtering) be included in this spec or a separate one?
