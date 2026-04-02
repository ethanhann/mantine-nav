import type { Meta, StoryObj } from "@storybook/react";
import {
	IconChartBar,
	IconHome,
	IconPackage,
	IconSettings,
	IconUsers,
} from "@tabler/icons-react";
import React from "react";
import type { NavItemType } from "../../src";
import { NavGroup } from "../../src";

const meta: Meta<typeof NavGroup> = {
	title: "NavGroup/WeightOrdering",
	component: NavGroup,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Items can specify a `weight` prop to control ordering. Lower weight = higher position. Items without weight default to 0. Stable sort preserves original order for equal weights.",
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof NavGroup>;

const weightedItems: NavItemType[] = [
	{
		id: "settings",
		type: "link",
		label: "Settings",
		href: "/settings",
		icon: <IconSettings size={18} stroke={1.5} />,
		weight: 100,
	},
	{
		id: "analytics",
		type: "link",
		label: "Analytics",
		href: "/analytics",
		icon: <IconChartBar size={18} stroke={1.5} />,
		weight: 20,
	},
	{
		id: "home",
		type: "link",
		label: "Home",
		href: "/",
		icon: <IconHome size={18} stroke={1.5} />,
		weight: -10,
	},
	{
		id: "customers",
		type: "link",
		label: "Customers",
		href: "/customers",
		icon: <IconUsers size={18} stroke={1.5} />,
		weight: 30,
	},
	{
		id: "products",
		type: "link",
		label: "Products",
		href: "/products",
		icon: <IconPackage size={18} stroke={1.5} />,
		weight: 10,
	},
];

/** Items are sorted by weight: Home (-10) → Products (10) → Analytics (20) → Customers (30) → Settings (100) */
export const WeightedItems: Story = {
	args: {
		items: weightedItems,
		currentPath: "/",
		variant: "subtle",
	},
};

const weightedGroup: NavItemType[] = [
	{
		id: "products",
		type: "group",
		label: "Products",
		icon: <IconPackage size={18} stroke={1.5} />,
		defaultOpened: true,
		weight: 10,
		children: [
			{
				id: "pricing",
				type: "link",
				label: "Pricing",
				href: "/products/pricing",
				weight: 30,
			},
			{
				id: "catalog",
				type: "link",
				label: "Catalog",
				href: "/products/catalog",
				weight: 10,
			},
			{
				id: "inventory",
				type: "link",
				label: "Inventory",
				href: "/products/inventory",
				weight: 20,
			},
		],
	},
	{
		id: "home",
		type: "link",
		label: "Home",
		href: "/",
		icon: <IconHome size={18} stroke={1.5} />,
		weight: -10,
	},
];

/** Weight sorting recurses into group children. Home appears first, then Products group with children sorted: Catalog → Inventory → Pricing. */
export const RecursiveGroupSorting: Story = {
	args: {
		items: weightedGroup,
		currentPath: "/",
		variant: "subtle",
	},
};
