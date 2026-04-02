import { Badge } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react";
import {
	IconBrandGithub,
	IconExternalLink,
	IconFileText,
	IconHome,
	IconMessage,
} from "@tabler/icons-react";

import type { NavItemType } from "../../src";
import { NavGroup } from "../../src";

const meta: Meta<typeof NavGroup> = {
	title: "NavGroup/ExternalAndOnClick",
	component: NavGroup,
	tags: ["autodocs"],
	parameters: {
		docs: {
			description: {
				component:
					'Link items support `external: true` to open in a new tab (with `target="_blank"` and `rel="noopener noreferrer"`) and `onClick` for action-only items (modals, dialogs) that prevent navigation.',
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
		id: "docs",
		type: "link",
		label: "Documentation",
		href: "https://mantine.dev",
		icon: <IconFileText size={18} stroke={1.5} />,
		external: true,
		badge: <IconExternalLink size={14} />,
	},
	{
		id: "github",
		type: "link",
		label: "GitHub",
		href: "https://github.com",
		icon: <IconBrandGithub size={18} stroke={1.5} />,
		external: true,
		badge: <IconExternalLink size={14} />,
	},
	{ id: "div-1", type: "divider" },
	{
		id: "feedback",
		type: "link",
		label: "Send Feedback",
		href: "#",
		icon: <IconMessage size={18} stroke={1.5} />,
		onClick: (e) => {
			alert("Feedback modal would open here!");
		},
	},
];

/** Mix of internal links, external links (open in new tab), and onClick action items. */
export const MixedLinkTypes: Story = {
	args: {
		items,
		currentPath: "/",
		variant: "subtle",
	},
};
