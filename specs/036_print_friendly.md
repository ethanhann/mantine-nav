# Spec 036: Print-Friendly

## Category
Responsive & Layout

## Status
Draft

## Summary
Automatically hide navigation components (sidebar, navbar) when printing, ensuring printed pages show only the main content.

## Motivation
When users print dashboards, reports, or documentation, navigation elements waste paper and clutter the output. Automatic print-friendly behavior is a quality-of-life feature that eliminates the need for print-specific CSS in every consuming app.

## Mantine Foundation
- `@media print` — CSS print media query
- Mantine's `hiddenFrom` / `visibleFrom` — Conditional rendering helpers

## API Design

### Props

#### `NavLayout` additions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `printFriendly` | `boolean` | `true` | Auto-hide navigation when printing |
| `printOptions` | `PrintOptions` | `{}` | Fine-grained print control |

#### `PrintOptions` type

```typescript
interface PrintOptions {
  hideSidebar?: boolean;       // Default: true
  hideNavbar?: boolean;        // Default: true
  hideFilterPanel?: boolean;   // Default: false (filters may be relevant)
  showBreadcrumbs?: boolean;   // Default: true (helps context on paper)
  expandContent?: boolean;     // Default: true (content takes full width)
}
```

#### Per-component prop

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `printHidden` | `boolean` | auto | Force hide this component when printing |
| `printVisible` | `boolean` | auto | Force show this component when printing |

### Hooks

```typescript
function usePrintMode(): {
  isPrinting: boolean;
  print: () => void;   // Programmatic window.print()
};
```

## Component Structure

No new visual components. Print behavior is applied via CSS:

```css
@media print {
  .nav-sidebar,
  .nav-navbar {
    display: none !important;
  }

  .nav-main-content {
    margin-left: 0 !important;
    width: 100% !important;
  }

  .nav-breadcrumbs {
    display: block !important;  /* Keep for context */
  }
}
```

## Behavior
- When `printFriendly={true}`, print media queries are injected that hide navigation
- The sidebar and navbar are hidden; main content expands to full page width
- Breadcrumbs remain visible by default (configurable) to provide page context on paper
- Filter panel is shown by default (configurable) since active filters are relevant context
- `expandContent={true}` removes sidebar margin/padding from the content area
- `usePrintMode().isPrinting` returns `true` during `beforeprint`/`afterprint` window events
- Components with `printHidden` are hidden; components with `printVisible` are force-shown
- Print styles use `!important` to override inline styles from dynamic layouts
- No JavaScript-based layout changes during print — CSS-only for reliability

## Accessibility
- Print behavior is purely visual; does not affect accessibility tree
- Screen readers are unaffected by print styles

## Dependencies
- None (CSS-only feature, applies to all layout components)

## Testing Criteria
- [ ] Sidebar hidden in print media
- [ ] Navbar hidden in print media
- [ ] Content expands to full width
- [ ] Breadcrumbs visible by default
- [ ] `printHidden` hides specific elements
- [ ] `printVisible` shows specific elements
- [ ] `usePrintMode().isPrinting` reflects print state
- [ ] Filter panel behavior follows `printOptions`
- [ ] Storybook story with print preview

## Open Questions
- Should there be a "print preview" button in the navbar that shows how the page will look?
- Should print styles be in a separate CSS file that can be omitted if not needed?
