import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
	plugins: [
		react(),
		dts({
			include: ["src"],
			exclude: ["**/*.test.*", "**/__integration__/**", "**/test-setup.*"],
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
				"@tabler/icons-react",
			],
			output: {
				globals: {
					react: "React",
					"react-dom": "ReactDOM",
					"@mantine/core": "MantineCore",
					"@mantine/hooks": "MantineHooks",
					"@tabler/icons-react": "TablerIcons",
				},
			},
		},
	},
});
