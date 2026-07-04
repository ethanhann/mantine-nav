import { Text } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	IconChartBar,
	IconHome,
	IconPackage,
	IconSettings,
} from "@tabler/icons-react";
import type { NavItemType } from "../../src";
import { NavGroup, NavHeader, NavShell, NavSidebar } from "../../src";

/**
 * When the sidebar collapses on desktop, top-level links become an icon rail
 * and groups open a popover menu. The menu renders the group's full subtree:
 * links, section headings, dividers, and nested groups.
 */
const meta: Meta = {
	title: "Customization/CollapsedRail",
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;
type Story = StoryObj;

const railItems: NavItemType[] = [
	{
		id: "home",
		type: "link",
		label: "Home",
		href: "/",
		icon: <IconHome size={18} stroke={1.5} />,
	},
	{
		id: "products",
		type: "group",
		label: "Products",
		icon: <IconPackage size={18} stroke={1.5} />,
		children: [
			{ id: "catalog", type: "link", label: "Catalog", href: "/products" },
			{ id: "sec-admin", type: "section", label: "Administration" },
			{ id: "pricing", type: "link", label: "Pricing", href: "/pricing" },
			{ id: "div-1", type: "divider" },
			{
				id: "tools",
				type: "group",
				label: "Tools",
				children: [
					{ id: "import", type: "link", label: "Import", href: "/import" },
					{ id: "export", type: "link", label: "Export", href: "/export" },
				],
			},
		],
	},
	{
		id: "analytics",
		type: "link",
		label: "Analytics",
		href: "/analytics",
		icon: <IconChartBar size={18} stroke={1.5} />,
	},
	{
		id: "settings",
		type: "link",
		label: "Settings",
		href: "/settings",
		icon: <IconSettings size={18} stroke={1.5} />,
	},
];

/** Starts collapsed. Click the Products icon to open its full-subtree menu. */
export const Rail: Story = {
	render: () => (
		<NavShell
			defaultDesktopCollapsed
			header={<NavHeader logo={<Text fw={700}>MyApp</Text>} />}
			sidebar={
				<NavSidebar>
					<NavGroup items={railItems} currentPath="/analytics" />
				</NavSidebar>
			}
		>
			<Text p="md">
				The Products group menu shows its sections, dividers, and the nested
				Tools group.
			</Text>
		</NavShell>
	),
};
