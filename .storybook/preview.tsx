import { MantineProvider } from "@mantine/core";
import type { Preview } from "@storybook/react";
import React from "react";
import "@mantine/core/styles.css";
import "@mantine/code-highlight/styles.css";
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
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /date$/i,
			},
		},
	},
	decorators: [
		(Story) => (
			<MantineProvider>
				<CodeHighlightAdapterProvider adapter={highlightJsAdapter}>
					<Story />
				</CodeHighlightAdapterProvider>
			</MantineProvider>
		),
	],
};

export default preview;
