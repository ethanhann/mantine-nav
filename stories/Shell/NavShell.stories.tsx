import { Text } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import {
	NavGroup,
	NavHeader,
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

const meta: Meta<typeof NavShell> = {
	title: "Shell/NavShell",
	component: NavShell,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;
type Story = StoryObj<typeof NavShell>;

export const Default: Story = {
	render: () => (
		<NavShell
			header={
				<NavHeader
					logo={
						<Text fw={700} size="lg">
							MyApp
						</Text>
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
					<NavGroup items={sampleItems} currentPath="/" />
				</NavSidebar>
			}
		>
			<Text size="xl" fw={700} mb="md">
				Dashboard
			</Text>
			<Text c="dimmed">
				This is the main content area. The sidebar uses Mantine AppShell with
				NavLink components.
			</Text>
		</NavShell>
	),
};

export const WithoutHeader: Story = {
	render: () => (
		<NavShell
			sidebar={
				<NavSidebar>
					<NavGroup items={sampleItems} currentPath="/" />
				</NavSidebar>
			}
		>
			<Text>Content without a top header bar.</Text>
		</NavShell>
	),
};

export const WithEnvironment: Story = {
	render: () => (
		<NavShell
			header={
				<NavHeader
					logo={<Text fw={700}>MyApp</Text>}
					environment={{ label: "Staging", color: "orange" }}
				/>
			}
			sidebar={
				<NavSidebar>
					<NavGroup items={sampleItems} />
				</NavSidebar>
			}
		>
			<Text>Content with environment indicator in header.</Text>
		</NavShell>
	),
};
