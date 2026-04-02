# implement-spec

## Usage
```
/implement-spec <spec-number>
```

Example: `/implement-spec 001`

## Instructions

You are implementing a feature spec from the Nav component library. Follow these steps:

### 1. Read the Spec
Read `specs/spec_v1/<NNN>_*.md` (where NNN is the zero-padded spec number provided). Understand every section: Summary, API Design, Component Structure, Behavior, Accessibility, Dependencies, and Testing Criteria.

### 2. Check Dependencies
Read the "Dependencies" section. For each dependency spec, verify the referenced component/hook already exists in the codebase. If a dependency is not yet implemented, stop and inform the user which specs must be implemented first.

### 3. Check the Coherence Review
Read `specs/spec_v1/COHERENCE_REVIEW.md` for any issues or recommendations related to this spec number. Apply relevant recommendations during implementation.

### 4. Plan the Implementation
Before writing code, outline:
- Which files to create or modify
- Which Mantine components to import
- Which types to define or extend
- Which hooks to create
- Which tests to write

### 5. Implement
Follow these conventions:
- **Location**: Components in `src/components/<ComponentName>/`, hooks in `src/hooks/`, types in `src/types/`
- **Files per component**: `<Component>.tsx`, `<Component>.module.css`, `<Component>.test.tsx`, `<Component>.story.tsx`, `index.ts` (barrel export)
- **Styling**: Use Mantine CSS modules with Nav CSS variables (`--nav-*`). Never use inline styles for themeable properties.
- **Types**: Export all public types from `src/types/index.ts`. Use generics where Spec 044 applies.
- **Hooks**: Each hook in its own file under `src/hooks/`. Export from `src/hooks/index.ts`.
- **Exports**: Update `src/index.ts` barrel export with all new public APIs.
- **'use client'**: Add `'use client'` directive to all interactive components and hooks (Spec 047).

### 6. Write Tests
Implement every checkbox item from the spec's "Testing Criteria" section as a test case using Vitest + React Testing Library. Test file goes alongside the component.

### 7. Write Storybook Story
Create a story file (`*.story.tsx`) demonstrating the component with interactive controls. Follow the conventions from Spec 045.

### 8. Update Progress
After implementation, update `specs/spec_v1/progress.md`:
- Change the spec's status from `pending` to `complete`
- Add the date of completion
- List all files created or modified

### 9. Commit
Commit with message: `feat(nav): implement spec <NNN> — <spec title>`
