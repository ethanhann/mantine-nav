import { MantineProvider } from "@mantine/core";
import type { Preview } from "@storybook/react-vite";
import React from "react";
import ReactDOM from "react-dom";
import { MINIMAL_VIEWPORTS } from "storybook/viewport";

import "@mantine/core/styles.css";
import "@mantine/spotlight/styles.css";

if (process.env.NODE_ENV !== "production") {
	import("@axe-core/react").then((axe) => {
		axe.default(React, ReactDOM, 1000);
	});
}
import "@mantine/code-highlight/styles.css";
import "highlight.js/styles/an-old-hope.css";
import {
	CodeHighlightAdapterProvider,
	createHighlightJsAdapter,
} from "@mantine/code-highlight";
import hljs from "highlight.js/lib/core";
import shellLang from "highlight.js/lib/languages/shell";
import tsLang from "highlight.js/lib/languages/typescript";

hljs.registerLanguage("typescript", tsLang);
hljs.registerLanguage("shell", shellLang);
const highlightJsAdapter = createHighlightJsAdapter(hljs);

const preview: Preview = {
	tags: ["autodocs"],
	globalTypes: {
		colorScheme: {
			description: "Mantine color scheme",
			toolbar: {
				title: "Scheme",
				icon: "mirror",
				items: [
					{ value: "light", title: "Light" },
					{ value: "dark", title: "Dark" },
				],
				dynamicTitle: true,
			},
		},
	},
	initialGlobals: {
		colorScheme: "light",
	},
	parameters: {
		viewport: {
			options: MINIMAL_VIEWPORTS,
		},
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /date$/i,
			},
		},
	},
	decorators: [
		(Story, context) => (
			<MantineProvider
				forceColorScheme={
					context.globals.colorScheme === "dark" ? "dark" : "light"
				}
			>
				<CodeHighlightAdapterProvider adapter={highlightJsAdapter}>
					<Story />
				</CodeHighlightAdapterProvider>
			</MantineProvider>
		),
	],
};

export default preview;
