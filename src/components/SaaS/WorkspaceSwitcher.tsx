"use client";

import {
	Avatar,
	Group,
	Menu,
	ScrollArea,
	Text,
	TextInput,
	UnstyledButton,
} from "@mantine/core";
import {
	IconCheck,
	IconPlus,
	IconSearch,
	IconSelector,
} from "@tabler/icons-react";
import { type ReactNode, useState } from "react";
import type { Workspace } from "../../types";

/** Props for the workspace switcher dropdown. */
export interface WorkspaceSwitcherProps {
	workspaces: Workspace[];
	activeWorkspace: Workspace;
	onSwitch: (workspace: Workspace) => void;
	onCreate?: () => void;
	searchable?: boolean;
	maxVisible?: number;
	renderWorkspace?: (workspace: Workspace, isActive: boolean) => ReactNode;
}

/**
 * Dropdown menu for switching between workspaces/organizations.
 *
 * Renders the active workspace with an avatar and name, with a dropdown
 * showing all available workspaces. Supports optional search filtering.
 *
 * @example
 * ```tsx
 * <WorkspaceSwitcher
 *   workspaces={workspaces}
 *   activeWorkspace={current}
 *   onSwitch={(ws) => setWorkspace(ws)}
 *   searchable
 * />
 * ```
 */
export function WorkspaceSwitcher({
	workspaces,
	activeWorkspace,
	onSwitch,
	onCreate,
	searchable = false,
	maxVisible = 5,
	renderWorkspace,
}: WorkspaceSwitcherProps) {
	const [search, setSearch] = useState("");

	const filtered =
		searchable && search
			? workspaces.filter((w) =>
					w.name.toLowerCase().includes(search.toLowerCase()),
				)
			: workspaces;

	return (
		<Menu width={280} position="bottom-start" withinPortal>
			<Menu.Target>
				<UnstyledButton
					p="xs"
					w="100%"
					aria-label={`Switch workspace, current: ${activeWorkspace.name}`}
					style={{ borderRadius: "var(--mantine-radius-sm)" }}
				>
					{renderWorkspace ? (
						renderWorkspace(activeWorkspace, true)
					) : (
						<Group gap="sm" wrap="nowrap">
							<Avatar
								src={
									typeof activeWorkspace.logo === "string"
										? activeWorkspace.logo
										: undefined
								}
								size="sm"
								radius="sm"
								color="blue"
							>
								{activeWorkspace.name.charAt(0).toUpperCase()}
							</Avatar>
							<Text size="sm" fw={600} truncate flex={1}>
								{activeWorkspace.name}
							</Text>
							<IconSelector
								size={14}
								stroke={1.5}
								opacity={0.5}
								aria-hidden="true"
							/>
						</Group>
					)}
				</UnstyledButton>
			</Menu.Target>

			<Menu.Dropdown>
				{searchable && (
					<TextInput
						placeholder="Search workspaces..."
						aria-label="Search workspaces"
						leftSection={<IconSearch size={14} stroke={1.5} />}
						value={search}
						onChange={(e) => setSearch(e.currentTarget.value)}
						mb="xs"
						mx="xs"
						mt="xs"
					/>
				)}
				<ScrollArea.Autosize mah={maxVisible * 44}>
					{filtered.length === 0 && searchable && search && (
						<Text c="dimmed" ta="center" py="md" size="sm">
							No workspaces found
						</Text>
					)}
					{filtered.map((ws) => (
						<Menu.Item
							key={ws.id}
							leftSection={
								<Avatar
									src={typeof ws.logo === "string" ? ws.logo : undefined}
									size="sm"
									radius="sm"
									color="blue"
								>
									{ws.name.charAt(0).toUpperCase()}
								</Avatar>
							}
							rightSection={
								ws.id === activeWorkspace.id ? (
									<IconCheck size={14} stroke={1.5} aria-hidden="true" />
								) : null
							}
							aria-current={ws.id === activeWorkspace.id ? true : undefined}
							onClick={() => onSwitch(ws)}
						>
							<Text size="sm">{ws.name}</Text>
						</Menu.Item>
					))}
				</ScrollArea.Autosize>
				{onCreate && (
					<>
						<Menu.Divider />
						<Menu.Item
							leftSection={<IconPlus size={14} stroke={1.5} />}
							onClick={onCreate}
						>
							Create workspace
						</Menu.Item>
					</>
				)}
			</Menu.Dropdown>
		</Menu>
	);
}
