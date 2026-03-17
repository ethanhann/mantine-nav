# Spec 041: Preset Themes

## Category
Theming & Customization

## Status
Draft

## Summary
Ship ready-made theme presets (minimal, corporate, playful) that configure colors, spacing, border radius, and typography for the navigation components, providing quick starting points.

## Motivation
Not every team wants to build a theme from scratch. Preset themes offer polished starting points that can be used as-is or extended, reducing time-to-ship and ensuring professional design quality out of the box.

## Mantine Foundation
- Mantine theme object — Full theming system
- `createTheme` — Theme creation utility
- CSS variables — Presets override nav CSS variables

## API Design

### Props

#### `NavThemeProvider` additions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `preset` | `NavPreset \| string` | `undefined` | Apply a preset theme |
| `presetOverrides` | `Partial<NavPresetConfig>` | `undefined` | Override specific preset values |

#### Built-in presets

```typescript
type NavPreset = 'minimal' | 'corporate' | 'playful';

interface NavPresetConfig {
  name: string;
  description: string;
  vars: Record<string, string>;     // CSS variable overrides
  classNames: Record<string, string>;  // Class name additions
  colorScheme?: 'light' | 'dark' | 'both';
}
```

### Preset definitions

```typescript
const minimal: NavPresetConfig = {
  name: 'Minimal',
  description: 'Clean lines, subtle borders, neutral palette',
  vars: {
    '--nav-sidebar-bg': 'transparent',
    '--nav-sidebar-border-color': 'transparent',
    '--nav-item-border-radius': '0',
    '--nav-item-hover-bg': 'light-dark(rgba(0,0,0,0.03), rgba(255,255,255,0.03))',
    '--nav-item-active-bg': 'transparent',
    '--nav-item-active-color': 'var(--mantine-color-dark-9)',
    '--nav-section-header-text-transform': 'none',
    '--nav-section-header-font-weight': '500',
  },
};

const corporate: NavPresetConfig = {
  name: 'Corporate',
  description: 'Professional, structured, clear hierarchy',
  vars: {
    '--nav-sidebar-bg': 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))',
    '--nav-item-border-radius': 'var(--mantine-radius-xs)',
    '--nav-item-height': '40px',
    '--nav-section-header-text-transform': 'uppercase',
    '--nav-section-header-letter-spacing': '0.1em',
  },
};

const playful: NavPresetConfig = {
  name: 'Playful',
  description: 'Rounded, colorful, friendly appearance',
  vars: {
    '--nav-item-border-radius': 'var(--mantine-radius-xl)',
    '--nav-item-hover-bg': 'light-dark(var(--mantine-color-blue-0), var(--mantine-color-blue-9))',
    '--nav-item-active-bg': 'var(--mantine-color-blue-filled)',
    '--nav-item-active-color': 'white',
    '--nav-sidebar-bg': 'light-dark(var(--mantine-color-blue-0), var(--mantine-color-dark-9))',
  },
};
```

### Hooks

```typescript
function useNavPreset(): {
  preset: NavPreset | null;
  setPreset: (preset: NavPreset | null) => void;
  presetConfig: NavPresetConfig | null;
};
```

## Component Structure

```
<NavThemeProvider preset="corporate">
  <NavLayout>
    <NavBar />
    <Sidebar />
  </NavLayout>
</NavThemeProvider>

// Or with overrides:
<NavThemeProvider
  preset="minimal"
  presetOverrides={{
    vars: { '--nav-item-active-color': 'var(--mantine-color-indigo-7)' }
  }}
>
  ...
</NavThemeProvider>
```

## Behavior
- Selecting a preset applies its CSS variables and optional class names to all nav components
- `presetOverrides` are merged on top of the preset's defaults
- Setting `preset={null}` or `preset={undefined}` uses the default theme (Mantine defaults)
- Presets work in both light and dark mode (all use `light-dark()` where needed)
- Presets can be switched at runtime (CSS variable changes apply instantly)
- Custom presets can be registered by providing a `NavPresetConfig` object

## Accessibility
- All presets must meet WCAG AA contrast ratios
- Each preset is tested for accessibility before shipping

## Dependencies
- **Spec 037** — Light / dark mode (presets support both)
- **Spec 040** — CSS variable surface (presets override variables)

## Testing Criteria
- [ ] Each preset applies distinct visual styling
- [ ] Presets work in light mode
- [ ] Presets work in dark mode
- [ ] `presetOverrides` merge correctly
- [ ] Runtime preset switching works
- [ ] Custom preset registration works
- [ ] All presets meet WCAG AA contrast
- [ ] Storybook story with preset switcher

## Open Questions
- Should there be community-contributed presets?
- Should presets include typography changes (font family) or stick to layout/color?
