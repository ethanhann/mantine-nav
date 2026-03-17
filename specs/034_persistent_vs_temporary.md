# Spec 034: Persistent vs. Temporary

## Category
Responsive & Layout

## Status
Draft

## Summary
Choose between an always-visible (persistent) sidebar that pushes content aside and a temporary (dismissible) sidebar that overlays content and auto-closes after navigation.

## Motivation
Different app contexts call for different sidebar behaviors. Admin panels typically want persistent sidebars, while content-heavy apps (docs readers, email) may prefer temporary sidebars that maximize reading space. This spec provides the behavioral toggle between these modes.

## Mantine Foundation
- `AppShell` — `navbar.collapsed` controls visibility
- `Drawer` — Temporary mode implementation
- `Transition` — Mode change animations

## API Design

### Props

#### `Sidebar` additions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mode` | `'persistent' \| 'temporary'` | `'persistent'` | Sidebar behavior mode |
| `autoClose` | `boolean` | `true` | In temporary mode, close after navigation |
| `autoCloseDelay` | `number` | `0` | Delay before auto-closing (ms) |
| `pushContent` | `boolean` | `true` | In persistent mode, push main content; if false, overlay |
| `showOnHover` | `boolean` | `false` | In temporary mode, open on mouse hover near edge |
| `hoverTriggerWidth` | `number` | `20` | Width of the hover trigger zone (px) |

### Hooks

```typescript
function useSidebarMode(): {
  mode: 'persistent' | 'temporary';
  setMode: (mode: 'persistent' | 'temporary') => void;
  toggleMode: () => void;
  isPersistent: boolean;
  isTemporary: boolean;
};
```

## Component Structure

```
// Persistent mode:
<AppShell navbar={{ width: 260 }}>
  <AppShell.Navbar>
    <Sidebar />           // Always visible, pushes content
  </AppShell.Navbar>
  <AppShell.Main />       // Content shifts right by sidebar width
</AppShell>

// Temporary mode:
<AppShell>
  <Drawer opened={sidebarOpen}>
    <Sidebar />           // Overlays content, auto-closes
  </Drawer>
  <AppShell.Main />       // Full width
</AppShell>
```

## Behavior
- **Persistent mode**:
  - Sidebar is always visible (unless explicitly collapsed via Spec 008)
  - Content area adjusts its width to accommodate the sidebar
  - `pushContent={true}`: content shifts; `pushContent={false}`: sidebar overlays
  - Navigation does not change sidebar state
- **Temporary mode**:
  - Sidebar starts closed; opened via burger button, programmatic API, or hover trigger
  - After clicking a nav item, sidebar auto-closes (if `autoClose`)
  - Closing uses overlay behavior (Spec 033)
  - `showOnHover`: moving mouse to the left edge triggers sidebar open
- Mode can be switched dynamically via `useSidebarMode()`
- Mode preference can be persisted (e.g., in user settings)

## Accessibility
- Persistent: standard landmark navigation (`<nav>`)
- Temporary: dialog pattern when open (`role="dialog"`, focus trap)
- Mode switch should be exposed as a setting, not hidden

## Dependencies
- **Spec 008** — Collapsible rail mode (persistent mode variant)
- **Spec 032** — Breakpoint-driven toggle (auto-switches to temporary on mobile)
- **Spec 033** — Overlay mode (temporary mode uses overlay)

## Testing Criteria
- [ ] Persistent mode keeps sidebar visible
- [ ] Persistent mode pushes content
- [ ] Temporary mode starts closed
- [ ] Temporary mode opens on trigger
- [ ] Auto-close after navigation in temporary mode
- [ ] `showOnHover` opens on edge hover
- [ ] Mode switch works dynamically
- [ ] `pushContent={false}` overlays in persistent mode
- [ ] Storybook story with mode toggle

## Open Questions
- Should there be a "semi-persistent" mode (visible but can be temporarily dismissed)?
- Should the hover trigger zone be visible as a subtle indicator?
