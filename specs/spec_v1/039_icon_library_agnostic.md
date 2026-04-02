# Spec 039: Icon Library Agnostic

## Category
Theming & Customization

## Status
Draft

## Summary
Accept icons from any source — Tabler Icons, Lucide, FontAwesome, Heroicons, custom SVGs, or emoji — via a `ReactNode` prop, with optional icon resolution for string-based configurations.

## Motivation
Different teams use different icon libraries. The nav library should not force a specific icon dependency, allowing seamless integration with whatever icon system the consuming app already uses.

## Mantine Foundation
- Mantine uses Tabler Icons by default but accepts any `ReactNode` for icon props
- `ThemeIcon` — Wrapper for consistent icon sizing and coloring

## API Design

### Props

All `icon` props across the library accept:

```typescript
type NavIcon = ReactNode | string;
```

#### `NavIconProvider` component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `resolver` | `IconResolver` | `undefined` | Function that resolves string icon names to components |
| `defaultSize` | `number` | `20` | Default icon size in pixels |
| `defaultStroke` | `number` | `1.5` | Default stroke width (for stroke-based icon sets) |

#### `IconResolver` type

```typescript
type IconResolver = (name: string, props: { size: number; stroke?: number }) => ReactNode;
```

### Hooks

```typescript
function useNavIcon(icon: NavIcon, options?: {
  size?: number;
  stroke?: number;
  color?: string;
}): ReactNode;
```

## Component Structure

```
// Direct ReactNode (any icon library):
<NavLink icon={<IconDashboard size={20} />} label="Dashboard" />
<NavLink icon={<LucideHome size={20} />} label="Home" />
<NavLink icon={<FontAwesomeIcon icon={faCog} />} label="Settings" />
<NavLink icon={<CustomSvg />} label="Custom" />

// String-based with resolver:
<NavIconProvider resolver={(name, props) => {
  const Icon = tablerIcons[name];
  return Icon ? <Icon {...props} /> : null;
}}>
  <NavLink icon="dashboard" label="Dashboard" />
  <NavLink icon="settings" label="Settings" />
</NavIconProvider>

// Emoji / text fallback:
<NavLink icon="📊" label="Dashboard" />
```

## Behavior
- `icon` props accept `ReactNode` (components, JSX, strings) directly — zero config needed
- When `icon` is a string and an `IconResolver` is provided via `NavIconProvider`, the resolver maps the string to a component
- When `icon` is a plain string without a resolver, it renders as text (supports emoji)
- `defaultSize` and `defaultStroke` are passed to the resolver for consistent sizing
- Icons are wrapped in a container that handles alignment, sizing, and color inheritance
- In rail mode (Spec 008), icons are the primary visual element — they must be legible at the collapsed size
- Icons inherit text color by default via `currentColor`

## Accessibility
- Icons paired with labels are decorative (`aria-hidden="true"`)
- In rail mode (icon-only), icons must have `aria-label` set to the item label
- Custom icon components should support `aria-hidden` prop

## Dependencies
- **Spec 008** — Collapsible rail mode (icon prominence in rail)
- **Spec 001** — Multi-level nesting (icons on nav items)

## Testing Criteria
- [ ] Tabler Icon renders correctly as `ReactNode`
- [ ] Lucide icon renders correctly
- [ ] Custom SVG renders correctly
- [ ] String icon with resolver maps correctly
- [ ] String icon without resolver renders as text
- [ ] Emoji icons render correctly
- [ ] `defaultSize` applies to resolved icons
- [ ] Icons have correct `aria-hidden` when paired with label
- [ ] Icons in rail mode have `aria-label`
- [ ] Storybook story with multiple icon libraries

## Open Questions
- Should we ship pre-built resolvers for popular icon libraries (Tabler, Lucide)?
- Should there be an icon size scale (sm/md/lg) or just pixel values?
