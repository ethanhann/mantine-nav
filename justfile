# Run all validation checks and tests
validate:
    npm run lint
    npm run typecheck
    npm run test:run
    npm run build
    npm run check:package
    npm run lint:package
    npm run check:exports
    npm run storybook:build

# Autofix lint issues and format with biome (JS/TS)
fix:
    bun x biome check --write --unsafe

docs:
    npm run dev
