# Run all validation checks and tests
validate:
    npm run lint
    npm run typecheck
    npm run test:run
    npm run build
    npm run lint:package
    npm run check:exports
    npm run storybook:build

# Full mutation test run, writes reports/mutation/mutation.{html,json}
mutate:
    npm run test:mutation

# Mutation test a single file, e.g. just mutate-file src/hooks/useHeadlessSidebar.ts
mutate-file file:
    npx stryker run --mutate '{{file}}'

# Re-test only what changed since the last run
mutate-incremental:
    npm run test:mutation:incremental

# Autofix lint issues and format with biome (JS/TS)
fix:
    bun x biome check --write --unsafe

docs:
    npm run dev
