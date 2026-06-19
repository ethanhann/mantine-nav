/**
 * Post-build package checks (run after `npm run build`):
 *  1. every `exports` target file exists,
 *  2. the main and `/presets` entries import and expose their key API,
 *  3. the headless engine tree-shakes free of Mantine (a consumer importing only
 *     `can`/`resolve` should not pull `@mantine/core` into its bundle).
 */

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = new URL("..", import.meta.url);
const pkg = JSON.parse(readFileSync(new URL("package.json", root), "utf8"));

// 1. exports targets exist
for (const [subpath, entry] of Object.entries(pkg.exports)) {
	const targets = typeof entry === "string" ? [entry] : Object.values(entry);
	for (const target of targets) {
		assert(
			existsSync(new URL(target, root)),
			`exports "${subpath}" → ${target} is missing`,
		);
	}
}
console.log("✓ all exports targets exist");

// 2. entries import and expose their API
const main = await import(new URL("dist/index.js", root).href);
for (const name of [
	"can",
	"feature",
	"Gate",
	"Can",
	"CanProvider",
	"resolve",
	"useCan",
]) {
	assert(
		typeof main[name] === "function",
		`main entry missing export: ${name}`,
	);
}
const presets = await import(new URL("dist/presets/index.js", root).href);
for (const name of ["rbacAuthorize", "createTierEntitle"]) {
	assert(
		typeof presets[name] === "function",
		`presets entry missing export: ${name}`,
	);
}
console.log("✓ main and /presets entries expose their API");

// 3. headless tree-shaking: bundle a probe that uses only the engine/predicates
const probe = `import { can, resolve, allow } from ${JSON.stringify(fileURLToPath(new URL("dist/index.js", root)))};
export default [can, resolve, allow];`;
const result = await build({
	stdin: { contents: probe, resolveDir: fileURLToPath(root), loader: "js" },
	bundle: true,
	write: false,
	format: "esm",
	// keep peers external: a surviving reference shows up as an `import ... from "@mantine/core"`
	external: [
		"react",
		"react-dom",
		"react/jsx-runtime",
		"@mantine/core",
		"@mantine/hooks",
	],
});
const out = result.outputFiles[0].text;
assert(
	!out.includes("@mantine/core"),
	"headless probe pulled in @mantine/core, tree-shaking regressed",
);
console.log("✓ engine/predicates tree-shake free of Mantine");

console.log("\npackage checks passed");
