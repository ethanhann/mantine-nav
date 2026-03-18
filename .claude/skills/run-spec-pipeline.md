# run-spec-pipeline

## Usage
```
/run-spec-pipeline [phase]
```

Example: `/run-spec-pipeline 1` or `/run-spec-pipeline` (runs next incomplete phase)

## Instructions

You are running the Nav spec implementation pipeline. This skill orchestrates the implementation of specs in the correct dependency order, phase by phase.

### Implementation Phases

Based on the dependency analysis in `specs/COHERENCE_REVIEW.md`:

| Phase | Specs | Description |
|-------|-------|-------------|
| 1 | 044, 040, 001, 005, 007, 013 | Foundation: types, CSS vars, nav tree, active state, context, animations |
| 2 | 002, 006, 008, 011, 012, 037 | Sidebar Core: accordion, keyboard, rail, sections, scroll, dark mode |
| 3 | 003, 004, 009, 010, 039 | Sidebar Features: DnD, pinned, resize, mini, icons |
| 4 | 014, 015, 016, 017, 018 | NavBar: mega menus, command palette, breadcrumbs, tabs, env indicator |
| 5 | 032, 033, 034, 035, 036 | Responsive: breakpoints, overlay, persistent/temp, coordinated, print |
| 6 | 019, 020, 021, 022, 023, 024, 025 | SaaS: workspace, user menu, plan, notifications, onboarding, flags, invite |
| 7 | 026, 027, 028, 029, 030, 031 | Dashboard: switcher, filters, live status, filter panel, recents, starred |
| 8 | 038, 041, 042, 043, 045, 046, 047 | Theming & DX: colors, presets, RTL, dual API, storybook, headless, SSR |

### Steps

1. **Read progress**: Read `specs/progress.md` to determine which specs are already complete.

2. **Determine phase**: If a phase number is provided, use that. Otherwise, find the first phase with incomplete specs.

3. **For each spec in the phase** (in listed order):
   a. Check if already complete in `progress.md` — skip if so
   b. Run `/implement-spec <NNN>` for the spec
   c. Verify tests pass: `npm test -- --run`
   d. Verify build succeeds: `npm run build`
   e. If tests/build fail, fix the issues before proceeding

4. **After all specs in the phase are complete**:
   - Run the full test suite
   - Run the build
   - Update `specs/progress.md` with phase completion
   - Commit: `feat(nav): complete phase <N> — <phase description>`
   - Report the phase summary to the user

5. **If a spec implementation fails or is blocked**:
   - Log the blocker in `specs/progress.md` under the spec entry
   - Skip to the next spec in the phase
   - Report all blockers at the end of the phase

### Progress Tracking

All progress is tracked in `specs/progress.md`. This file is the source of truth for what has been implemented.
