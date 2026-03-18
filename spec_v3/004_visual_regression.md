# Spec v3 004: Visual Regression Testing -- Chromatic Integration

## Category
Testing

## Status
Draft

## Summary
Integrate Chromatic with Storybook for automated visual regression testing on every
pull request. Capture baselines for all stories, configure snapshot thresholds, and
add a GitHub Actions CI workflow.

## Motivation
The v2 retrospective noted: "Storybook is set up but Chromatic or similar visual
snapshot testing is not integrated." Storybook stories exist for 30+ scenarios but
changes can introduce subtle visual regressions (spacing, color, alignment) that
unit tests and integration tests cannot catch.

## Chromatic Setup

### Installation

```bash
npm install --save-dev chromatic
```

### Package Scripts

```json
{
  "scripts": {
    "chromatic": "chromatic --exit-zero-on-changes --exit-once-uploaded",
    "chromatic:ci": "chromatic --auto-accept-changes main"
  }
}
```

### Project Token

Store the Chromatic project token as a GitHub Actions secret:
- Secret name: `CHROMATIC_PROJECT_TOKEN`
- Configure at: https://www.chromatic.com/manage → Project → Configure

## GitHub Actions Workflow

```yaml
# .github/workflows/chromatic.yml
name: Chromatic

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Required for TurboSnap

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci

      - uses: chromaui/action@latest
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          onlyChanged: true  # TurboSnap: only snapshot changed stories
          exitZeroOnChanges: true  # Don't fail CI, just report
          autoAcceptChanges: main  # Auto-accept on main merges
```

## TurboSnap Configuration

TurboSnap analyzes git changes to only snapshot stories affected by code changes.
This reduces build time and cost significantly.

Requirements:
- `fetch-depth: 0` in checkout (needs full git history)
- `onlyChanged: true` in Chromatic action

Dependency tracing works automatically:
- Change `NavGroup.tsx` → snapshots `NavGroup.stories.tsx` + any recipe stories
  that import `NavGroup`
- Change `_data.tsx` → snapshots all stories that import shared data

## Story Configuration for Snapshots

### Viewport Coverage

Add viewport decorators for responsive snapshots:

```typescript
// .storybook/preview.tsx (addition)
parameters: {
  chromatic: {
    viewports: [375, 768, 1280], // Mobile, tablet, desktop
  },
},
```

### Delay for Animations

Components with transitions need a snapshot delay:

```typescript
// In specific stories
export const CollapsedSidebar: Story = {
  parameters: {
    chromatic: {
      delay: 500, // Wait for collapse animation
    },
  },
};
```

### Disabling Snapshots

For stories that are interactive-only (no visual to test):

```typescript
export const KeyboardNavDemo: Story = {
  parameters: {
    chromatic: { disableSnapshot: true },
  },
};
```

## Baseline Capture Strategy

### Initial Baseline (One-Time)

1. Run `npx chromatic` on `main` to capture initial baselines
2. Review all snapshots in Chromatic UI
3. Accept baselines for all viewports

### Ongoing Process

1. Developer opens PR with component changes
2. Chromatic runs via GitHub Actions
3. Changed stories are re-captured
4. Chromatic UI shows visual diffs
5. Developer or reviewer accepts/rejects changes
6. PR merge auto-accepts on `main`

## Snapshot Coverage

All existing story categories should be captured:

| Category | Stories | Viewports | Total Snapshots |
|----------|---------|-----------|-----------------|
| Shell | 3 | 3 | 9 |
| Sidebar | 5 | 3 | 15 |
| NavBar | 4 | 3 | 12 |
| NavGroup | 3 | 3 | 9 |
| SaaS | 5 | 3 | 15 |
| Theming | 4 | 3 | 12 |
| Dashboard | 3 | 3 | 9 |
| Recipes | 4 | 3 | 12 |
| Layout | 3 | 3 | 9 |
| **Total** | **34** | | **~102** |

With TurboSnap, most PRs will only snapshot 5-15 stories.

## Threshold Configuration

Chromatic's default diff threshold is sufficient for most cases. For components
with known rendering variance (e.g., icon fonts, anti-aliasing):

```typescript
parameters: {
  chromatic: {
    diffThreshold: 0.2, // Allow 20% pixel diff (default: 0.063)
  },
},
```

## Dark Mode Coverage

Capture dark mode variants by adding a story decorator:

```typescript
// stories/Theming/DarkMode.stories.tsx
export const DarkModeFull: Story = {
  decorators: [
    (Story) => (
      <MantineProvider defaultColorScheme="dark">
        <Story />
      </MantineProvider>
    ),
  ],
};
```

## Accessibility
No direct impact. Visual regression testing complements a11y testing
(which is handled by the Storybook a11y addon).

## Dependencies
- **Spec v3 001** -- CSS consolidation (baselines should be captured after styling
  is finalized)
- **Spec v3 003** -- Integration tests (both test types should be in CI)
- **Spec v2 009** -- Storybook setup (Chromatic builds on existing Storybook)

## Testing Criteria
- [ ] `npx chromatic` runs successfully and uploads snapshots
- [ ] GitHub Actions workflow triggers on PRs
- [ ] TurboSnap correctly limits snapshots to changed stories
- [ ] Three viewport sizes (375, 768, 1280) captured per story
- [ ] Dark mode stories captured
- [ ] Animation stories have appropriate delay
- [ ] Baseline accepted for all current stories
- [ ] Visual diff UI accessible to all team members

## Open Questions
- Should Chromatic results block PR merge, or just report?
  (Recommended: report-only initially, block after baselines stabilize.)
- What is the budget for Chromatic snapshots per month? Free tier allows 5,000/month.
  With TurboSnap and ~102 total snapshots, this should be sufficient for moderate
  PR volume.
- Should we also capture Storybook `@storybook/test-runner` accessibility snapshots
  alongside visual snapshots?
