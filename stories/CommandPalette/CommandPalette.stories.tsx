import { Button, Code, Stack, Text } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	IconLogout,
	IconMoon,
	IconSearch,
	IconUserCog,
} from "@tabler/icons-react";
import {
	CommandPalette,
	type CommandPaletteProps,
	useCommandPalette,
} from "../../src";
import { sampleItems } from "../_data";

/**
 * A command palette (⌘K) built on `@mantine/spotlight`. It auto-flattens the
 * nav-item tree into searchable destinations, accepts extra non-nav `actions`,
 * ranks results with a lightweight fuzzy matcher, and surfaces Recently Viewed
 * and Starred sections when the search box is empty.
 *
 * Press **⌘K** (or **Ctrl+K**) or click the button to open it.
 *
 * > Consumers must import the Spotlight stylesheet once in their app:
 * > `import "@mantine/spotlight/styles.css";`
 */
const meta: Meta<typeof CommandPalette> = {
	title: "Navigation/CommandPalette",
	component: CommandPalette,
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CommandPalette>;

function Demo(props: CommandPaletteProps) {
	const { open } = useCommandPalette();
	return (
		<Stack align="center" gap="md" py="xl">
			<Text size="sm" c="dimmed">
				Press <Code>⌘K</Code> / <Code>Ctrl+K</Code> or click below
			</Text>
			<Button leftSection={<IconSearch size={16} />} onClick={open}>
				Open command palette
			</Button>
			<CommandPalette {...props} />
		</Stack>
	);
}

const actions: CommandPaletteProps["actions"] = [
	{
		id: "toggle-theme",
		label: "Toggle color scheme",
		description: "Switch between light and dark mode",
		keywords: ["dark", "light", "theme"],
		icon: <IconMoon size={18} />,
		onSelect: () => console.log("toggle theme"),
	},
	{
		id: "account",
		label: "Account settings",
		icon: <IconUserCog size={18} />,
		onSelect: () => console.log("account"),
	},
	{
		id: "logout",
		label: "Log out",
		icon: <IconLogout size={18} />,
		onSelect: () => console.log("logout"),
	},
];

/** Nav items + custom actions, with fuzzy search and quick-access sections. */
export const Default: Story = {
	render: (args) => <Demo {...args} />,
	args: {
		items: sampleItems,
		actions,
		onNavigate: (command) => console.log("navigate:", command.href),
	},
};

/** Only the nav-item tree, no custom actions. */
export const NavItemsOnly: Story = {
	render: (args) => <Demo {...args} />,
	args: {
		items: sampleItems,
		onNavigate: (command) => console.log("navigate:", command.href),
	},
};

/** Custom actions only — no nav items. Useful as a pure "command runner". */
export const ActionsOnly: Story = {
	render: (args) => <Demo {...args} />,
	args: {
		actions,
		showRecent: false,
		showStarred: false,
	},
};

/** Recently Viewed / Starred sections disabled — a flat command list. */
export const WithoutQuickAccess: Story = {
	render: (args) => <Demo {...args} />,
	args: {
		items: sampleItems,
		actions,
		showRecent: false,
		showStarred: false,
		onNavigate: (command) => console.log("navigate:", command.href),
	},
};
