# Spec 014: Mega Menu Dropdowns

## Category
NavBar-Specific

## Status
Draft

## Summary
Multi-column flyout menus triggered from navbar items, supporting rich content like grouped links, descriptions, icons, and featured sections for feature-rich top navigation.

## Motivation
Enterprise apps with broad feature sets need more than simple dropdown menus. Mega menus organize large numbers of links into scannable columns with visual hierarchy — common in SaaS marketing sites (Stripe, Vercel) and admin consoles.

## Mantine Foundation
- `HoverCard` or `Popover` — Floating panel triggered on hover/click
- `SimpleGrid` — Multi-column layout within the mega menu
- `Menu` — For simpler single-column fallback
- `Transition` — Entrance/exit animation

## API Design

### Props

#### `MegaMenu` component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | `'hover' \| 'click'` | `'hover'` | How the mega menu opens |
| `columns` | `MegaMenuColumn[]` | `[]` | Column definitions |
| `width` | `number \| string` | `'auto'` | Total width of the mega menu panel |
| `featured` | `ReactNode` | `undefined` | Optional featured/highlight section (e.g., promo card) |
| `footer` | `ReactNode` | `undefined` | Optional footer row spanning all columns |
| `closeOnItemClick` | `boolean` | `true` | Close the menu when an item is clicked |
| `openDelay` | `number` | `150` | Delay before opening on hover (ms) |
| `closeDelay` | `number` | `300` | Delay before closing on mouse leave (ms) |

#### `MegaMenuColumn` type

```typescript
interface MegaMenuColumn {
  label?: string;           // Column header
  items: MegaMenuItem[];
  span?: number;            // Grid column span (default 1)
}

interface MegaMenuItem {
  label: string;
  description?: string;
  icon?: ReactNode;
  href: string;
  badge?: ReactNode;
  disabled?: boolean;
}
```

#### `NavBarItem` additions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `megaMenu` | `MegaMenuColumn[]` | `undefined` | If provided, this item opens a mega menu instead of navigating |
| `megaMenuProps` | `MegaMenuProps` | `undefined` | Additional mega menu configuration |

### Hooks

```typescript
function useMegaMenu(): {
  opened: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  activeColumn: number | null;
};
```

## Component Structure

```
<NavBarItem label="Products">
  <MegaMenu trigger="hover" width={600}>
    <SimpleGrid cols={3}>
      <MegaMenuColumn label="Platform">
        <MegaMenuItem icon={<IconApi />} label="API" description="REST & GraphQL" />
        <MegaMenuItem icon={<IconCloud />} label="Cloud" description="Managed hosting" />
      </MegaMenuColumn>
      <MegaMenuColumn label="Tools">
        <MegaMenuItem ... />
      </MegaMenuColumn>
      <MegaMenuColumn label="Resources">
        <MegaMenuItem ... />
      </MegaMenuColumn>
    </SimpleGrid>
    <MegaMenu.Footer>
      <Button>View all products</Button>
    </MegaMenu.Footer>
  </MegaMenu>
</NavBarItem>
```

## Behavior
- Hover trigger: opens after `openDelay`, closes after `closeDelay` when mouse leaves both trigger and panel
- Click trigger: toggles on click, closes on outside click or Escape
- The mega menu panel is positioned below the navbar, aligned to the trigger item
- If the panel would overflow the viewport, it repositions (using Mantine's floating UI)
- Column headers are rendered as non-interactive labels
- Each item can have an icon, label, and description (two-line)
- `featured` section renders alongside columns (e.g., a highlighted card)
- On mobile/small screens, mega menus render as full-width panels or fall back to simple dropdown lists

## Accessibility
- Trigger: `aria-haspopup="true"`, `aria-expanded`
- Panel: `role="menu"`, items are `role="menuitem"`
- Arrow keys navigate within the menu; Escape closes
- Focus is trapped within the mega menu when opened via click
- Column headers: `role="group"` with `aria-label`

## Dependencies
- **Spec 006** — Keyboard navigation (mega menu keyboard patterns)
- **Spec 032** — Breakpoint-driven toggle (mobile fallback)

## Testing Criteria
- [ ] Mega menu opens on hover after delay
- [ ] Mega menu opens on click when `trigger="click"`
- [ ] Multiple columns render correctly
- [ ] Items with icons, labels, and descriptions render
- [ ] Featured section renders
- [ ] Footer renders spanning columns
- [ ] Escape closes the menu
- [ ] Arrow keys navigate items
- [ ] Mobile fallback renders
- [ ] Storybook story with multi-column mega menu

## Open Questions
- Should mega menus support nested sub-menus within columns?
- Should the mobile fallback be an accordion or a separate drawer?
