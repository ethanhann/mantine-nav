"use client";

import { Spotlight } from "@mantine/spotlight";
import { type ReactNode, useMemo, useState } from "react";
import { commandPaletteStore } from "../../hooks/useCommandPalette";
import { useRecentlyViewed } from "../../hooks/useRecentlyViewed";
import { useStarredPages } from "../../hooks/useStarredPages";
import type { NavItemType } from "../../types";
import { flattenNavCommands, type NavCommand } from "../../utils/flatten";
import { rankCommands } from "../../utils/fuzzy";
import { useOptionalNavShell } from "../NavShell";

/** A non-navigation command, e.g. "Toggle theme" or "Log out". */
export interface CommandPaletteAction {
	id: string;
	label: string;
	description?: string;
	icon?: ReactNode;
	/** Extra text used for fuzzy matching (not displayed). */
	keywords?: string[];
	/** Group heading; defaults to the `labels.actions` group. */
	group?: string;
	onSelect: () => void;
	disabled?: boolean;
	/** Close the palette after selecting. @default true */
	closeOnSelect?: boolean;
}

export interface CommandPaletteGroupLabels {
	recent?: string;
	starred?: string;
	pages?: string;
	actions?: string;
}

export interface CommandPaletteProps {
	/** Nav tree, auto-flattened into searchable link commands. */
	items?: NavItemType[];
	/** Additional non-navigation commands. */
	actions?: CommandPaletteAction[];
	/** Keyboard shortcut(s) to open the palette. `null` disables. @default "mod + K" */
	shortcut?: string | string[] | null;
	/** Show the "Recently Viewed" section on an empty query. @default true */
	showRecent?: boolean;
	/** Show the "Starred" section on an empty query. @default true */
	showStarred?: boolean;
	/** Max recent items shown on an empty query. @default 5 */
	recentLimit?: number;
	/** Override localStorage keys for the recent/starred hooks. */
	storageKeys?: { recent?: string; starred?: string };
	/** Record selected nav links into recently-viewed. @default true */
	recordRecent?: boolean;
	/** Custom navigation handler (e.g. SPA router push). Falls back to the item's
	 * own `onClick`, then a full-page navigation. */
	onNavigate?: (command: NavCommand) => void;
	/** Max results shown per group while searching. @default 7 */
	limit?: number;
	placeholder?: string;
	nothingFoundMessage?: ReactNode;
	/** Content max-height when scrollable. @default 400 */
	maxHeight?: number;
	/** Override group heading labels (for i18n). */
	labels?: CommandPaletteGroupLabels;
}

const DEFAULT_LABELS: Required<CommandPaletteGroupLabels> = {
	recent: "Recently Viewed",
	starred: "Starred",
	pages: "Pages",
	actions: "Actions",
};

export function CommandPalette({
	items = [],
	actions = [],
	shortcut = "mod + K",
	showRecent = true,
	showStarred = true,
	recentLimit = 5,
	storageKeys,
	recordRecent = true,
	onNavigate,
	limit = 7,
	placeholder = "Search…",
	nothingFoundMessage = "Nothing found",
	maxHeight = 400,
	labels,
}: CommandPaletteProps) {
	const [query, setQuery] = useState("");
	const shell = useOptionalNavShell();
	const recent = useRecentlyViewed({ storageKey: storageKeys?.recent });
	const starred = useStarredPages({ storageKey: storageKeys?.starred });

	const navCommands = useMemo(() => flattenNavCommands(items), [items]);
	const groupLabels = { ...DEFAULT_LABELS, ...labels };

	const handleNavSelect = (command: NavCommand, event?: React.MouseEvent) => {
		if (onNavigate) {
			onNavigate(command);
		} else if (command.onClick && event) {
			command.onClick(event);
		} else if (typeof window !== "undefined") {
			if (command.external) {
				window.open(command.href, "_blank", "noopener,noreferrer");
			} else {
				window.location.assign(command.href);
			}
		}

		if (recordRecent && !command.external) {
			recent.addItem({
				id: command.id,
				label: command.label,
				href: command.href,
			});
		}
		if (shell?.isMobile) shell.closeMobile();
	};

	const renderNavAction = (command: NavCommand, key: string) => (
		<Spotlight.Action
			key={key}
			label={command.label}
			description={command.path.length ? command.path.join(" / ") : undefined}
			leftSection={command.icon}
			disabled={command.disabled}
			onClick={(event) => handleNavSelect(command, event)}
		/>
	);

	const renderActionItem = (action: CommandPaletteAction) => (
		<Spotlight.Action
			key={`action-${action.id}`}
			label={action.label}
			description={action.description}
			leftSection={action.icon}
			disabled={action.disabled}
			keywords={action.keywords}
			closeSpotlightOnTrigger={action.closeOnSelect}
			onClick={() => action.onSelect()}
		/>
	);

	const navGroupElement = (commands: NavCommand[]) => (
		<Spotlight.ActionsGroup key="pages" label={groupLabels.pages}>
			{commands.map((c) => renderNavAction(c, `nav-${c.id}`))}
		</Spotlight.ActionsGroup>
	);

	const actionsGroupElement = (list: CommandPaletteAction[]) => (
		<Spotlight.ActionsGroup key="actions" label={groupLabels.actions}>
			{list.map(renderActionItem)}
		</Spotlight.ActionsGroup>
	);

	const groups: ReactNode[] = [];
	const trimmed = query.trim();

	if (trimmed === "") {
		if (showRecent && recent.items.length > 0) {
			groups.push(
				<Spotlight.ActionsGroup key="recent" label={groupLabels.recent}>
					{recent.items
						.slice(0, recentLimit)
						.map((it) =>
							renderNavAction(
								{ id: it.id, label: it.label, href: it.href, path: [] },
								`recent-${it.id}`,
							),
						)}
				</Spotlight.ActionsGroup>,
			);
		}
		if (showStarred && starred.items.length > 0) {
			groups.push(
				<Spotlight.ActionsGroup key="starred" label={groupLabels.starred}>
					{starred.items.map((it) =>
						renderNavAction(
							{ id: it.id, label: it.label, href: it.href, path: [] },
							`starred-${it.id}`,
						),
					)}
				</Spotlight.ActionsGroup>,
			);
		}
		if (actions.length > 0) groups.push(actionsGroupElement(actions));
		if (navCommands.length > 0) groups.push(navGroupElement(navCommands));
	} else {
		const rankedNav = rankCommands(
			trimmed,
			navCommands,
			(c) => c.label,
			(c) => c.path,
		).slice(0, limit);
		const rankedActions = rankCommands(
			trimmed,
			actions,
			(a) => a.label,
			(a) => [a.description ?? "", ...(a.keywords ?? [])],
		).slice(0, limit);

		const navTop = rankedNav[0]?.result.score ?? Number.NEGATIVE_INFINITY;
		const actTop = rankedActions[0]?.result.score ?? Number.NEGATIVE_INFINITY;
		const navEl = rankedNav.length
			? navGroupElement(rankedNav.map((r) => r.item))
			: null;
		const actEl = rankedActions.length
			? actionsGroupElement(rankedActions.map((r) => r.item))
			: null;

		// Lead with whichever group has the strongest top match.
		const ordered = actTop > navTop ? [actEl, navEl] : [navEl, actEl];
		for (const el of ordered) if (el) groups.push(el);
	}

	return (
		<Spotlight.Root
			store={commandPaletteStore}
			query={query}
			onQueryChange={setQuery}
			shortcut={shortcut}
			onSpotlightClose={() => setQuery("")}
			scrollable
			maxHeight={maxHeight}
		>
			<Spotlight.Search placeholder={placeholder} />
			<Spotlight.ActionsList>
				{groups.length > 0 ? (
					groups
				) : (
					<Spotlight.Empty>{nothingFoundMessage}</Spotlight.Empty>
				)}
			</Spotlight.ActionsList>
		</Spotlight.Root>
	);
}
