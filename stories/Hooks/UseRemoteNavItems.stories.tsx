import { CodeHighlight } from "@mantine/code-highlight";
import { Badge, Center, Loader, Text } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react";
import {
	IconChartBar,
	IconClipboardList,
	IconExternalLink,
	IconHome,
	IconMessage,
	IconPackage,
	IconSettings,
	IconUsers,
} from "@tabler/icons-react";
import React, { useEffect, useState } from "react";
import type { NavItemResolvers, RemoteNavItem } from "../../src";
import {
	NavGroup,
	NavHeader,
	NavShell,
	NavSidebar,
	useRemoteNavItems,
} from "../../src";

const meta: Meta = {
	title: "Hooks/useRemoteNavItems",
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"The `useRemoteNavItems` hook hydrates JSON-serializable nav item definitions (e.g. from an API) into fully-typed `NavItemType[]` with React icons, badges, and click handlers via a resolver map.",
			},
		},
	},
};

export default meta;
type Story = StoryObj;

// Simulated API response — this is what comes from the server
const MOCK_API_RESPONSE: RemoteNavItem[] = [
	{
		id: "home",
		type: "link",
		label: "Home",
		href: "/",
		icon: "home",
		weight: -10,
	},
	{ id: "section-commerce", type: "section", label: "Commerce" },
	{
		id: "products",
		type: "group",
		label: "Products",
		icon: "package",
		weight: 10,
		defaultOpened: true,
		children: [
			{
				id: "catalog",
				type: "link",
				label: "Catalog",
				href: "/products/catalog",
			},
			{
				id: "inventory",
				type: "link",
				label: "Inventory",
				href: "/products/inventory",
				badge: "new",
			},
		],
	},
	{
		id: "orders",
		type: "link",
		label: "Orders",
		href: "/orders",
		icon: "orders",
		weight: 20,
	},
	{
		id: "customers",
		type: "link",
		label: "Customers",
		href: "/customers",
		icon: "users",
		weight: 30,
	},
	{ id: "div-1", type: "divider" },
	{ id: "section-insights", type: "section", label: "Insights" },
	{
		id: "analytics",
		type: "link",
		label: "Analytics",
		href: "/analytics",
		icon: "chart",
		weight: 40,
	},
	{ id: "div-2", type: "divider" },
	{
		id: "docs",
		type: "link",
		label: "Documentation",
		href: "https://mantine.dev",
		icon: "external",
		external: true,
	},
	{
		id: "feedback",
		type: "link",
		label: "Send Feedback",
		href: "#",
		icon: "message",
	},
	{
		id: "settings",
		type: "link",
		label: "Settings",
		href: "/settings",
		icon: "settings",
		weight: 100,
	},
];

// Client-side resolver map — maps string keys to React nodes
const resolvers: NavItemResolvers = {
	icons: {
		home: <IconHome size={18} stroke={1.5} />,
		package: <IconPackage size={18} stroke={1.5} />,
		orders: <IconClipboardList size={18} stroke={1.5} />,
		users: <IconUsers size={18} stroke={1.5} />,
		chart: <IconChartBar size={18} stroke={1.5} />,
		settings: <IconSettings size={18} stroke={1.5} />,
		external: <IconExternalLink size={18} stroke={1.5} />,
		message: <IconMessage size={18} stroke={1.5} />,
	},
	badges: {
		new: (
			<Badge size="xs" variant="light" color="teal">
				New
			</Badge>
		),
	},
	onClick: {
		feedback: () => alert("Feedback modal would open here!"),
	},
};

/** Simulate fetching from an API with a delay. */
function useMockApi(delay = 1000) {
	const [data, setData] = useState<RemoteNavItem[] | null>(null);

	useEffect(() => {
		const timer = setTimeout(() => setData(MOCK_API_RESPONSE), delay);
		return () => clearTimeout(timer);
	}, [delay]);

	return data;
}

function RemoteNavDemo() {
	const apiData = useMockApi(1500);
	const { items, isLoading } = useRemoteNavItems({
		items: apiData,
		resolvers,
	});

	const exampleCode = `
// API returns JSON like:
{ "id": "home", "type": "link", "label": "Home", "href": "/", "icon": "home" }

// Client resolvers map strings to React nodes:
resolvers: {
  icons: { home: <IconHome />, settings: <IconSettings /> },
  badges: { new: <Badge>New</Badge> },
  onClick: { feedback: () => openModal() },
}
`;

	return (
		<NavShell
			header={
				<NavHeader
					logo={
						<Text fw={700} size="lg">
							Remote Nav
						</Text>
					}
				/>
			}
			sidebar={
				<NavSidebar>
					{isLoading ? (
						<Center py="xl">
							<Loader size="sm" />
						</Center>
					) : (
						<NavGroup items={items} currentPath="/" />
					)}
				</NavSidebar>
			}
		>
			<Text size="xl" fw={700} mb="md">
				API-Driven Navigation
			</Text>
			<Text c="dimmed" mb="sm">
				The sidebar items are loaded from a simulated API response after a 1.5s
				delay. A resolver map on the client hydrates icon/badge string keys into
				React components.
			</Text>

			<CodeHighlight code={exampleCode} language="typescript" radius="md" />
		</NavShell>
	);
}

/** Navigation items loaded from a mock API, hydrated with a resolver map. Shows a loader during fetch. */
export const ApiDrivenNavigation: Story = {
	render: () => <RemoteNavDemo />,
};

function InstantDataDemo() {
	const { items } = useRemoteNavItems({
		items: MOCK_API_RESPONSE,
		resolvers,
	});

	return (
		<NavShell
			header={
				<NavHeader
					logo={
						<Text fw={700} size="lg">
							Static JSON
						</Text>
					}
				/>
			}
			sidebar={
				<NavSidebar>
					<NavGroup items={items} currentPath="/" />
				</NavSidebar>
			}
		>
			<Text size="xl" fw={700} mb="md">
				Static JSON Data
			</Text>
			<Text c="dimmed">
				Same JSON payload passed synchronously — no loading state. Useful for
				SSR or cached responses.
			</Text>
		</NavShell>
	);
}

/** Same JSON data but provided synchronously (no loading state). */
export const StaticJsonData: Story = {
	render: () => <InstantDataDemo />,
};
