import { Badge, Group, Text } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	IconChartBar,
	IconHome,
	IconInbox,
	IconUsers,
} from "@tabler/icons-react";

import type { NavItemType } from "../../src";
import { NavGroup } from "../../src";

/**
 * `renderItem` lets you fully replace how each item's content is drawn while the
 * library still wraps it with the tree-navigation plumbing: `role="treeitem"`,
 * `data-item-id`, `aria-current` / `aria-expanded`, roving focus for keyboard
 * navigation, and click routing through `onItemClick`. Your render function only
 * supplies the visuals.
 */
const meta: Meta<typeof NavGroup> = {
	title: "NavGroup/RenderItem",
	component: NavGroup,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					"Custom item rendering via `renderItem`. The custom content is wrapped so it keeps accessibility roles, keyboard navigation, and click handling — you control only the visuals.",
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof NavGroup>;

const items: NavItemType[] = [
	{
		id: "home",
		type: "link",
		label: "Home",
		href: "/",
		icon: <IconHome size={18} stroke={1.5} />,
	},
	{
		id: "inbox",
		type: "link",
		label: "Inbox",
		href: "/inbox",
		icon: <IconInbox size={18} stroke={1.5} />,
		data: { count: 12 },
	},
	{
		id: "customers",
		type: "link",
		label: "Customers",
		href: "/customers",
		icon: <IconUsers size={18} stroke={1.5} />,
		data: { count: 3 },
	},
	{
		id: "analytics",
		type: "link",
		label: "Analytics",
		href: "/analytics",
		icon: <IconChartBar size={18} stroke={1.5} />,
	},
];

/**
 * Each link is drawn as a custom row with a trailing unread-count pill. Clicking
 * a row still fires `onItemClick` (check the Actions panel), and the row keeps
 * its `treeitem` role for screen readers and keyboard users.
 */
export const CustomRows: Story = {
	args: {
		items,
		currentPath: "/inbox",
		onItemClick: (item) => console.log("clicked", item.id),
		renderItem: (item) => {
			if (item.type !== "link") return null;
			const count = (item.data as { count?: number } | undefined)?.count;
			return (
				<Group
					justify="space-between"
					wrap="nowrap"
					px="sm"
					py={6}
					style={{ cursor: "pointer", borderRadius: 6 }}
				>
					<Group gap="xs" wrap="nowrap">
						{item.icon}
						<Text size="sm">{item.label}</Text>
					</Group>
					{count ? (
						<Badge size="sm" circle variant="filled" color="blue">
							{count}
						</Badge>
					) : null}
				</Group>
			);
		},
	},
};
