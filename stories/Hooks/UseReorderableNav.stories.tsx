import { Code, Group, Paper, Stack, Text } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconGripVertical } from "@tabler/icons-react";
import { useState } from "react";
import type { NavItemType } from "../../src";
import { useReorderableNav } from "../../src";

/**
 * `useReorderableNav` adds HTML5 drag-and-drop reordering to a flat item
 * list. It returns the ordered items plus prop getters for drag handles and
 * drop targets, and reports every completed reorder through `onReorder`.
 */
const meta: Meta = {
	title: "Hooks/UseReorderableNav",
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

const initialItems: NavItemType[] = [
	{ id: "dashboard", type: "link", label: "Dashboard", href: "/" },
	{ id: "reports", type: "link", label: "Reports", href: "/reports" },
	{ id: "campaigns", type: "link", label: "Campaigns", href: "/campaigns" },
	{ id: "audiences", type: "link", label: "Audiences", href: "/audiences" },
	{ id: "settings", type: "link", label: "Settings", href: "/settings" },
];

function ReorderDemo() {
	const [lastReorder, setLastReorder] = useState("none yet");
	const { orderedItems, draggedId, getDragHandleProps, getDropTargetProps } =
		useReorderableNav({
			items: initialItems,
			onReorder: (_items, from, to) => setLastReorder(`${from} to ${to}`),
		});
	return (
		<Stack maw={360}>
			{orderedItems.map((item) => (
				<Paper
					key={item.id}
					withBorder
					p="xs"
					{...getDropTargetProps(item.id)}
					style={{
						opacity: draggedId === item.id ? 0.4 : 1,
						outline:
							getDropTargetProps(item.id)["data-drop-target"] === true
								? "2px solid var(--mantine-primary-color-filled)"
								: undefined,
					}}
				>
					<Group gap="xs" {...getDragHandleProps(item.id)}>
						<IconGripVertical
							size={16}
							stroke={1.5}
							style={{ cursor: "grab" }}
						/>
						<Text size="sm">{item.type === "link" ? item.label : item.id}</Text>
					</Group>
				</Paper>
			))}
			<Code>last reorder: {lastReorder}</Code>
		</Stack>
	);
}

/** Drag rows by their grip to reorder. The hovered drop target is outlined. */
export const DragAndDrop: Story = {
	render: () => <ReorderDemo />,
};
