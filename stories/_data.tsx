import {
	IconChartBar,
	IconClipboardList,
	IconFileText,
	IconFolder,
	IconHome,
	IconLogout,
	IconPackage,
	IconSettings,
	IconUser,
	IconUsers,
} from "@tabler/icons-react";
import type { NavItemType, UserInfo, Workspace } from "../src";

export const sampleItems: NavItemType[] = [
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
		defaultOpened: true,
		children: [
			{ id: "catalog", type: "link", label: "Catalog", href: "/products" },
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
	},
	{
		id: "orders",
		type: "group",
		label: "Orders",
		icon: <IconClipboardList size={18} stroke={1.5} />,
		children: [
			{ id: "all-orders", type: "link", label: "All Orders", href: "/orders" },
			{ id: "drafts", type: "link", label: "Drafts", href: "/orders/drafts" },
			{
				id: "returns",
				type: "link",
				label: "Returns",
				href: "/orders/returns",
			},
		],
	},
	{ id: "div-1", type: "divider" },
	{
		id: "customers",
		type: "link",
		label: "Customers",
		href: "/customers",
		icon: <IconUsers size={18} stroke={1.5} />,
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

export const deepNestedItems: NavItemType[] = [
	{
		id: "docs",
		type: "group",
		label: "Documentation",
		icon: <IconFileText size={18} stroke={1.5} />,
		defaultOpened: true,
		children: [
			{
				id: "getting-started",
				type: "group",
				label: "Getting Started",
				defaultOpened: true,
				children: [
					{
						id: "install",
						type: "link",
						label: "Installation",
						href: "/docs/install",
					},
					{
						id: "quickstart",
						type: "link",
						label: "Quick Start",
						href: "/docs/quickstart",
					},
				],
			},
			{
				id: "guides",
				type: "group",
				label: "Guides",
				children: [
					{
						id: "routing",
						type: "link",
						label: "Routing",
						href: "/docs/routing",
					},
					{
						id: "theming",
						type: "link",
						label: "Theming",
						href: "/docs/theming",
					},
				],
			},
		],
	},
];

export const sectionedItems: NavItemType[] = [
	{ id: "section-main", type: "section", label: "Main" },
	{
		id: "home",
		type: "link",
		label: "Home",
		href: "/",
		icon: <IconHome size={18} stroke={1.5} />,
	},
	{
		id: "analytics",
		type: "link",
		label: "Analytics",
		href: "/analytics",
		icon: <IconChartBar size={18} stroke={1.5} />,
	},
	{ id: "section-commerce", type: "section", label: "Commerce" },
	{
		id: "products",
		type: "link",
		label: "Products",
		href: "/products",
		icon: <IconPackage size={18} stroke={1.5} />,
	},
	{
		id: "orders",
		type: "link",
		label: "Orders",
		href: "/orders",
		icon: <IconClipboardList size={18} stroke={1.5} />,
	},
	{
		id: "customers",
		type: "link",
		label: "Customers",
		href: "/customers",
		icon: <IconUsers size={18} stroke={1.5} />,
	},
	{ id: "div-1", type: "divider" },
	{ id: "section-system", type: "section", label: "System" },
	{
		id: "settings",
		type: "link",
		label: "Settings",
		href: "/settings",
		icon: <IconSettings size={18} stroke={1.5} />,
	},
];

export const sampleWorkspaces: Workspace[] = [
	{ id: "ws-1", name: "Acme Corp" },
	{ id: "ws-2", name: "Globex Inc" },
	{ id: "ws-3", name: "Initech" },
	{ id: "ws-4", name: "Umbrella Corp" },
];

export const sampleUser: UserInfo = {
	id: "user-1",
	name: "Jane Cooper",
	email: "jane@acme.com",
	role: "Admin",
};

export const sampleUserMenuItems = [
	{ label: "Profile", icon: <IconUser size={14} stroke={1.5} /> },
	{ label: "Settings", icon: <IconSettings size={14} stroke={1.5} /> },
	{
		label: "Sign out",
		icon: <IconLogout size={14} stroke={1.5} />,
		color: "red" as const,
		dividerBefore: true,
	},
];

export const sampleNotifications = [
	{
		id: "1",
		title: "New deployment",
		description: "Production deploy succeeded",
		read: false,
	},
	{
		id: "2",
		title: "Team invite",
		description: "Bob invited you to Project X",
		read: false,
	},
	{
		id: "3",
		title: "Update available",
		description: "Version 2.1 is ready",
		read: true,
	},
];

export const ultraDeepItems: NavItemType[] = [
	{
		id: "platform",
		type: "group",
		label: "Platform",
		icon: <IconFolder size={18} stroke={1.5} />,
		defaultOpened: true,
		children: [
			{
				id: "infrastructure",
				type: "group",
				label: "Infrastructure",
				defaultOpened: true,
				children: [
					{
						id: "compute",
						type: "group",
						label: "Compute",
						children: [
							{
								id: "instances",
								type: "group",
								label: "Instances",
								children: [
									{
										id: "instance-list",
										type: "link",
										label: "Instance List",
										href: "/platform/infra/compute/instances/list",
										icon: <IconPackage size={16} />,
									},
									{
										id: "instance-monitoring",
										type: "link",
										label: "Monitoring",
										href: "/platform/infra/compute/instances/monitoring",
										icon: <IconChartBar size={16} />,
									},
									{
										id: "instance-logs",
										type: "link",
										label: "Logs",
										href: "/platform/infra/compute/instances/logs",
										badge: "Live",
									},
								],
							},
							{
								id: "serverless",
								type: "link",
								label: "Serverless Functions",
								href: "/platform/infra/compute/serverless",
							},
						],
					},
					{
						id: "storage",
						type: "group",
						label: "Storage",
						children: [
							{
								id: "blobs",
								type: "link",
								label: "Blob Storage",
								href: "/platform/infra/storage/blobs",
							},
							{
								id: "databases",
								type: "link",
								label: "Databases",
								href: "/platform/infra/storage/databases",
							},
						],
					},
					{ id: "infra-divider", type: "divider" },
					{
						id: "networking",
						type: "link",
						label: "Networking",
						href: "/platform/infra/networking",
					},
				],
			},
			{
				id: "services",
				type: "group",
				label: "Services",
				children: [
					{
						id: "api-gateway",
						type: "link",
						label: "API Gateway",
						href: "/platform/services/api-gateway",
					},
					{
						id: "message-queue",
						type: "link",
						label: "Message Queue",
						href: "/platform/services/message-queue",
					},
				],
			},
		],
	},
	{ id: "platform-section", type: "section", label: "Administration" },
	{
		id: "billing",
		type: "link",
		label: "Billing & Usage",
		href: "/platform/billing",
		icon: <IconChartBar size={18} />,
	},
	{
		id: "team-settings",
		type: "link",
		label: "Team Settings",
		href: "/platform/team",
		icon: <IconUsers size={18} />,
	},
];
