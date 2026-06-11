import { Badge, Button, Text } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	IconBuilding,
	IconUserShield,
	IconUsersGroup,
} from "@tabler/icons-react";
import { useState } from "react";

import { type ContextItem, ContextSwitcher } from "../../src";

interface Persona {
	type: "admin" | "member" | "personal";
	id: string;
}

const personaItems: ContextItem<Persona>[] = [
	{
		id: "admin:acme",
		label: "Admin",
		description: "Acme Corp",
		icon: <IconUserShield size={18} stroke={1.5} />,
		section: "Organization roles",
		data: { type: "admin", id: "acme" },
	},
	{
		id: "member:globex",
		label: "Member",
		description: "Globex",
		icon: <IconUserShield size={18} stroke={1.5} />,
		section: "Organization roles",
		data: { type: "member", id: "globex" },
	},
	{
		id: "personal:self",
		label: "Personal account",
		icon: <IconUsersGroup size={18} stroke={1.5} />,
		section: "Personal",
		data: { type: "personal", id: "self" },
	},
];

const tenantWorkspaces: ContextItem[] = [
	{
		id: "acme",
		label: "Acme Corp",
		icon: <IconBuilding size={18} stroke={1.5} />,
		badge: (
			<Badge size="xs" variant="light">
				3 projects
			</Badge>
		),
	},
	{
		id: "globex",
		label: "Globex",
		icon: <IconBuilding size={18} stroke={1.5} />,
		badge: (
			<Badge size="xs" variant="light">
				1 project
			</Badge>
		),
	},
	{
		id: "initech",
		label: "Initech",
		icon: <IconBuilding size={18} stroke={1.5} />,
		disabled: true,
	},
];

/** Generic dropdown for switching the user's acting context (personas, tenants, workspaces). WorkspaceSwitcher is a preset over this component. */
const meta: Meta<typeof ContextSwitcher> = {
	title: "ContextSwitcher",
	component: ContextSwitcher,
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<div style={{ width: 280, padding: 8 }}>
				<Story />
			</div>
		),
	],
};

export default meta;
type Story = StoryObj<typeof ContextSwitcher>;

/** Persona items with descriptions, grouped into sections. */
export const Default: Story = {
	render: () => {
		const [active, setActive] = useState<string | null>("admin:acme");
		return (
			<ContextSwitcher
				items={personaItems}
				active={active}
				onSelect={(item) => setActive(item.id)}
			/>
		);
	},
};

/**
 * Async selection: `onSelect` returns a promise (simulating a server
 * mutation). The clicked item shows a loader, the rest are disabled, and the
 * menu closes only after the promise resolves. The active item is never
 * updated optimistically.
 */
export const AsyncPending: Story = {
	render: () => {
		const [active, setActive] = useState<string | null>("admin:acme");
		return (
			<ContextSwitcher
				items={personaItems}
				active={active}
				onSelect={(item) =>
					new Promise<void>((resolve) =>
						setTimeout(() => {
							setActive(item.id);
							resolve();
						}, 1500),
					)
				}
			/>
		);
	},
};

/** No context chosen yet — the trigger renders a placeholder prompt. */
export const NullActivePlaceholder: Story = {
	render: () => {
		const [active, setActive] = useState<string | null>(null);
		return (
			<ContextSwitcher
				items={personaItems}
				active={active}
				onSelect={(item) => setActive(item.id)}
				placeholder="Choose a persona"
			/>
		);
	},
};

/** Items grouped under labeled sections, with search across the whole list. */
export const Sections: Story = {
	render: () => {
		const [active, setActive] = useState<string | null>(null);
		return (
			<ContextSwitcher
				items={personaItems}
				active={active}
				onSelect={(item) => setActive(item.id)}
				searchable
				searchPlaceholder="Search personas..."
			/>
		);
	},
};

/** Workspace items carrying badges, plus a disabled item and footer actions. */
export const Badges: Story = {
	render: () => {
		const [active, setActive] = useState<string | null>("acme");
		return (
			<ContextSwitcher
				items={tenantWorkspaces}
				active={active}
				onSelect={(item) => setActive(item.id)}
				actions={[
					{
						id: "manage",
						label: "Manage workspaces",
						onClick: () => console.log("Manage workspaces"),
					},
				]}
			/>
		);
	},
};

/** Custom trigger via `renderTarget` — a subtle button instead of the default block trigger. */
export const CustomTrigger: Story = {
	render: () => {
		const [active, setActive] = useState<string | null>(null);
		return (
			<ContextSwitcher
				items={personaItems}
				active={active}
				onSelect={(item) =>
					new Promise<void>((resolve) =>
						setTimeout(() => {
							setActive(item.id);
							resolve();
						}, 800),
					)
				}
				renderTarget={(activeItem, _opened, { pending }) => (
					<Button variant="subtle" loading={pending}>
						{activeItem ? (
							<>
								{activeItem.label}
								{activeItem.description && (
									<Text span size="xs" c="dimmed" ml={6}>
										{activeItem.description}
									</Text>
								)}
							</>
						) : (
							"Choose context"
						)}
					</Button>
				)}
			/>
		);
	},
};
