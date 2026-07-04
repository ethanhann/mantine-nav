import { Box, Group, Text, TextInput } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconSearch } from "@tabler/icons-react";

import {
	ColorModePicker,
	NavHeader,
	NotificationIndicator,
	UserMenu,
} from "../../src";
import { sampleNotifications, sampleUser, sampleUserMenuItems } from "../_data";

/**
 * Header bar with a logo slot, optional centered content, right-aligned
 * actions, and an environment badge. Renders inside `AppShell.Header` when
 * composed with `NavShell`, and stands alone in any 60px-high container.
 */
const meta: Meta<typeof NavHeader> = {
	title: "Shell/NavHeader",
	component: NavHeader,
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<Box
				h={60}
				px="md"
				style={{
					border: "1px solid var(--mantine-color-default-border)",
					borderRadius: "var(--mantine-radius-sm)",
				}}
			>
				<Story />
			</Box>
		),
	],
};

export default meta;
type Story = StoryObj<typeof NavHeader>;

/** Logo only. */
export const Default: Story = {
	render: () => (
		<NavHeader
			logo={
				<Text fw={700} size="lg">
					MyApp
				</Text>
			}
		/>
	),
};

/** Colored environment badge next to the logo for staging or production indicators. */
export const EnvironmentBadge: Story = {
	render: () => (
		<NavHeader
			logo={<Text fw={700}>MyApp</Text>}
			environment={{ label: "Staging", color: "orange" }}
		/>
	),
};

/** Children render centered between the logo and the right section. */
export const CenterContent: Story = {
	render: () => (
		<NavHeader logo={<Text fw={700}>MyApp</Text>}>
			<TextInput
				placeholder="Search"
				leftSection={<IconSearch size={14} />}
				w={280}
				size="xs"
			/>
		</NavHeader>
	),
};

/** Right section holding the typical SaaS action cluster. */
export const RightSection: Story = {
	render: () => (
		<NavHeader
			logo={<Text fw={700}>MyApp</Text>}
			rightSection={
				<Group gap="xs" wrap="nowrap">
					<NotificationIndicator notifications={sampleNotifications} />
					<ColorModePicker />
					<UserMenu
						user={sampleUser}
						menuItems={sampleUserMenuItems}
						variant="compact"
					/>
				</Group>
			}
		/>
	),
};
