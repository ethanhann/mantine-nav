# Spec v3 000: Overview & Priorities

## Category
Architecture

## Status
Draft

## Summary
The v3 sprint addresses gaps identified in the v2 Mantine rebuild retrospective.
Where v2 focused on rebuilding the component library on Mantine v8 primitives,
v3 focuses on production-readiness: styling consistency, migration tooling,
test depth, visual regression, publishing automation, and API polish.

## Motivation
The v2 sprint retrospective (2026-03-18) identified four improvement areas:

1. **CSS module consolidation** -- Inline `style` props remain in several components
   where Mantine's `classNames`/`styles`/`vars` APIs could be used instead.
2. **V1-to-V2 migration gap** -- A migration plan exists (spec v2 010) but no
   automated codemods or adapter components were built.
3. **Test coverage depth** -- Unit tests exist but no integration tests covering
   multi-component flows (e.g., sidebar collapse + keyboard nav + workspace switch).
4. **No visual regression testing** -- Storybook is configured but Chromatic or
   equivalent snapshot testing is not integrated.

Two additional next steps were identified:

5. **Publish first pre-release** -- The package is configured for GitHub Packages
   but no version has been published.
6. **API ergonomics review** -- Gather consumer feedback and polish the public API
   surface before a stable 1.0 release.

## Spec Index

| Spec | Title | Category | Priority |
|------|-------|----------|----------|
| v3 001 | CSS Strategy Consolidation | Developer Experience | P0 -- Foundation |
| v3 002 | Automated v1-to-v2 Codemods | Implementation | P1 -- Unblocks adoption |
| v3 003 | Integration Test Suite | Testing | P1 -- Quality gate |
| v3 004 | Visual Regression Testing | Testing | P2 -- CI safety net |
| v3 005 | Pre-release Publishing Pipeline | Infrastructure | P2 -- Distribution |
| v3 006 | API Ergonomics Review | Developer Experience | P3 -- Polish |

## Dependency Graph

```
001 CSS Consolidation (no deps -- foundational)
 ├── 002 Migration Codemods (needs final CSS/API surface)
 ├── 003 Integration Tests (tests the consolidated components)
 │    └── 004 Visual Regression (captures test baselines)
 │         └── 005 Pre-release Publish (CI must pass first)
 └── 006 API Ergonomics (informed by all above)
```

## Execution Order

**Phase 1 -- Foundation (Spec 001)**
Consolidate all inline styles to Mantine APIs. This is prerequisite because
subsequent specs (codemods, tests, snapshots) target the final component API.

**Phase 2 -- Quality (Specs 002, 003 in parallel)**
Build codemods against the finalized API. Simultaneously write integration tests
for multi-component flows.

**Phase 3 -- CI (Spec 004)**
Set up Chromatic visual regression testing. Capture baselines from the stories
that now cover consolidated components.

**Phase 4 -- Ship (Spec 005)**
Automate pre-release publishing via GitHub Actions. CI must pass visual regression
and integration tests before publish.

**Phase 5 -- Polish (Spec 006)**
Review API ergonomics with consumer feedback. Document breaking change policy.
Iterate toward 1.0.

## Success Criteria
- [ ] Zero inline `style` props in library source (Spec 001)
- [ ] Working jscodeshift codemods for all v1-to-v2 transforms (Spec 002)
- [ ] Integration tests covering 5+ multi-component flows (Spec 003)
- [ ] Chromatic running in CI on every PR (Spec 004)
- [ ] At least one pre-release version published to GitHub Packages (Spec 005)
- [ ] API review document with consumer feedback incorporated (Spec 006)

## Dependencies
- **Spec v2 000** -- Architecture & design philosophy (carried forward)
- **Spec v2 010** -- Migration plan (expanded by Spec v3 002)
- **Spec v2 009** -- Storybook setup (extended by Spec v3 004)
