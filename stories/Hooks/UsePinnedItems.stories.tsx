import { ActionIcon, Divider, Group, Stack, Text } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconPin, IconPinFilled } from "@tabler/icons-react";
import type { NavItemType } from "../../src";
import { NavGroup, usePinnedItems } from "../../src";
import { sampleItems } from "../_data";

/**
 * `usePinnedItems` manages a capped, ordered list of favorite items drawn
 * from the nav tree. Pass a `storageKey` to persist pins across reloads.
 * A common composition renders the pinned list above the main tree.
 */
const meta: Meta = {
	title: "Hooks/UsePinnedItems",
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

function PinnedNavDemo() {
	const { pinnedItems, isPinned, togglePin, canPin } = usePinnedItems(
		sampleItems,
		{ maxItems: 3 },
	);

	const renderRow = (item: NavItemType) => (
		<Group key={item.id} justify="space-between" wrap="nowrap">
			<Text size="sm">{item.type === "link" ? item.label : item.id}</Text>
			<ActionIcon
				variant="subtle"
				color="gray"
				size="sm"
				aria-label={isPinned(item.id) ? `Unpin ${item.id}` : `Pin ${item.id}`}
				disabled={!isPinned(item.id) && !canPin}
				onClick={() => togglePin(item)}
			>
				{isPinned(item.id) ? (
					<IconPinFilled size={14} />
				) : (
					<IconPin size={14} />
				)}
			</ActionIcon>
		</Group>
	);

	const pinnableLinks = sampleItems.filter((item) => item.type === "link");

	return (
		<Stack maw={320}>
			<Text size="xs" fw={700} tt="uppercase" c="dimmed">
				Pinned ({pinnedItems.length} of 3)
			</Text>
			{pinnedItems.length === 0 ? (
				<Text size="sm" c="dimmed">
					Nothing pinned yet
				</Text>
			) : (
				<NavGroup items={pinnedItems} aria-label="Pinned" />
			)}
			<Divider />
			<Text size="xs" fw={700} tt="uppercase" c="dimmed">
				Pin up to three links
			</Text>
			{pinnableLinks.map(renderRow)}
		</Stack>
	);
}

/** Pin and unpin links, capped at three, rendered as a nav section. */
export const PinFavorites: Story = {
	render: () => <PinnedNavDemo />,
};
