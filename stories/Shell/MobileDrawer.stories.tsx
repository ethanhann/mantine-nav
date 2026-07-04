import { Text } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { NavGroup, NavHeader, NavShell, NavSidebar } from "../../src";
import { sampleItems } from "../_data";

/**
 * Below `sidebarBreakpoint` the sidebar becomes a drawer: the header shows a
 * burger, opening moves focus into the drawer and traps Tab inside, a
 * backdrop click or Escape closes it, and focus returns to the burger.
 */
const meta: Meta<typeof NavShell> = {
	title: "Shell/MobileDrawer",
	component: NavShell,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;
type Story = StoryObj<typeof NavShell>;

/** Rendered in a phone viewport. Tap the burger to open the drawer. */
export const Mobile: Story = {
	globals: {
		viewport: { value: "mobile1", isRotated: false },
	},
	render: () => (
		<NavShell
			header={<NavHeader logo={<Text fw={700}>MyApp</Text>} />}
			sidebar={
				<NavSidebar>
					<NavGroup items={sampleItems} currentPath="/" />
				</NavSidebar>
			}
		>
			<Text p="md">
				Open the navigation with the burger. Escape or a backdrop tap closes it
				and returns focus.
			</Text>
		</NavShell>
	),
};

/** The same shell in a tablet viewport, still above the drawer breakpoint. */
export const Tablet: Story = {
	globals: {
		viewport: { value: "tablet", isRotated: false },
	},
	render: () => (
		<NavShell
			header={<NavHeader logo={<Text fw={700}>MyApp</Text>} />}
			sidebar={
				<NavSidebar>
					<NavGroup items={sampleItems} currentPath="/" />
				</NavSidebar>
			}
		>
			<Text p="md">Tablet width keeps the persistent sidebar.</Text>
		</NavShell>
	),
};
