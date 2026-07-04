import { Text } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { NavGroup, NavHeader, NavShell, NavSidebar } from "../../src";
import { sectionedItems } from "../_data";

/**
 * `NavShell`, `NavGroup`, `NavSidebar`, and `NavHeader` accept slot-based
 * `classNames` and `styles` props, so visuals can be themed with plain CSS.
 * This story styles the tree via a stylesheet targeting the slot class names
 * and tints the navbar with an inline slot style.
 */
const meta: Meta = {
	title: "Customization/StylesApi",
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;
type Story = StoryObj;

const demoCss = `
.demo-nav-item {
	border-radius: 999px;
	margin-bottom: 4px;
}
.demo-nav-item[data-active] {
	box-shadow: inset 3px 0 0 var(--mantine-primary-color-filled);
}
.demo-nav-section {
	color: var(--mantine-primary-color-filled);
}
`;

/** Pill-shaped items and branded section headers via `classNames`, navbar tint via `styles`. */
export const SlotStyling: Story = {
	render: () => (
		<>
			<style>{demoCss}</style>
			<NavShell
				header={<NavHeader logo={<Text fw={700}>MyApp</Text>} />}
				styles={{
					navbar: {
						background:
							"light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))",
					},
				}}
				sidebar={
					<NavSidebar>
						<NavGroup
							items={sectionedItems}
							currentPath="/analytics"
							classNames={{
								item: "demo-nav-item",
								section: "demo-nav-section",
							}}
						/>
					</NavSidebar>
				}
			>
				<Text p="md">
					The tree items and section headers are styled through the slot class
					names, and the navbar background through a slot style.
				</Text>
			</NavShell>
		</>
	),
};
