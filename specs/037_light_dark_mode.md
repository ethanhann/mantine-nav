# Spec 037: Light / Dark Mode

## Category
Theming & Customization

## Status
Draft

## Summary
Full light and dark mode support for all navigation components, with per-component overrides and seamless integration with Mantine's color scheme system.

## Motivation
Dark mode is a baseline expectation for modern web apps. Navigation components must adapt correctly to both color schemes, including edge cases like overlays, badges, and status indicators that may need scheme-specific adjustments beyond what Mantine provides automatically.

## Mantine Foundation
- `MantineProvider` — `colorScheme` prop and `useComputedColorScheme`
- `useMantineColorScheme` — Read/write the current scheme
- CSS `light-dark()` function — Mantine's color mode system
- `data-mantine-color-scheme` attribute — Applied to root element

## API Design

### Props

#### Per-component additions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `colorScheme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Override color scheme for this component |
| `darkProps` | `Partial<ComponentProps>` | `undefined` | Props applied only in dark mode |
| `lightProps` | `Partial<ComponentProps>` | `undefined` | Props applied only in light mode |

#### `NavThemeProvider` additions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sidebarColorScheme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Sidebar-specific color scheme override |
| `navbarColorScheme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Navbar-specific color scheme override |

### Hooks

```typescript
function useNavColorScheme(): {
  colorScheme: 'light' | 'dark';
  toggleColorScheme: () => void;
  setColorScheme: (scheme: 'light' | 'dark' | 'auto') => void;
  isLight: boolean;
  isDark: boolean;
};
```

## Component Structure

No new components. Color scheme support is built into all components via Mantine's CSS module system:

```css
/* Sidebar.module.css */
.root {
  background-color: light-dark(var(--mantine-color-white), var(--mantine-color-dark-7));
  border-color: light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4));
}
```

## Behavior
- By default, all components follow the app's Mantine color scheme (`'auto'`)
- `colorScheme` override on a component forces it to render in a specific mode (e.g., dark sidebar in a light app)
- `darkProps` / `lightProps` allow scheme-specific prop overrides (e.g., different icons)
- Sidebar and navbar can have independent color schemes (common pattern: dark sidebar, light content)
- Active nav items use scheme-appropriate highlight colors
- Badges, indicators, and status dots adjust contrast for each scheme
- Transitions between schemes are animated (CSS `transition: background-color, color`)

## Accessibility
- Color contrast ratios meet WCAG 2.1 AA (4.5:1 for text, 3:1 for UI) in both schemes
- Focus indicators are visible in both modes
- No information conveyed by color alone

## Dependencies
- **Spec 040** — CSS variable surface (theme tokens used by color scheme)
- **Spec 041** — Preset themes (presets must support both schemes)

## Testing Criteria
- [ ] All components render correctly in light mode
- [ ] All components render correctly in dark mode
- [ ] Per-component `colorScheme` override works
- [ ] `darkProps` / `lightProps` applied correctly
- [ ] Independent sidebar/navbar schemes work
- [ ] Color contrast meets WCAG AA in both modes
- [ ] Focus indicators visible in both modes
- [ ] Smooth transition between schemes
- [ ] Storybook story with scheme toggle

## Open Questions
- Should the scheme transition use a clip-path animation (like Telegram) for delight?
- Should scheme preference be persisted by the library or left to the consumer?
