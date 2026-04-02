import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
	plugins: [
		react(),
		dts({
			insertTypesEntry: true,
			include: ["src"],
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
