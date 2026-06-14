import type { Meta, StoryObj } from "@storybook/react-vite";
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
					'Link items support `external: true` to open in a new tab (with `target="_blank"` and `rel="noopener noreferrer"`) and `onClick` for side effects. For links with a real `href`, navigation is NOT prevented — your `onClick` runs first (e.g. analytics) and the browser/router still navigates; call `e.preventDefault()` yourself to stop it. Action-only items (e.g. `href="#"`) use `onClick` to open modals/dialogs.',
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
	{
		id: "pricing",
		type: "link",
		label: "Pricing",
		href: "/pricing",
		icon: <IconFileText size={18} stroke={1.5} />,
		// Real href: onClick fires for analytics, then navigation proceeds.
		onClick: () => {
			console.log("track: nav_click", { to: "/pricing" });
		},
	},
	{ id: "div-1", type: "divider" },
	{
		id: "feedback",
		type: "link",
		label: "Send Feedback",
		href: "#",
		icon: <IconMessage size={18} stroke={1.5} />,
		// Action-only (href="#"): onClick opens a modal instead of navigating.
		onClick: (e) => {
			e.preventDefault();
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
