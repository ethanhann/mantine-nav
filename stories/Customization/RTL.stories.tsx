import { DirectionProvider } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { NavGroup, NavHeader, NavShell, NavSidebar } from "../../src";
import { sampleItems } from "../_data";

/** RTL layout with sidebar on the right, flipped tooltips, and correct keyboard navigation. */
const meta: Meta = {
	title: "Customization/RTL",
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
	},
	decorators: [
		(Story) => (
			<DirectionProvider initialDirection="rtl" detectDirection={false}>
				<div dir="rtl">
					<Story />
				</div>
			</DirectionProvider>
		),
	],
};

export default meta;
type Story = StoryObj;

/** Full shell with sidebar, header, and nav tree in RTL. Collapse the sidebar to see flipped tooltips and icon direction. */
export const Default: Story = {
	render: () => (
		<NavShell
			header={
				<NavHeader logo={<span style={{ fontWeight: 700 }}>RTL App</span>} />
			}
			sidebar={
				<NavSidebar>
					<NavGroup items={sampleItems} currentPath="/products/inventory" />
				</NavSidebar>
			}
		>
			<div style={{ padding: 16 }}>
				<p>The sidebar renders on the right in RTL mode.</p>
				<p>
					Collapse the sidebar to verify tooltips appear on the left and the
					chevron icon flips.
				</p>
				<p>
					Use ArrowLeft to expand groups and ArrowRight to collapse them
					(swapped from LTR).
				</p>
			</div>
		</NavShell>
	),
};
