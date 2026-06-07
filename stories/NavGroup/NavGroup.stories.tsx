import type { Meta, StoryObj } from "@storybook/react-vite";

import { NavGroup } from "../../src";
import {
	deepNestedItems,
	sampleItems,
	sectionedItems,
	ultraDeepItems,
} from "../_data";

/** Renders a hierarchical tree of navigation items with support for accordion mode, keyboard navigation, type-ahead search, and active item highlighting. */
const meta: Meta<typeof NavGroup> = {
	title: "NavGroup/NavGroup",
	component: NavGroup,
	tags: ["autodocs"],
	argTypes: {
		variant: { control: "select", options: ["subtle", "light", "filled"] },
		accordion: { control: "boolean" },
		maxDepth: { control: { type: "number", min: 1, max: 5 } },
	},
};

export default meta;
type Story = StoryObj<typeof NavGroup>;

/** Basic nav tree with nested groups and links. */
export const Default: Story = {
	args: {
		items: sampleItems,
		currentPath: "/",
		variant: "subtle",
	},
};

/** A deeply nested link is highlighted as the active item. */
export const ActiveState: Story = {
	args: {
		items: sampleItems,
		currentPath: "/products/inventory",
		variant: "subtle",
	},
};

/** Filled variant with a custom color. */
export const FilledVariant: Story = {
	args: {
		items: sampleItems,
		currentPath: "/analytics",
		variant: "filled",
		color: "blue.8",
	},
};

/** Light variant with default color. */
export const LightVariant: Story = {
	args: {
		items: sampleItems,
		currentPath: "/analytics",
		variant: "light",
	},
};

/** Multiple levels of nested groups. */
export const DeepNesting: Story = {
	args: {
		items: deepNestedItems,
		currentPath: "/docs/install",
		variant: "subtle",
	},
};

/** Section headers and dividers to visually group links. */
export const SectionHeaders: Story = {
	args: {
		items: sectionedItems,
		currentPath: "/",
		variant: "subtle",
	},
};

/** Only one group can be open at a time. */
export const AccordionMode: Story = {
	args: {
		items: sampleItems,
		accordion: true,
		variant: "subtle",
	},
};

export const DeepInteractionTest: Story = {
	args: {
		items: ultraDeepItems,
		currentPath: "/platform/infra/compute/instances/monitoring",
		variant: "subtle",
		accordion: true,
		accordionScope: "sibling",
		maxDepth: 5,
		enableKeyboardNav: true,
		typeAhead: true,
	},
	parameters: {
		docs: {
			description: {
				story:
					"Tests maximum depth nesting (5 levels), accordion mode, type-ahead search, and active item matching simultaneously. The 'Monitoring' link at depth 4 should be highlighted as active.",
			},
		},
	},
};
