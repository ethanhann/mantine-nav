import { Text } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
	NavGroup,
	NavShell,
	NavSidebar,
	UserMenu,
	WorkspaceSwitcher,
} from "../../src";
import {
	sampleItems,
	sampleUser,
	sampleUserMenuItems,
	sampleWorkspaces,
} from "../_data";

/**
 * Sidebar content with optional header, scrollable body, and footer sections.
 * Header and footer animate closed when the sidebar collapses to the icon
 * rail on desktop. The collapse toggle integrates with `NavShell` state.
 */
const meta: Meta<typeof NavSidebar> = {
	title: "Shell/NavSidebar",
	component: NavSidebar,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;
type Story = StoryObj<typeof NavSidebar>;

function shellWith(sidebar: React.ReactElement) {
	return (
		<NavShell sidebar={sidebar}>
			<Text p="md">Collapse the sidebar to watch the sections animate.</Text>
		</NavShell>
	);
}

/** Header and footer sections around a scrollable nav body, toggle in the footer (default). */
export const Default: Story = {
	render: () =>
		shellWith(
			<NavSidebar
				header={
					<WorkspaceSwitcher
						workspaces={sampleWorkspaces}
						activeWorkspace={sampleWorkspaces[0]!}
						onSwitch={() => {}}
					/>
				}
				footer={<UserMenu user={sampleUser} menuItems={sampleUserMenuItems} />}
			>
				<NavGroup items={sampleItems} currentPath="/" />
			</NavSidebar>,
		),
};

/** Collapse toggle placed in the header section instead of the footer. */
export const ToggleInHeader: Story = {
	render: () =>
		shellWith(
			<NavSidebar
				collapseTogglePosition="header"
				header={
					<WorkspaceSwitcher
						workspaces={sampleWorkspaces}
						activeWorkspace={sampleWorkspaces[0]!}
						onSwitch={() => {}}
					/>
				}
			>
				<NavGroup items={sampleItems} currentPath="/" />
			</NavSidebar>,
		),
};

/** No collapse toggle. Collapse is driven elsewhere, e.g. a header button via `useNavShell()`. */
export const WithoutToggle: Story = {
	render: () =>
		shellWith(
			<NavSidebar showCollapseToggle={false}>
				<NavGroup items={sampleItems} currentPath="/" />
			</NavSidebar>,
		),
};

/** Localized toggle labels via the `labels` prop. */
export const LocalizedLabels: Story = {
	render: () =>
		shellWith(
			<NavSidebar
				labels={{
					collapseSidebar: "Seitenleiste einklappen",
					expandSidebar: "Seitenleiste ausklappen",
				}}
			>
				<NavGroup items={sampleItems} currentPath="/" />
			</NavSidebar>,
		),
};
