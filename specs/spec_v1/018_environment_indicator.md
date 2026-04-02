# Spec 018: Environment Indicator

## Category
NavBar-Specific

## Status
Draft

## Summary
A color-coded strip, badge, or banner in the navbar that indicates the current environment (e.g., "Production", "Staging", "Development"), preventing accidental actions in the wrong environment.

## Motivation
Accidental changes in production are a leading cause of incidents in SaaS operations. A persistent, highly visible environment indicator helps developers and operators stay aware of which environment they're working in — a pattern used by AWS Console, Stripe Dashboard, and many internal tools.

## Mantine Foundation
- `Badge` — Environment label with color
- `Box` — Color strip/banner container
- Mantine theming — Color scheme integration

## API Design

### Props

#### `EnvironmentIndicator` component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `environment` | `string` | — | Environment name (e.g., "production", "staging") |
| `color` | `MantineColor` | auto | Color of the indicator; auto-maps common names to colors |
| `variant` | `'strip' \| 'badge' \| 'banner'` | `'strip'` | Visual style |
| `position` | `'top' \| 'bottom' \| 'navbar'` | `'top'` | Where the indicator renders |
| `stripHeight` | `number` | `3` | Height of the color strip in pixels |
| `hidden` | `boolean` | `false` | Hide the indicator (e.g., in production) |
| `label` | `ReactNode` | environment name | Custom label text |
| `icon` | `ReactNode` | `undefined` | Optional icon |
| `dismissible` | `boolean` | `false` | Allow user to dismiss the indicator |

#### Default color mapping

```typescript
const defaultColors: Record<string, MantineColor> = {
  production: 'red',
  prod: 'red',
  staging: 'yellow',
  stage: 'yellow',
  development: 'blue',
  dev: 'blue',
  local: 'green',
  test: 'grape',
};
```

### Hooks

```typescript
function useEnvironment(): {
  environment: string;
  color: MantineColor;
  isProduction: boolean;
};
```

## Component Structure

```
// Strip variant (thin colored line at top of page)
<EnvironmentIndicator environment="staging" variant="strip" />
<NavBar>...</NavBar>

// Badge variant (inside navbar)
<NavBar>
  <NavBar.Logo />
  <EnvironmentIndicator environment="staging" variant="badge" />
  <NavBar.Links />
</NavBar>

// Banner variant (full-width bar with text)
<EnvironmentIndicator environment="staging" variant="banner" />
<NavBar>...</NavBar>
```

## Behavior
- **strip**: A thin horizontal bar (default 3px) at the top of the viewport in the environment color
- **badge**: A `Badge` component rendered within the navbar
- **banner**: A full-width bar with environment name, color background, and optional dismiss
- Color is auto-detected from the environment name using the default map, or overridden via `color` prop
- When `hidden={true}`, nothing renders (useful for hiding in production: `hidden={env === 'production'}`)
- The strip variant uses `position: fixed` to stay at the top regardless of scroll
- When strip is active, the navbar shifts down by `stripHeight` pixels to avoid overlap
- `dismissible={true}` shows a close button; dismissal persists for the session via sessionStorage

## Accessibility
- Banner/badge: `role="status"` with the environment name as text content
- Color is supplemented by text — never color-only indication
- Strip variant alone is decorative (`aria-hidden="true"`) since it has no text; pair with badge or banner for screen readers

## Dependencies
- None (standalone component, optionally placed in NavBar)

## Testing Criteria
- [ ] Strip renders at correct height and color
- [ ] Badge renders with correct color and label
- [ ] Banner renders full-width with text
- [ ] Auto-color mapping works for common environment names
- [ ] Custom `color` overrides auto-mapping
- [ ] `hidden` prevents rendering
- [ ] Dismissible banner can be closed
- [ ] Dismissal persists for session
- [ ] Navbar shifts down when strip is active
- [ ] Storybook story with all variants and environments

## Open Questions
- Should the indicator pulse or animate for production to increase visibility?
- Should there be a confirmation dialog for destructive actions in production environments?
