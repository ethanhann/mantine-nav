# Spec v3 001: CSS Strategy Consolidation -- Eliminate Inline Styles

## Category
Developer Experience

## Status
Draft

## Summary
Replace all remaining inline `style` props with Mantine's `classNames`, `styles`,
and `vars` APIs so the library has a single, consistent styling strategy.

## Motivation
The v2 retrospective noted that "some components use Mantine's built-in styles while
others have `.module.css` files." The v2 rebuild successfully removed all CSS module
files, but introduced inline `style` props in several components as a quick
workaround. These inline styles:

- Cannot be overridden by consumers via Mantine's `classNames` API
- Don't respond to theme changes
- Break the "Mantine-first" principle from Spec v2 000

## Current State

The following inline `style` props exist in library source:

| File | Line | Inline Style | Purpose |
|------|------|-------------|---------|
| `NavSidebar.tsx` | 28 | `style={{ width: '100%' }}` | Fill sidebar width |
| `NavSidebar.tsx` | 32 | `style={{ flex: 1, overflow: 'hidden' }}` | Scrollable content area |
| `WorkspaceSwitcher.tsx` | 55 | `style={{ flex: 1 }}` on `Text` | Truncate workspace name |
| `WorkspaceSwitcher.tsx` | 58 | `style={{ opacity: 0.5 }}` on icon | Dim selector chevron |
| `NavHeader.tsx` | 20 | `style={{ flex: 1 }}` on `Group` | Fill header width |
| `NavHeader.tsx` | 31 | `style={{ flex: 1 }}` on `Group` | Center content area |
| `UserMenu.tsx` | 50 | `style={{ flex: 1, minWidth: 0 }}` on `div` | Truncate user info |

## Migration Strategy

### Approach 1: Mantine `styles` Prop (Preferred)

Mantine components accept a `styles` prop that maps to internal element selectors.
This is the preferred approach for component-internal styling:

```tsx
// Before (inline)
<Group style={{ flex: 1 }}>

// After (Mantine styles prop on parent)
<Group flex={1}>
```

### Approach 2: Mantine Style Props

Many common CSS properties are available as direct props on Mantine components:

```tsx
// Before
<Text style={{ flex: 1 }}>

// After
<Text flex={1}>
```

### Approach 3: `classNames` for Complex Cases

For styles that consumers should be able to override, use named class targets:

```tsx
// Component definition
<ScrollArea classNames={{ viewport: classes.sidebarContent }}>

// Consumer override
<NavSidebar classNames={{ content: 'my-custom-class' }} />
```

## Migration Table

| Component | Current Inline Style | Replacement |
|-----------|---------------------|-------------|
| `NavSidebar` | `width: '100%'` | `w="100%"` Mantine style prop |
| `NavSidebar` | `flex: 1, overflow: 'hidden'` | `flex={1}` prop + `ScrollArea` (already handles overflow) |
| `WorkspaceSwitcher` | `flex: 1` on Text | `flex={1}` Mantine style prop |
| `WorkspaceSwitcher` | `opacity: 0.5` on icon | `opacity={0.5}` Mantine style prop |
| `NavHeader` | `flex: 1` on Group | `flex={1}` Mantine style prop |
| `UserMenu` | `flex: 1, minWidth: 0` on div | Replace `<div>` with `<Box flex={1} miw={0}>` |

## Component `classNames` API

Each component should expose a `classNames` prop for consumer overrides:

```typescript
interface NavSidebarClassNames {
  root?: string;
  header?: string;
  content?: string;
  footer?: string;
}

interface NavHeaderClassNames {
  root?: string;
  logo?: string;
  center?: string;
  actions?: string;
}

interface NavGroupClassNames {
  root?: string;
  item?: string;
  itemActive?: string;
  group?: string;
  label?: string;
}
```

## Validation

After migration, the following command should return zero results:

```bash
grep -rn 'style={{' src/components/ --include='*.tsx'
```

## Accessibility
No changes -- styling migration does not affect ARIA attributes or keyboard behavior.

## Dependencies
None (foundational for v3).

## Testing Criteria
- [ ] Zero inline `style` props in `src/components/`
- [ ] All existing unit tests still pass
- [ ] All Storybook stories render identically (visual diff)
- [ ] Consumer `classNames` prop works for NavSidebar, NavHeader, NavGroup
- [ ] Theme color changes propagate to all styled elements
- [ ] Storybook build succeeds

## Open Questions
- Should we expose `classNames` on all components or only the layout components
  (NavShell, NavSidebar, NavHeader)?
- Should `vars` API be exposed for CSS variable overrides, or is `classNames`
  sufficient for consumer customization?
