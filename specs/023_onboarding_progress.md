# Spec 023: Onboarding Progress

## Category
SaaS & Multi-Tenant

## Status
Draft

## Summary
A progress indicator in the sidebar or navbar showing onboarding completion status (e.g., "3 of 5 steps complete") with links to incomplete steps.

## Motivation
New user onboarding is critical for SaaS retention. A visible progress indicator in the navigation keeps setup steps top-of-mind and guides users through activation milestones — patterns seen in Slack, Notion, and Intercom.

## Mantine Foundation
- `Progress` — Progress bar
- `RingProgress` — Circular progress indicator
- `Stepper` — Step-by-step progress
- `Popover` — Detailed step list
- `Checkbox` — Step completion indicators

## API Design

### Props

#### `OnboardingProgress` component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | `OnboardingStep[]` | `[]` | List of onboarding steps |
| `variant` | `'bar' \| 'ring' \| 'checklist'` | `'bar'` | Visual style |
| `placement` | `'sidebar' \| 'navbar' \| 'custom'` | `'sidebar'` | Where to render |
| `collapsible` | `boolean` | `true` | Whether the detail panel can be collapsed |
| `defaultExpanded` | `boolean` | `true` | Initial expanded state |
| `onStepClick` | `(step: OnboardingStep) => void` | `undefined` | Callback when an incomplete step is clicked |
| `onComplete` | `() => void` | `undefined` | Callback when all steps are completed |
| `onDismiss` | `() => void` | `undefined` | Callback when user dismisses onboarding |
| `dismissible` | `boolean` | `true` | Allow dismissing the onboarding widget |
| `showAfterComplete` | `boolean` | `false` | Keep showing after all steps complete |

#### `OnboardingStep` type

```typescript
interface OnboardingStep {
  id: string;
  label: string;
  description?: string;
  completed: boolean;
  href?: string;
  icon?: ReactNode;
  optional?: boolean;
}
```

### Hooks

```typescript
function useOnboarding(): {
  steps: OnboardingStep[];
  completedCount: number;
  totalCount: number;
  progress: number;          // 0-100 percentage
  isComplete: boolean;
  isDismissed: boolean;
  dismiss: () => void;
  nextIncompleteStep: OnboardingStep | null;
};
```

## Component Structure

```
<Sidebar>
  <NavSection label="Getting Started">
    <OnboardingProgress
      steps={[
        { id: '1', label: 'Create account', completed: true },
        { id: '2', label: 'Invite team', completed: true },
        { id: '3', label: 'Connect data source', completed: false, href: '/setup/data' },
        { id: '4', label: 'Create first dashboard', completed: false, href: '/setup/dashboard' },
        { id: '5', label: 'Set up alerts', completed: false, optional: true },
      ]}
      onDismiss={handleDismiss}
    />
  </NavSection>
</Sidebar>

// Bar variant:
// ┌───────────────────────────┐
// │ Getting Started  2/5  ✕   │
// │ ████████░░░░░░░░░░  40%   │
// │ ✓ Create account          │
// │ ✓ Invite team             │
// │ ○ Connect data source →   │
// │ ○ Create first dashboard  │
// │ ○ Set up alerts (optional)│
// └───────────────────────────┘
```

## Behavior
- Shows the number of completed steps out of total (e.g., "2 of 5")
- Progress bar/ring fills proportionally to completion
- Completed steps show a checkmark; incomplete steps show an empty circle
- Clicking an incomplete step navigates to `href` or calls `onStepClick`
- Optional steps are labeled and don't block overall completion
- When all required steps are complete, `onComplete` fires
- If `showAfterComplete={false}` (default), the widget is hidden after completion
- `dismissible={true}` shows a close button; dismissal is tracked via `useOnboarding().isDismissed`
- In rail mode (Spec 008), shows a compact ring progress indicator

## Accessibility
- Progress bar: `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Step list: `role="list"` with `role="listitem"` children
- Completed steps: `aria-label="Completed: <step label>"`
- Incomplete steps: clickable with `role="link"` semantics

## Dependencies
- **Spec 008** — Collapsible rail mode (compact indicator)
- **Spec 011** — Sections & dividers (renders within a section)

## Testing Criteria
- [ ] Progress bar shows correct completion percentage
- [ ] Steps render with correct completed/incomplete state
- [ ] Clicking incomplete step calls `onStepClick` or navigates
- [ ] `onComplete` fires when all required steps done
- [ ] Dismissible widget can be closed
- [ ] Optional steps labeled correctly
- [ ] Rail mode shows compact indicator
- [ ] All three variants render correctly
- [ ] Storybook story with interactive steps

## Open Questions
- Should completion trigger a celebration animation (confetti)?
- Should dismissed state persist in localStorage or be managed externally?
