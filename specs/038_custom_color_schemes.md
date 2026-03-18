# Spec 038: Custom Color Schemes

## Category
Theming & Customization

## Status
Draft

## Summary
Support different color accents per navigation section, enabling visual distinction between nav areas (e.g., blue sidebar for main app, purple for admin, red for danger zones).

## Motivation
Large apps with distinct functional areas benefit from color-coded navigation that provides instant visual context about which area the user is in. This also supports white-labeling where customers define their own brand colors.

## Mantine Foundation
- `MantineProvider` — Nested providers for scoped theming
- Mantine theme `colors` — Custom color definitions
- CSS custom properties — Override via `styles` API

## API Design

### Props

#### `NavSection` additions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `colorScheme` | `NavColorConfig` | inherited | Color scheme for this section |

#### `NavItem` additions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `MantineColor` | inherited | Accent color for this item |

#### `NavColorConfig` type

```typescript
interface NavColorConfig {
  primary?: MantineColor;          // Active item, hover
  background?: string;             // Section background
  text?: string;                   // Text color
  activeBackground?: string;       // Active item background
  activeText?: string;             // Active item text color
  hoverBackground?: string;        // Hover background
  border?: string;                 // Border color
}
```

#### `NavThemeProvider` additions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sidebarColors` | `NavColorConfig` | `undefined` | Sidebar-wide color scheme |
| `navbarColors` | `NavColorConfig` | `undefined` | Navbar-wide color scheme |

### Hooks

```typescript
function useNavColors(): {
  sidebarColors: NavColorConfig;
  navbarColors: NavColorConfig;
  setSidebarColors: (colors: NavColorConfig) => void;
  setNavbarColors: (colors: NavColorConfig) => void;
};
```

## Component Structure

```
<NavThemeProvider sidebarColors={{ primary: 'indigo', background: 'var(--mantine-color-indigo-0)' }}>
  <Sidebar>
    <NavSection colorScheme={{ primary: 'blue' }}>
      <NavLink color="blue" />   // Inherits blue accent
    </NavSection>
    <NavSection colorScheme={{ primary: 'red', background: '#fff0f0' }}>
      <NavLink color="red" />    // Danger zone styling
    </NavSection>
  </Sidebar>
</NavThemeProvider>
```

## Behavior
- `NavColorConfig` defines a complete color palette for a navigation area
- Colors cascade: `NavThemeProvider` → `Sidebar`/`NavBar` → `NavSection` → `NavItem`
- Each level can override specific colors; unset values inherit from parent
- Active items use `activeBackground` and `activeText` from the nearest color config
- Hover states use `hoverBackground` from the nearest config
- Color configs work in both light and dark mode — each can specify values for both schemes via `light-dark()` CSS function
- Brand/white-label colors can be set dynamically at runtime

## Accessibility
- All color combinations must maintain WCAG AA contrast ratios
- A dev-mode warning is emitted if custom colors produce insufficient contrast
- Color is never the sole indicator — text, icons, and position also differentiate sections

## Dependencies
- **Spec 037** — Light / dark mode (colors must work in both schemes)
- **Spec 040** — CSS variable surface (colors exposed as CSS custom properties)

## Testing Criteria
- [ ] Section-level colors override sidebar-level colors
- [ ] Active item uses `activeBackground` and `activeText`
- [ ] Hover uses `hoverBackground`
- [ ] Colors cascade correctly through nesting
- [ ] Works in both light and dark mode
- [ ] Runtime color changes apply immediately
- [ ] Contrast warning in dev mode for poor combinations
- [ ] Storybook story with multi-colored sections

## Open Questions
- Should we provide a contrast checker utility that devs can call?
- Should color schemes be nameable and switchable (e.g., "admin", "default")?
