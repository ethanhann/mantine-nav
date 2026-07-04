import { Button, Code, Group, Stack, Text } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { NavGroup, NavHeader, NavShell, NavSidebar } from "../../src";
import { sampleItems } from "../_data";

/**
 * Layout state is uncontrolled by default, and every stateful surface also
 * accepts a controlled prop pair: `desktopCollapsed`/`onDesktopCollapsedChange`
 * on NavShell and `expandedKeys`/`onExpandedChange` on NavGroup. In
 * uncontrolled mode the callbacks still fire with the intended value.
 */
const meta: Meta = {
	title: "Customization/ControlledState",
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;
type Story = StoryObj;

function ControlledCollapseDemo() {
	const [collapsed, setCollapsed] = useState(false);
	return (
		<NavShell
			desktopCollapsed={collapsed}
			onDesktopCollapsedChange={setCollapsed}
			header={<NavHeader logo={<Text fw={700}>MyApp</Text>} />}
			sidebar={
				<NavSidebar showCollapseToggle={false}>
					<NavGroup items={sampleItems} currentPath="/" />
				</NavSidebar>
			}
		>
			<Stack p="md" align="flex-start">
				<Text>Collapse state lives in the page component, not the shell.</Text>
				<Group>
					<Button onClick={() => setCollapsed((c) => !c)}>
						{collapsed ? "Expand" : "Collapse"} sidebar
					</Button>
					<Code>desktopCollapsed: {String(collapsed)}</Code>
				</Group>
			</Stack>
		</NavShell>
	);
}

/** The page owns the collapse state and drives it from its own button. */
export const ControlledCollapse: Story = {
	render: () => <ControlledCollapseDemo />,
};

function ControlledExpansionDemo() {
	const [expanded, setExpanded] = useState<string[]>([]);
	return (
		<NavShell
			header={<NavHeader logo={<Text fw={700}>MyApp</Text>} />}
			sidebar={
				<NavSidebar>
					<NavGroup
						items={sampleItems}
						currentPath="/"
						expandedKeys={expanded}
						onExpandedChange={setExpanded}
					/>
				</NavSidebar>
			}
		>
			<Stack p="md" align="flex-start">
				<Text>Group expansion is controlled from outside the tree.</Text>
				<Group>
					<Button onClick={() => setExpanded(["products", "orders"])}>
						Expand all groups
					</Button>
					<Button variant="default" onClick={() => setExpanded([])}>
						Collapse all
					</Button>
				</Group>
				<Code>expandedKeys: {JSON.stringify(expanded)}</Code>
			</Stack>
		</NavShell>
	);
}

/** Expanded group ids live in page state, enabling expand-all and persistence. */
export const ControlledExpansion: Story = {
	render: () => <ControlledExpansionDemo />,
};
