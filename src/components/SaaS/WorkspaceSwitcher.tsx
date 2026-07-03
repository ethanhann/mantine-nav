"use client";

import { Avatar, UnstyledButton } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import type { ReactElement, ReactNode } from "react";
import type { Workspace } from "../../types";
import {
	type ContextItem,
	ContextSwitcher,
} from "../ContextSwitcher/ContextSwitcher";

/** Props for the workspace switcher dropdown. */
export interface WorkspaceSwitcherProps {
	workspaces: Workspace[];
	activeWorkspace: Workspace;
	/** Returning a promise enables ContextSwitcher's built-in pending state. */
	onSwitch: (workspace: Workspace) => void | Promise<void>;
	onCreate?: () => void;
	searchable?: boolean;
	maxVisible?: number;
	/** Custom renderer used for the trigger and each dropdown row. */
	renderWorkspace?: (workspace: Workspace, isActive: boolean) => ReactNode;
	/** Shows skeleton rows while the workspace list is being fetched. */
	loading?: boolean;
	/** Trigger text when the active workspace cannot be resolved. */
	placeholder?: string;
}

function workspaceAvatar(workspace: Workspace): ReactNode {
	// A string logo is an image URL; any other ReactNode renders inside the
	// avatar. The name initial is the fallback when no logo is provided.
	const isImageUrl = typeof workspace.logo === "string";
	return (
		<Avatar
			src={isImageUrl ? (workspace.logo as string) : undefined}
			size="sm"
			radius="sm"
			color="blue"
		>
			{!isImageUrl && workspace.logo != null
				? workspace.logo
				: workspace.name.charAt(0).toUpperCase()}
		</Avatar>
	);
}

/**
 * Dropdown menu for switching between workspaces/organizations.
 *
 * A thin preset over `ContextSwitcher` that maps `Workspace` onto generic
 * context items. Renders the active workspace with an avatar and name, with
 * a dropdown showing all available workspaces. Supports optional search
 * filtering.
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
	loading = false,
	placeholder,
}: WorkspaceSwitcherProps): ReactElement {
	const items: ContextItem<Workspace>[] = workspaces.map((ws) => ({
		id: ws.id,
		label: ws.name,
		icon: workspaceAvatar(ws),
		data: ws,
	}));

	return (
		<ContextSwitcher<Workspace>
			items={items}
			active={activeWorkspace.id}
			onSelect={(item) => onSwitch(item.data as Workspace)}
			searchable={searchable}
			maxVisible={maxVisible}
			loading={loading}
			placeholder={placeholder}
			renderItem={
				renderWorkspace
					? (item, state) =>
							renderWorkspace(item.data as Workspace, state.active)
					: undefined
			}
			searchPlaceholder="Search workspaces..."
			searchAriaLabel="Search workspaces"
			emptyMessage="No workspaces found"
			ariaLabel={`Switch workspace, current: ${activeWorkspace.name}`}
			actions={
				onCreate
					? [
							{
								id: "create-workspace",
								label: "Create workspace",
								icon: <IconPlus size={14} stroke={1.5} />,
								onClick: onCreate,
							},
						]
					: undefined
			}
			renderTarget={
				renderWorkspace
					? () => (
							<UnstyledButton
								p="xs"
								w="100%"
								aria-label={`Switch workspace, current: ${activeWorkspace.name}`}
								style={{ borderRadius: "var(--mantine-radius-sm)" }}
							>
								{renderWorkspace(activeWorkspace, true)}
							</UnstyledButton>
						)
					: undefined
			}
		/>
	);
}
