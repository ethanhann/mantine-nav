import type { Meta, StoryObj } from "@storybook/react-vite";

import { WorkspaceSwitcher } from "../../src";
import { sampleWorkspaces } from "../_data";

/** Dropdown for switching between workspaces/organizations with optional search and create. */
const meta: Meta<typeof WorkspaceSwitcher> = {
	title: "SaaS/WorkspaceSwitcher",
	component: WorkspaceSwitcher,
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<div style={{ width: 260, padding: 8 }}>
				<Story />
			</div>
		),
	],
};

export default meta;
type Story = StoryObj<typeof WorkspaceSwitcher>;

/** Basic workspace list. */
export const Default: Story = {
	args: {
		workspaces: sampleWorkspaces,
		activeWorkspace: sampleWorkspaces[0],
		onSwitch: (ws) => console.log("Switch to:", ws.name),
	},
};

/** Filterable workspace list. */
export const WithSearch: Story = {
	args: {
		workspaces: sampleWorkspaces,
		activeWorkspace: sampleWorkspaces[0],
		onSwitch: (ws) => console.log("Switch to:", ws.name),
		searchable: true,
	},
};

/** Search enabled plus a "Create workspace" action. */
export const WithCreate: Story = {
	args: {
		workspaces: sampleWorkspaces,
		activeWorkspace: sampleWorkspaces[0],
		onSwitch: (ws) => console.log("Switch to:", ws.name),
		onCreate: () => console.log("Create workspace"),
		searchable: true,
	},
};
