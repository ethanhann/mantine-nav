import { Group, Stack, Text } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import type { Workspace } from "../../src";
import {
	ContextSwitcher,
	NotificationIndicator,
	WorkspaceSwitcher,
} from "../../src";
import { sampleWorkspaces } from "../_data";

/**
 * `ContextSwitcher`, `WorkspaceSwitcher`, and `NotificationIndicator` accept
 * a `loading` prop that renders skeleton rows in their dropdowns while data
 * is being fetched.
 */
const meta: Meta = {
	title: "Customization/LoadingStates",
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

/** Dropdowns stuck in their loading state. Open each to see the skeletons. */
export const Skeletons: Story = {
	render: () => (
		<Stack maw={320} gap="lg">
			<WorkspaceSwitcher
				workspaces={[]}
				activeWorkspace={sampleWorkspaces[0]!}
				onSwitch={() => {}}
				loading
			/>
			<ContextSwitcher
				items={[]}
				active={null}
				onSelect={() => {}}
				loading
				labels={{ placeholder: "Loading contexts..." }}
			/>
			<Group>
				<NotificationIndicator loading />
				<Text size="sm" c="dimmed">
					Bell dropdown shows skeletons while loading
				</Text>
			</Group>
		</Stack>
	),
};

function SimulatedFetchDemo() {
	const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		const timer = setTimeout(() => {
			setWorkspaces(sampleWorkspaces);
			setLoading(false);
		}, 2500);
		return () => clearTimeout(timer);
	}, []);
	return (
		<Stack maw={320}>
			<Text size="sm" c="dimmed">
				Workspaces arrive after 2.5 seconds. Open the dropdown before and after.
			</Text>
			<WorkspaceSwitcher
				workspaces={workspaces}
				activeWorkspace={sampleWorkspaces[0]!}
				onSwitch={() => {}}
				loading={loading}
			/>
		</Stack>
	);
}

/** A simulated fetch resolving into the list after a delay. */
export const SimulatedFetch: Story = {
	render: () => <SimulatedFetchDemo />,
};
