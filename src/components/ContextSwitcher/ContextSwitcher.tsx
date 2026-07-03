"use client";

import {
	Box,
	type FloatingPosition,
	Group,
	Loader,
	type MantineColor,
	Menu,
	ScrollArea,
	Skeleton,
	Text,
	TextInput,
	UnstyledButton,
} from "@mantine/core";
import { IconCheck, IconSearch, IconSelector } from "@tabler/icons-react";
import {
	type ReactElement,
	type ReactNode,
	useEffect,
	useRef,
	useState,
} from "react";

/** A selectable entry in a {@link ContextSwitcher}. */
export interface ContextItem<TData = unknown> {
	id: string;
	/** Primary line shown for the item. */
	label: string;
	/** Secondary line (e.g. an organization name under a role). */
	description?: string;
	/** Leading visual (avatar, icon). */
	icon?: ReactNode;
	/** Trailing content (e.g. an assignment count). Hidden while the item is active or pending. */
	badge?: ReactNode;
	disabled?: boolean;
	/** Items sharing a section are grouped under a labeled heading. */
	section?: string;
	/** Consumer payload passed back through `onSelect`. */
	data?: TData;
}

/** Footer action rendered below the item list (e.g. "Create workspace"). */
export interface ContextSwitcherAction {
	id: string;
	label: string;
	icon?: ReactNode;
	color?: MantineColor;
	onClick: () => void;
}

/** State passed to `renderItem`. */
export interface ContextSwitcherItemState {
	/** Whether this item is the current context. */
	active: boolean;
	/** Whether a selection of this item is in flight. */
	pending: boolean;
}

/** State passed to `renderTarget` as the third argument. */
export interface ContextSwitcherTargetState {
	/** Whether any selection is in flight. */
	pending: boolean;
}

/** Props for the generic context switcher dropdown. */
export interface ContextSwitcherProps<TData = unknown> {
	items: ContextItem<TData>[];
	/**
	 * Id of the current context, or null/undefined when no context is chosen
	 * yet — the trigger then renders `placeholder`.
	 */
	active?: string | null;
	/**
	 * Called when a non-active, non-disabled item is clicked. Returning a
	 * promise puts the switcher into a pending state: the clicked item shows a
	 * loader, other items are disabled, and the menu closes only once the
	 * promise resolves (it stays open on rejection). The active item is never
	 * marked optimistically — update `active` from your own state.
	 */
	onSelect: (item: ContextItem<TData>) => void | Promise<void>;
	/** Trigger text when `active` is null. @default "Choose context" */
	placeholder?: string;
	searchable?: boolean;
	/** @default "Search..." */
	searchPlaceholder?: string;
	/** @default "Search" */
	searchAriaLabel?: string;
	/** Shown when a search yields no items. @default "No matches found" */
	emptyMessage?: string;
	/** Rows visible before the list scrolls. @default 5 */
	maxVisible?: number;
	/** Footer actions rendered below a divider. */
	actions?: ContextSwitcherAction[];
	/** Free-form footer content rendered after `actions`. */
	footer?: ReactNode;
	/** Replaces the default item content (the Menu.Item wrapper is kept). */
	renderItem?: (
		item: ContextItem<TData>,
		state: ContextSwitcherItemState,
	) => ReactNode;
	/**
	 * Replaces the default trigger entirely. Must return a single element that
	 * forwards its ref (any Mantine button does).
	 */
	renderTarget?: (
		active: ContextItem<TData> | null,
		opened: boolean,
		state: ContextSwitcherTargetState,
	) => ReactElement;
	/** Trigger aria-label. Defaults to "Switch context, current: <label>" or the placeholder. */
	"aria-label"?: string;
	/** @deprecated Use `aria-label` instead. */
	ariaLabel?: string;
	/** Shows skeleton rows in the dropdown while the item list is being fetched. */
	loading?: boolean;
	/** Dropdown width. @default 280 */
	width?: number;
	/** @default "bottom-start" */
	position?: FloatingPosition;
}

/**
 * Generic dropdown for switching the user's acting context — workspaces,
 * personas, tenants, environments, or any other "you are acting as X" state.
 *
 * The active item is shown with a check mark and is not selectable. Async
 * `onSelect` handlers get built-in pending handling; see {@link ContextSwitcherProps.onSelect}.
 * `WorkspaceSwitcher` is a thin preset over this component.
 *
 * @example
 * ```tsx
 * <ContextSwitcher
 *   items={personas.map((p) => ({
 *     id: p.id,
 *     label: p.label,
 *     description: p.organization,
 *     section: p.kind,
 *     data: p,
 *   }))}
 *   active={actingPersonaId}
 *   onSelect={(item) => switchPersona(item.data)}
 * />
 * ```
 */
export function ContextSwitcher<TData = unknown>({
	items,
	active = null,
	onSelect,
	placeholder = "Choose context",
	searchable = false,
	searchPlaceholder = "Search...",
	searchAriaLabel = "Search",
	emptyMessage = "No matches found",
	maxVisible = 5,
	actions = [],
	footer,
	renderItem,
	renderTarget,
	"aria-label": ariaLabelAttr,
	ariaLabel,
	loading = false,
	width = 280,
	position = "bottom-start",
}: ContextSwitcherProps<TData>): ReactElement {
	const [opened, setOpened] = useState(false);
	const [search, setSearch] = useState("");
	const [pendingId, setPendingId] = useState<string | null>(null);
	const mountedRef = useRef(true);

	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);

	const activeItem = items.find((item) => item.id === active) ?? null;
	const pending = pendingId !== null;

	const closeMenu = () => {
		setOpened(false);
		setSearch("");
	};

	const handleSelect = (item: ContextItem<TData>) => {
		if (pending || item.disabled) return;
		if (item.id === active) {
			closeMenu();
			return;
		}
		const result = onSelect(item);
		if (result && typeof result.then === "function") {
			setPendingId(item.id);
			result.then(
				() => {
					if (mountedRef.current) {
						setPendingId(null);
						closeMenu();
					}
				},
				() => {
					// Keep the menu open so the consumer's error UI has context.
					if (mountedRef.current) setPendingId(null);
				},
			);
		} else {
			closeMenu();
		}
	};

	const filtered =
		searchable && search
			? items.filter((item) =>
					`${item.label} ${item.description ?? ""}`
						.toLowerCase()
						.includes(search.toLowerCase()),
				)
			: items;

	// Group by section, preserving first-appearance order; the undefined
	// (unsectioned) group keeps its position among the named ones.
	const sections = new Map<string | undefined, ContextItem<TData>[]>();
	for (const item of filtered) {
		const group = sections.get(item.section);
		if (group) {
			group.push(item);
		} else {
			sections.set(item.section, [item]);
		}
	}

	const resolvedAriaLabel =
		ariaLabelAttr ??
		ariaLabel ??
		(activeItem ? `Switch context, current: ${activeItem.label}` : placeholder);

	return (
		<Menu
			width={width}
			position={position}
			withinPortal
			opened={opened}
			onChange={(next) => {
				if (!next) setSearch("");
				setOpened(next);
			}}
		>
			<Menu.Target>
				{renderTarget ? (
					renderTarget(activeItem, opened, { pending })
				) : (
					<UnstyledButton
						p="xs"
						w="100%"
						aria-label={resolvedAriaLabel}
						data-testid="context-switcher-target"
						style={{ borderRadius: "var(--mantine-radius-sm)" }}
					>
						<Group gap="sm" wrap="nowrap">
							{activeItem?.icon}
							<Box flex={1} miw={0}>
								<Text
									size="sm"
									fw={600}
									c={activeItem ? undefined : "dimmed"}
									truncate
								>
									{activeItem ? activeItem.label : placeholder}
								</Text>
								{activeItem?.description && (
									<Text size="xs" c="dimmed" truncate>
										{activeItem.description}
									</Text>
								)}
							</Box>
							{pending ? (
								<Loader size={14} aria-hidden="true" />
							) : (
								<IconSelector
									size={14}
									stroke={1.5}
									opacity={0.5}
									aria-hidden="true"
								/>
							)}
						</Group>
					</UnstyledButton>
				)}
			</Menu.Target>

			<Menu.Dropdown
				aria-busy={pending || undefined}
				data-pending={pending || undefined}
				data-testid="context-switcher-dropdown"
			>
				{searchable && (
					<TextInput
						placeholder={searchPlaceholder}
						aria-label={searchAriaLabel}
						data-testid="context-switcher-search"
						leftSection={<IconSearch size={14} stroke={1.5} />}
						value={search}
						onChange={(e) => setSearch(e.currentTarget.value)}
						mb="xs"
						mx="xs"
						mt="xs"
					/>
				)}
				<ScrollArea.Autosize mah={maxVisible * 44}>
					{loading && (
						<Box px="xs" py="xs" data-testid="context-switcher-loading">
							{[0, 1, 2].map((row) => (
								<Skeleton key={row} height={28} mb={row < 2 ? 8 : 0} />
							))}
						</Box>
					)}
					{!loading && filtered.length === 0 && searchable && search && (
						<Text
							c="dimmed"
							ta="center"
							py="md"
							size="sm"
							data-testid="context-switcher-empty"
						>
							{emptyMessage}
						</Text>
					)}
					{!loading &&
						[...sections.entries()].map(([section, sectionItems]) => (
							<Box key={section ?? "__unsectioned"}>
								{section && <Menu.Label>{section}</Menu.Label>}
								{sectionItems.map((item) => {
									const isActive = item.id === active;
									const isPendingItem = item.id === pendingId;
									return (
										<Menu.Item
											key={item.id}
											closeMenuOnClick={false}
											disabled={item.disabled || (pending && !isPendingItem)}
											aria-current={isActive ? true : undefined}
											data-pending={isPendingItem || undefined}
											data-testid={`context-switcher-item-${item.id}`}
											leftSection={item.icon}
											rightSection={
												isPendingItem ? (
													<Loader size={14} aria-hidden="true" />
												) : isActive ? (
													<IconCheck
														size={14}
														stroke={1.5}
														aria-hidden="true"
													/>
												) : (
													(item.badge ?? null)
												)
											}
											onClick={() => handleSelect(item)}
										>
											{renderItem ? (
												renderItem(item, {
													active: isActive,
													pending: isPendingItem,
												})
											) : (
												<Box miw={0}>
													<Text size="sm" truncate>
														{item.label}
													</Text>
													{item.description && (
														<Text size="xs" c="dimmed" truncate>
															{item.description}
														</Text>
													)}
												</Box>
											)}
										</Menu.Item>
									);
								})}
							</Box>
						))}
				</ScrollArea.Autosize>
				{(actions.length > 0 || footer) && <Menu.Divider />}
				{actions.map((action) => (
					<Menu.Item
						key={action.id}
						closeMenuOnClick={false}
						leftSection={action.icon}
						color={action.color}
						data-testid={`context-switcher-action-${action.id}`}
						onClick={() => {
							closeMenu();
							action.onClick();
						}}
					>
						{action.label}
					</Menu.Item>
				))}
				{footer}
			</Menu.Dropdown>
		</Menu>
	);
}
