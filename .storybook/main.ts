import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
	stories: ["../stories/**/*.stories.tsx"],
	core: {
		disableTelemetry: true,
	},
	addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
	framework: "@storybook/react-vite",
};

export default config;
