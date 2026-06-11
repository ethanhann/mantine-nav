# Run all validation checks and tests
validate:
    bun x biome check
    npx tsc --noEmit
    npx vitest run
    npx vite build
    npx storybook build

# Autofix lint issues and format with biome (JS/TS)
fix:
    bun x biome check --write --unsafe

docs:
    npm run dev
