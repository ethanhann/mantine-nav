import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { PlanBadge } from "../../src";

const meta: Meta<typeof PlanBadge> = {
	title: "SaaS/PlanBadge",
	component: PlanBadge,
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PlanBadge>;

export const Default: Story = {
	args: {
		plan: "Pro",
		color: "violet",
	},
};

export const WithUpgrade: Story = {
	args: {
		plan: "Free",
		color: "gray",
		showUpgrade: true,
		onUpgrade: () => console.log("Upgrade clicked"),
	},
};

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
