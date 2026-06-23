import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import dts from "unplugin-dts/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		react(),
		dts({
			include: ["src"],
			exclude: ["**/*.test.*", "**/__integration__/**", "**/test-setup.*"],
			entryRoot: "src",
			// Enforce type bundling using api-extractor
			bundleTypes: true,
			// Auto-generates the entry point helper file based on package.json
			insertTypesEntry: true,
		}),
	],
	css: {
		modules: {
			localsConvention: "camelCase",
		},
	},
	build: {
		lib: {
			entry: resolve(__dirname, "src/index.ts"),
			name: "Nav",
			formats: ["es", "cjs"],
			fileName: "index",
		},
		rollupOptions: {
			external: [
				"react",
				"react-dom",
				"react/jsx-runtime",
				"@mantine/core",
				"@mantine/hooks",
				"@mantine/spotlight",
				"@tabler/icons-react",
			],
			output: {
				globals: {
					react: "React",
					"react-dom": "ReactDOM",
					"@mantine/core": "MantineCore",
					"@mantine/hooks": "MantineHooks",
					"@mantine/spotlight": "MantineSpotlight",
					"@tabler/icons-react": "TablerIcons",
				},
			},
		},
	},
});
