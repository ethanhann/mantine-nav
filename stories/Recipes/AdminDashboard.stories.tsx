import {
	Badge,
	Button,
	Card,
	Group,
	Kbd,
	SimpleGrid,
	Text,
	Title,
} from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	IconChartBar,
	IconDatabase,
	IconFileText,
	IconHistory,
	IconHome,
	IconSearch,
	IconServer,
	IconSettings,
	IconShield,
	IconTool,
	IconUserPlus,
	IconUsers,
} from "@tabler/icons-react";

import type { CommandPaletteProps, NavItemType } from "../../src";
import {
	CommandPalette,
	NavGroup,
	NavHeader,
	NavShell,
	NavSidebar,
	NotificationIndicator,
	PlanBadge,
	UserMenu,
	useCommandPalette,
	WorkspaceSwitcher,
} from "../../src";
import {
	sampleNotifications,
	sampleUser,
	sampleUserMenuItems,
	sampleWorkspaces,
} from "../_data";

const adminItems: NavItemType[] = [
	{
		id: "dashboard",
		type: "link",
		label: "Dashboard",
		href: "/admin",
		icon: <IconHome size={18} stroke={1.5} />,
	},
	{ id: "section-manage", type: "section", label: "Manage" },
	{
		id: "users",
		type: "link",
		label: "Users",
		href: "/admin/users",
		icon: <IconUsers size={18} stroke={1.5} />,
		badge: (
			<Badge size="xs" variant="light">
				248
			</Badge>
		),
	},
	{
		id: "content",
		type: "group",
		label: "Content",
		icon: <IconFileText size={18} stroke={1.5} />,
		defaultOpened: true,
		children: [
			{
				id: "pages",
				type: "link",
				label: "Pages",
				href: "/admin/content/pages",
			},
			{
				id: "media",
				type: "link",
				label: "Media",
				href: "/admin/content/media",
			},
		],
	},
	{
		id: "analytics",
		type: "link",
		label: "Analytics",
		href: "/admin/analytics",
		icon: <IconChartBar size={18} stroke={1.5} />,
	},
	{ id: "div-1", type: "divider" },
	{ id: "section-system", type: "section", label: "System" },
	{
		id: "security",
		type: "link",
		label: "Security",
		href: "/admin/security",
		icon: <IconShield size={18} stroke={1.5} />,
	},
	{
		id: "database",
		type: "link",
		label: "Database",
		href: "/admin/database",
		icon: <IconDatabase size={18} stroke={1.5} />,
	},
	{
		id: "infrastructure",
		type: "link",
		label: "Infrastructure",
		href: "/admin/infra",
		icon: <IconServer size={18} stroke={1.5} />,
	},
	{
		id: "settings",
		type: "link",
		label: "Settings",
		href: "/admin/settings",
		icon: <IconSettings size={18} stroke={1.5} />,
	},
];

// Non-navigation commands surfaced in the palette alongside the admin nav.
const adminActions: CommandPaletteProps["actions"] = [
	{
		id: "invite-user",
		label: "Invite user",
		description: "Send a workspace invitation",
		icon: <IconUserPlus size={18} stroke={1.5} />,
		keywords: ["add", "member", "team"],
		onSelect: () => console.log("invite user"),
	},
	{
		id: "audit-log",
		label: "View audit log",
		icon: <IconHistory size={18} stroke={1.5} />,
		keywords: ["history", "activity"],
		onSelect: () => console.log("audit log"),
	},
	{
		id: "maintenance",
		label: "Toggle maintenance mode",
		icon: <IconTool size={18} stroke={1.5} />,
		onSelect: () => console.log("maintenance mode"),
	},
];

/** Full admin dashboard layout combining NavShell, WorkspaceSwitcher, UserMenu, PlanBadge, NotificationIndicator, and a ⌘K command palette. */
const meta: Meta = {
	title: "Recipes/AdminDashboard",
	component: NavShell,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;
type Story = StoryObj;

/** A header search trigger that opens the shared command palette. */
function PaletteTrigger() {
	const { open } = useCommandPalette();
	return (
		<Button
			variant="default"
			size="xs"
			color="gray"
			leftSection={<IconSearch size={14} />}
			rightSection={<Kbd>⌘K</Kbd>}
			onClick={open}
		>
			Search…
		</Button>
	);
}

/** The dashboard shell, wired with a command palette over the admin nav + actions. */
function AdminDashboard() {
	return (
		<NavShell
			header={
				<NavHeader
					logo={
						<Text fw={700} size="lg">
							Admin Panel
						</Text>
					}
					environment={{ label: "Production", color: "green" }}
					rightSection={
						<Group gap="xs">
							<PaletteTrigger />
							<PlanBadge plan="Enterprise" color="teal" />
							<NotificationIndicator
								count={3}
								notifications={sampleNotifications}
							/>
						</Group>
					}
				/>
			}
			sidebar={
				<NavSidebar
					header={
						<WorkspaceSwitcher
							workspaces={sampleWorkspaces}
							activeWorkspace={sampleWorkspaces[0]!}
							onSwitch={() => {}}
							searchable
						/>
					}
					footer={
						<UserMenu
							user={sampleUser}
							menuItems={sampleUserMenuItems}
							showEmail
						/>
					}
				>
					<NavGroup items={adminItems} currentPath="/admin" />
				</NavSidebar>
			}
		>
			<Title order={2} mb="md">
				Dashboard
			</Title>
			<SimpleGrid cols={3} mb="xl">
				<Card shadow="sm" padding="lg" radius="md" withBorder>
					<Text fw={500}>Total Users</Text>
					<Text size="xl" fw={700}>
						1,248
					</Text>
				</Card>
				<Card shadow="sm" padding="lg" radius="md" withBorder>
					<Text fw={500}>Active Sessions</Text>
					<Text size="xl" fw={700}>
						342
					</Text>
				</Card>
				<Card shadow="sm" padding="lg" radius="md" withBorder>
					<Text fw={500}>API Requests</Text>
					<Text size="xl" fw={700}>
						12.4k
					</Text>
				</Card>
			</SimpleGrid>

			<CommandPalette
				items={adminItems}
				actions={adminActions}
				onNavigate={(command) => console.log("navigate:", command.href)}
			/>
		</NavShell>
	);
}

/** Enterprise admin panel with workspace switching, notifications, sectioned navigation, and a ⌘K command palette (click "Search…" in the header or press ⌘K). */
export const Default: Story = {
	render: () => <AdminDashboard />,
};
