import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconHome } from "@tabler/icons-react";

import { NavBreadcrumbs } from "../../src";
import { deepNestedItems, sampleItems, ultraDeepItems } from "../_data";

/** Renders breadcrumbs derived from the nav item tree using Mantine's Breadcrumbs component. Automatically walks the tree to find the active item and builds the ancestor chain. */
const meta: Meta<typeof NavBreadcrumbs> = {
	title: "NavBreadcrumbs/NavBreadcrumbs",
	component: NavBreadcrumbs,
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NavBreadcrumbs>;

/** Active item inside a group shows the group as an ancestor. */
export const Default: Story = {
	args: {
		items: sampleItems,
		currentPath: "/products/inventory",
	},
};

/** A "Home" root entry is prepended to the breadcrumb trail. */
export const WithRootEntry: Story = {
	args: {
		items: sampleItems,
		currentPath: "/products/pricing",
		rootEntry: {
			label: "Home",
			href: "/",
			icon: <IconHome size={14} stroke={1.5} />,
		},
		showIcons: true,
	},
};

/** Icons from nav items shown alongside breadcrumb labels. */
export const WithIcons: Story = {
	args: {
		items: sampleItems,
		currentPath: "/products/inventory",
		showIcons: true,
	},
};

/** A custom separator between breadcrumb segments. */
export const CustomSeparator: Story = {
	args: {
		items: deepNestedItems,
		currentPath: "/docs/quickstart",
		separator: ">",
	},
};

/** Deep nesting produces a long breadcrumb trail. */
export const DeepNesting: Story = {
	args: {
		items: deepNestedItems,
		currentPath: "/docs/bikeshedding",
	},
};

/** Ultra-deep tree with four levels of group nesting. */
export const UltraDeep: Story = {
	args: {
		items: ultraDeepItems,
		currentPath: "/platform/infra/compute/instances/monitoring",
		showIcons: true,
	},
};

/** Custom rendering of each breadcrumb entry. */
export const CustomRenderItem: Story = {
	args: {
		items: sampleItems,
		currentPath: "/orders/returns",
		renderItem: (entry) => (
			<span
				style={{
					fontWeight: entry.isCurrentPage ? 700 : 400,
					textTransform: "uppercase",
					fontSize: 12,
					letterSpacing: 1,
				}}
			>
				{entry.label}
			</span>
		),
	},
};

/** Top-level link with no parent groups produces a single breadcrumb. */
export const FlatItem: Story = {
	args: {
		items: sampleItems,
		currentPath: "/analytics",
	},
};

/** No breadcrumbs rendered when the path does not match any item. */
export const NoMatch: Story = {
	args: {
		items: sampleItems,
		currentPath: "/nonexistent",
	},
};
