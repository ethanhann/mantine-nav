"use client";

import {
	ActionIcon,
	Anchor,
	Box,
	type FloatingPosition,
	Group,
	Indicator,
	type MantineColor,
	Menu,
	ScrollArea,
	Skeleton,
	Text,
} from "@mantine/core";
import { IconBell } from "@tabler/icons-react";
import type { ReactElement, ReactNode } from "react";

export interface NotificationItem {
	id: string;
	title: string;
	description?: string;
	read?: boolean;
	timestamp?: string | Date;
	icon?: ReactNode;
	href?: string;
}

/** Props for the notification bell indicator. */
export interface NotificationIndicatorProps {
	/** Badge count. Defaults to the number of unread `notifications`. */
	count?: number;
	maxCount?: number;
	notifications?: NotificationItem[];
	onRead?: (id: string) => void;
	onReadAll?: () => void;
	onClick?: () => void;
	showDropdown?: boolean;
	color?: MantineColor;
	/** Dropdown width. */
	width?: number;
	/** Dropdown position. */
	position?: FloatingPosition;
	/** Shows a loading placeholder in the dropdown while notifications load. */
	loading?: boolean;
	/** Overrides for user-facing strings. */
	labels?: {
		/** Dropdown heading. @default "Notifications" */
		title?: string;
		/** @default "Mark all as read" */
		markAllAsRead?: string;
		/** @default "No notifications" */
		empty?: string;
		/** Bell aria-label. @default (unread) => `Notifications (${unread} unread)` */
		bell?: (unreadCount: number) => string;
	};
	/** Controlled dropdown open state. */
	opened?: boolean;
	/** Called when the dropdown open state changes. */
	onOpenChange?: (opened: boolean) => void;
}

/**
 * Bell icon with unread count badge and optional notification dropdown.
 *
 * @example
 * ```tsx
 * <NotificationIndicator
 *   count={5}
 *   notifications={notifications}
 *   onRead={(id) => markAsRead(id)}
 *   onReadAll={() => markAllAsRead()}
 * />
 * ```
 */
export function NotificationIndicator({
	count,
	maxCount = 99,
	notifications = [],
	onRead,
	onReadAll,
	onClick,
	showDropdown = true,
	color = "red",
	width = 340,
	position = "bottom-end",
	loading = false,
	labels,
	opened,
	onOpenChange,
}: NotificationIndicatorProps): ReactElement {
	const resolvedCount = count ?? notifications.filter((n) => !n.read).length;
	const displayCount =
		resolvedCount > maxCount ? `${maxCount}+` : String(resolvedCount);
	const hasUnread = notifications.some((n) => !n.read);
	const ariaLabel =
		labels?.bell?.(resolvedCount) ??
		`Notifications${resolvedCount > 0 ? ` (${resolvedCount} unread)` : ""}`;

	const bell = (
		<ActionIcon
			variant="subtle"
			size="lg"
			aria-label={ariaLabel}
			color="gray"
			onClick={showDropdown ? undefined : onClick}
		>
			<IconBell size={20} stroke={1.5} />
		</ActionIcon>
	);

	return (
		<Indicator
			label={resolvedCount > 0 ? displayCount : undefined}
			size={16}
			color={color}
			disabled={resolvedCount === 0}
			processing={false}
			offset={4}
		>
			{!showDropdown ? (
				bell
			) : (
				<Menu
					width={width}
					position={position}
					opened={opened}
					onChange={onOpenChange}
					withinPortal
				>
					<Menu.Target>{bell}</Menu.Target>

					<Menu.Dropdown>
						<Group justify="space-between" px="sm" py="xs">
							<Text fw={600} size="sm">
								{labels?.title ?? "Notifications"}
							</Text>
							{onReadAll && hasUnread && (
								<Anchor size="xs" onClick={onReadAll} component="button">
									{labels?.markAllAsRead ?? "Mark all as read"}
								</Anchor>
							)}
						</Group>
						<Menu.Divider />
						<ScrollArea.Autosize mah={300}>
							{loading ? (
								<Box px="sm" py="xs" data-testid="notification-loading">
									{[0, 1, 2].map((row) => (
										<Skeleton key={row} height={36} mb={row < 2 ? 8 : 0} />
									))}
								</Box>
							) : notifications.length === 0 ? (
								<Text c="dimmed" ta="center" py="lg" size="sm">
									{labels?.empty ?? "No notifications"}
								</Text>
							) : (
								notifications.map((n) => (
									<Menu.Item
										key={n.id}
										leftSection={n.icon}
										onClick={() => onRead?.(n.id)}
										closeMenuOnClick={Boolean(n.href)}
										opacity={n.read ? 0.6 : 1}
										component={n.href ? "a" : undefined}
										aria-label={`${n.title}${n.read ? "" : " (unread)"}`}
										{...(n.href ? { href: n.href } : {})}
									>
										<Text size="sm" fw={n.read ? 400 : 600}>
											{n.title}
										</Text>
										{n.description && (
											<Text size="xs" c="dimmed">
												{n.description}
											</Text>
										)}
										{n.timestamp && (
											<Text size="xs" c="dimmed">
												{n.timestamp instanceof Date
													? n.timestamp.toLocaleString()
													: n.timestamp}
											</Text>
										)}
									</Menu.Item>
								))
							)}
						</ScrollArea.Autosize>
					</Menu.Dropdown>
				</Menu>
			)}
		</Indicator>
	);
}
