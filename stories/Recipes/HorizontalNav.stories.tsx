import { Anchor, Tabs, Text } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	IconBook,
	IconChartBar,
	IconHome,
	IconPackage,
	IconSettings,
} from "@tabler/icons-react";
import { useState } from "react";

import type { NavItemType } from "../../src";
import {
	NavGroup,
	NavHeader,
	NavShell,
	NavSidebar,
	useActiveNavItem,
} from "../../src";

const topNavItems: NavItemType[] = [
	{
		id: "home",
		type: "link",
		label: "Home",
		href: "/",
		activeExact: true,
		icon: <IconHome size={16} />,
	},
	{
		id: "products",
		type: "link",
		label: "Products",
		href: "/products",
		icon: <IconPackage size={16} />,
	},
	{
		id: "analytics",
		type: "link",
		label: "Analytics",
		href: "/analytics",
		icon: <IconChartBar size={16} />,
	},
	{
		id: "settings",
		type: "link",
		label: "Settings",
		href: "/settings",
		icon: <IconSettings size={16} />,
	},
];

const sidebarItems: Record<string, NavItemType[]> = {
	"/products": [
		{
			id: "catalog",
			type: "group",
			label: "Catalog",
			defaultOpened: true,
			children: [
				{ id: "all", type: "link", label: "All Products", href: "/products" },
				{
					id: "categories",
					type: "link",
					label: "Categories",
					href: "/products/categories",
				},
			],
		},
		{
			id: "inventory",
			type: "link",
			label: "Inventory",
			href: "/products/inventory",
		},
		{
			id: "pricing",
			type: "link",
			label: "Pricing",
			href: "/products/pricing",
		},
	],
	"/analytics": [
		{ id: "overview", type: "link", label: "Overview", href: "/analytics" },
		{
			id: "reports",
			type: "link",
			label: "Reports",
			href: "/analytics/reports",
		},
		{
			id: "exports",
			type: "link",
			label: "Exports",
			href: "/analytics/exports",
		},
	],
	"/settings": [
		{ id: "general", type: "link", label: "General", href: "/settings" },
		{ id: "team", type: "link", label: "Team", href: "/settings/team" },
		{
			id: "billing",
			type: "link",
			label: "Billing",
			href: "/settings/billing",
		},
	],
};

/** Horizontal top nav with tabs in the header and a contextual sidebar. */
const meta: Meta = {
	title: "Recipes/HorizontalNav",
	component: NavShell,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;
type Story = StoryObj;

function HorizontalNavDemo() {
	const [currentPath, setCurrentPath] = useState("/products");

	const { activeItem } = useActiveNavItem(topNavItems, {
		currentPath,
		matcher: "prefix",
	});

	const activeSection = activeItem?.href ?? "/";
	const currentSidebarItems = sidebarItems[activeSection] ?? [];

	return (
		<NavShell
			header={
				<NavHeader
					logo={
						<Text fw={700} size="lg">
							<IconBook
								size={20}
								stroke={1.5}
								style={{ verticalAlign: "middle", marginRight: 8 }}
							/>
							Acme Admin
						</Text>
					}
					rightSection={
						<Anchor href="#" size="sm">
							Help
						</Anchor>
					}
				>
					<Tabs
						value={activeSection}
						onChange={(value) => {
							if (value) setCurrentPath(value);
						}}
						variant="default"
					>
						<Tabs.List>
							{topNavItems.map((item) =>
								item.type === "link" && item.href ? (
									<Tabs.Tab
										key={item.id}
										value={item.href}
										leftSection={item.icon}
									>
										{item.label}
									</Tabs.Tab>
								) : null,
							)}
						</Tabs.List>
					</Tabs>
				</NavHeader>
			}
			sidebar={
				currentSidebarItems.length > 0 ? (
					<NavSidebar showCollapseToggle={false}>
						<NavGroup
							items={currentSidebarItems}
							currentPath={currentPath}
							onItemClick={(item) => {
								if (item.href) setCurrentPath(item.href);
							}}
						/>
					</NavSidebar>
				) : undefined
			}
		>
			<Text size="xl" fw={700} mb="md">
				{activeItem?.label ?? "Home"}
			</Text>
			<Text c="dimmed">Current path: {currentPath}</Text>
			<Text c="dimmed" mt="xs">
				The horizontal tabs in the header select the top-level section. The
				sidebar shows contextual navigation for the active section. Both use the
				same NavItemType data and useActiveNavItem hook.
			</Text>
		</NavShell>
	);
}

/** Header tabs for top-level sections, with a contextual sidebar that changes per section. */
export const TabsInHeader: Story = {
	render: () => <HorizontalNavDemo />,
};
