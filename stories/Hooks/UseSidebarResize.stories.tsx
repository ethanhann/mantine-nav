import { Box, Code, Stack, Text } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { NavGroup, useSidebarResize } from "../../src";
import { sampleItems } from "../_data";

/**
 * `useSidebarResize` provides a drag handle for a resizable sidebar: pointer
 * dragging with min/max clamping, keyboard resizing on the focused handle
 * (arrows step 4px, Shift+arrows 20px, Home/End snap to the bounds),
 * double-click reset, and optional localStorage persistence.
 */
const meta: Meta = {
	title: "Hooks/UseSidebarResize",
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;
type Story = StoryObj;

function ResizableSidebarDemo() {
	const { width, isResizing, getHandleProps, resetWidth } = useSidebarResize({
		defaultWidth: 260,
		minWidth: 180,
		maxWidth: 480,
	});
	return (
		<Box style={{ display: "flex", height: "100vh" }}>
			<Box
				w={width}
				p="sm"
				style={{
					position: "relative",
					flexShrink: 0,
					borderRight: "1px solid var(--mantine-color-default-border)",
					background: isResizing
						? "light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))"
						: undefined,
				}}
			>
				<NavGroup items={sampleItems} currentPath="/" />
				<div {...getHandleProps()} />
			</Box>
			<Stack p="md">
				<Text>
					Drag the right edge of the sidebar, or focus it and use the arrow
					keys. Double-click the handle to reset.
				</Text>
				<Code>width: {width}px</Code>
				<Text
					size="sm"
					c="dimmed"
					onClick={resetWidth}
					style={{ cursor: "pointer" }}
				>
					Reset width
				</Text>
			</Stack>
		</Box>
	);
}

/** Drag, keyboard, and double-click reset on a live sidebar. */
export const DragToResize: Story = {
	render: () => <ResizableSidebarDemo />,
};
