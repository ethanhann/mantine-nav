import type { Meta, StoryObj } from "@storybook/react-vite";

import { PlanBadge } from "../../src";

/** Displays the current subscription plan with an optional upgrade button. */
const meta: Meta<typeof PlanBadge> = {
	title: "SaaS/PlanBadge",
	component: PlanBadge,
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PlanBadge>;

/** Simple plan label. */
export const Default: Story = {
	args: {
		plan: "Pro",
		color: "violet",
	},
};

/** Free tier with an upgrade call-to-action. */
export const WithUpgrade: Story = {
	args: {
		plan: "Free",
		color: "gray",
		showUpgrade: true,
		onUpgrade: () => console.log("Upgrade clicked"),
	},
};

/** All Mantine badge variants side-by-side. */
export const Variants: Story = {
	render: () => (
		<div style={{ display: "flex", gap: 16, alignItems: "center" }}>
			<PlanBadge plan="Free" color="gray" variant="light" />
			<PlanBadge plan="Pro" color="violet" variant="filled" />
			<PlanBadge plan="Team" color="blue" variant="outline" />
			<PlanBadge plan="Enterprise" color="teal" variant="dot" />
		</div>
	),
};
