# Spec 040: CSS Variable Surface

## Category
Theming & Customization

## Status
Draft

## Summary
Expose a comprehensive set of CSS custom properties for fine-grained style control of all navigation components, enabling customization without overriding component internals.

## Motivation
While Mantine's `styles` API and `classNames` provide component-level overrides, many teams prefer CSS custom properties for theming across an entire design system. A well-defined CSS variable surface makes Nav components customizable from external stylesheets, design tokens, or runtime theming.

## Mantine Foundation
- Mantine exposes `--mantine-*` CSS variables
- Component-level `vars` prop for per-instance overrides
- CSS modules for scoped styles

## API Design

### CSS Variables

All Nav CSS variables are namespaced under `--nav-*`:

```css
:root {
  /* Sidebar */
  --nav-sidebar-width: 260px;
  --nav-sidebar-collapsed-width: 60px;
  --nav-sidebar-bg: light-dark(var(--mantine-color-white), var(--mantine-color-dark-7));
  --nav-sidebar-border-color: light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4));
  --nav-sidebar-z-index: 200;

  /* Navbar */
  --nav-navbar-height: 60px;
  --nav-navbar-bg: light-dark(var(--mantine-color-white), var(--mantine-color-dark-7));
  --nav-navbar-border-color: light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4));
  --nav-navbar-z-index: 201;

  /* Nav Items */
  --nav-item-height: 36px;
  --nav-item-padding-x: 12px;
  --nav-item-border-radius: var(--mantine-radius-sm);
  --nav-item-font-size: var(--mantine-font-size-sm);
  --nav-item-color: light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-0));
  --nav-item-hover-bg: light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6));
  --nav-item-active-bg: light-dark(var(--mantine-color-blue-light), var(--mantine-color-blue-light));
  --nav-item-active-color: light-dark(var(--mantine-color-blue-7), var(--mantine-color-blue-4));

  /* Indent */
  --nav-indent-width: 16px;
  --nav-indent-guide-color: light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4));
  --nav-indent-guide-width: 1px;

  /* Section Headers */
  --nav-section-header-font-size: var(--mantine-font-size-xs);
  --nav-section-header-color: light-dark(var(--mantine-color-gray-6), var(--mantine-color-dark-3));
  --nav-section-header-font-weight: 700;
  --nav-section-header-text-transform: uppercase;
  --nav-section-header-letter-spacing: 0.05em;

  /* Transitions */
  --nav-transition-duration: 200ms;
  --nav-transition-timing: ease;

  /* Scrollbar */
  --nav-scrollbar-width: 6px;
  --nav-scrollbar-color: light-dark(var(--mantine-color-gray-4), var(--mantine-color-dark-4));
}
```

### Props

#### Per-component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `vars` | `Record<string, string>` | `undefined` | Per-instance CSS variable overrides |

### Hooks

```typescript
function useNavVars(): {
  getVar: (name: string) => string;       // Read a CSS variable value
  setVar: (name: string, value: string) => void;  // Set a CSS variable
  resetVars: () => void;                  // Reset all to defaults
};
```

## Component Structure

Components reference CSS variables in their CSS modules:

```css
/* NavItem.module.css */
.root {
  height: var(--nav-item-height);
  padding-inline: var(--nav-item-padding-x);
  border-radius: var(--nav-item-border-radius);
  color: var(--nav-item-color);
  transition: background-color var(--nav-transition-duration) var(--nav-transition-timing);
}

.root:hover {
  background-color: var(--nav-item-hover-bg);
}

.root[data-active] {
  background-color: var(--nav-item-active-bg);
  color: var(--nav-item-active-color);
}
```

## Behavior
- All visual properties are driven by CSS custom properties
- Default values reference Mantine's CSS variables for consistency
- Variables can be overridden at any scope: `:root`, `.sidebar`, or per-instance via `vars`
- `light-dark()` function is used for color mode awareness
- Per-instance `vars` prop sets CSS variables inline on the component's root element
- `useNavVars()` provides programmatic access to read/write variables
- All variables are documented and typed via TypeScript
- Adding `data-nav-theme="custom"` to any ancestor scopes variable overrides

## Accessibility
- CSS variables do not affect accessibility directly
- Contrast ratios must be maintained regardless of variable overrides (dev-mode warning)

## Dependencies
- **Spec 037** — Light / dark mode (variables use `light-dark()`)
- **Spec 038** — Custom color schemes (color configs map to CSS variables)

## Testing Criteria
- [ ] All components use CSS variables (no hardcoded colors/sizes)
- [ ] Overriding a variable changes the visual output
- [ ] Per-instance `vars` prop works
- [ ] `light-dark()` function produces correct values in both modes
- [ ] Variables inherit correctly through nesting
- [ ] `useNavVars()` reads and writes correctly
- [ ] All documented variables exist
- [ ] Storybook story with variable playground

## Open Questions
- Should we provide a CSS variable generator tool for design token integration?
- Should variables be organized into semantic groups or kept flat?
