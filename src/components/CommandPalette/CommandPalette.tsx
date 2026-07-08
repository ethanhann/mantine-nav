"use client";

import { Loader } from "@mantine/core";
import { Spotlight } from "@mantine/spotlight";
import { IconAlertTriangle } from "@tabler/icons-react";
import { type ReactNode, useMemo, useState } from "react";
import { commandPaletteStore } from "../../hooks/useCommandPalette";
import {
	type CommandSearchFn,
	type CommandSearchResult,
	useCommandSearch,
} from "../../hooks/useCommandSearch";
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
	/** Heading for the backend `search` results group. @default "Results" */
	results?: string;
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
	/** Async backend search source. Called (debounced) as the user types; its
	 * results are appended below the local matches in a "Results" group. */
	search?: CommandSearchFn;
	/** Don't hit the backend until the query reaches this length. `0` also
	 * fires `search("")` on an empty query (server-side suggestions). @default 2 */
	minSearchLength?: number;
	/** Debounce before firing `search`, in ms. @default 200 */
	searchDebounce?: number;
	/** Delay after a `search` request fires before the spinner shows, so fast
	 * responses don't flicker one. @default 300 */
	searchStallThreshold?: number;
	placeholder?: string;
	nothingFoundMessage?: ReactNode;
	/** Shown while a backend search is pending/running. @default "Searching…" */
	searchingMessage?: ReactNode;
	/** Shown when a backend search rejects. @default "Search failed" */
	searchErrorMessage?: ReactNode;
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
	results: "Results",
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
	search,
	minSearchLength = 2,
	searchDebounce = 200,
	searchStallThreshold = 300,
	placeholder = "Search…",
	nothingFoundMessage = "Nothing found",
	searchingMessage = "Searching…",
	searchErrorMessage = "Search failed",
	maxHeight = 400,
	labels,
}: CommandPaletteProps) {
	const [query, setQuery] = useState("");
	const shell = useOptionalNavShell();
	const recent = useRecentlyViewed({ storageKey: storageKeys?.recent });
	const starred = useStarredPages({ storageKey: storageKeys?.starred });
	const remote = useCommandSearch(query, search, {
		minLength: minSearchLength,
		debounce: searchDebounce,
		stallThreshold: searchStallThreshold,
	});

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

		shell?.onNavigate?.({
			id: command.id,
			label: command.label,
			href: command.href,
			external: command.external,
			data: command.data,
			source: "command-palette",
			trigger: "mouse",
		});

		if (recordRecent && !command.external) {
			recent.addItem({
				id: command.id,
				label: command.label,
				href: command.href,
			});
		}
		if (shell?.isMobile) shell.closeMobile();
	};

	const renderNavAction = (
		command: NavCommand,
		key: string,
		description?: string,
	) => (
		<Spotlight.Action
			key={key}
			label={command.label}
			description={
				description ??
				(command.path.length ? command.path.join(" / ") : undefined)
			}
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

	const renderSearchResult = (result: CommandSearchResult) =>
		renderNavAction(
			{
				id: result.id,
				label: result.label,
				href: result.href,
				icon: result.icon,
				external: result.external,
				path: [],
			},
			`result-${result.id}`,
			result.description,
		);

	// Backend results group. Dedup by href against the local rows actually
	// displayed (not the whole nav tree — a hit must stay reachable when its
	// local counterpart didn't match the query), and cap to `limit` like the
	// local groups.
	const resultsGroupElement = (shownHrefs: ReadonlySet<string>) => {
		const remoteResults = remote.results
			.filter((r) => !shownHrefs.has(r.href))
			.slice(0, limit);
		if (remoteResults.length === 0) return null;
		return (
			<Spotlight.ActionsGroup key="results" label={groupLabels.results}>
				{remoteResults.map(renderSearchResult)}
			</Spotlight.ActionsGroup>
		);
	};

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
		// With minSearchLength={0} the backend also answers the empty query
		// (suggestions on open); every nav command is displayed above, so dedup
		// against all of them.
		const resultsEl = resultsGroupElement(
			new Set(navCommands.map((c) => c.href)),
		);
		if (resultsEl) groups.push(resultsEl);
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

		// Lead with whichever local group has the strongest top match.
		const ordered = actTop > navTop ? [actEl, navEl] : [navEl, actEl];
		for (const el of ordered) if (el) groups.push(el);

		// Backend results are appended *below* local matches (stable position —
		// the selection stays anchored on the first local row when they arrive).
		const resultsEl = resultsGroupElement(
			new Set(rankedNav.map((r) => r.item.href)),
		);
		if (resultsEl) groups.push(resultsEl);
	}

	// When nothing is shown, prefer "Searching…" over "Nothing found" while a
	// backend request is pending, and surface a failed search. The hook gates
	// `active`/`error` on the live input, so neither leaks across queries.
	const emptyContent: ReactNode = remote.active
		? searchingMessage
		: remote.error
			? searchErrorMessage
			: nothingFoundMessage;

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
			<Spotlight.Search
				placeholder={placeholder}
				data-autofocus
				rightSection={
					remote.stalled ? (
						<Loader size="xs" />
					) : remote.error ? (
						// Keeps a failed backend search visible even when local rows
						// match and the Empty slot never renders.
						<IconAlertTriangle
							size={16}
							stroke={1.5}
							color="var(--mantine-color-red-6)"
							role="img"
							aria-label={
								typeof searchErrorMessage === "string"
									? searchErrorMessage
									: "Search failed"
							}
						/>
					) : undefined
				}
			/>
			<Spotlight.ActionsList>
				{groups.length > 0 ? (
					groups
				) : (
					<Spotlight.Empty>{emptyContent}</Spotlight.Empty>
				)}
			</Spotlight.ActionsList>
		</Spotlight.Root>
	);
}
