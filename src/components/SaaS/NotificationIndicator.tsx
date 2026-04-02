"use client";

import {
	ActionIcon,
	Anchor,
	Group,
	Indicator,
	type MantineColor,
	Menu,
	ScrollArea,
	Text,
} from "@mantine/core";
import { IconBell } from "@tabler/icons-react";
import type { ReactNode } from "react";

export interface NotificationItem {
	id: string;
	title: string;
	description?: string;
	read?: boolean;
	timestamp?: Date;
	icon?: ReactNode;
	href?: string;
}

/** Props for the notification bell indicator. */
export interface NotificationIndicatorProps {
	count?: number;
	maxCount?: number;
	notifications?: NotificationItem[];
	onRead?: (id: string) => void;
	onReadAll?: () => void;
	onClick?: () => void;
	showDropdown?: boolean;
	color?: MantineColor;
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
	count = 0,
	maxCount = 99,
	notifications = [],
	onRead,
	onReadAll,
	onClick,
	showDropdown = true,
	color = "red",
}: NotificationIndicatorProps) {
	const displayCount = count > maxCount ? `${maxCount}+` : String(count);
	const hasUnread = notifications.some((n) => !n.read);
	const ariaLabel = `Notifications${count > 0 ? ` (${count} unread)` : ""}`;

	const bellButton = (
		<Indicator
			label={count > 0 ? displayCount : undefined}
			size={16}
			color={color}
			disabled={count === 0}
			processing={false}
			offset={4}
		>
			<ActionIcon
				variant="subtle"
				size="lg"
				aria-label={ariaLabel}
				color="gray"
				onClick={!showDropdown ? onClick : undefined}
			>
				<IconBell size={20} stroke={1.5} />
			</ActionIcon>
		</Indicator>
	);

	if (!showDropdown) {
		return bellButton;
	}

	return (
		<Indicator
			label={count > 0 ? displayCount : undefined}
			size={16}
			color={color}
			disabled={count === 0}
			processing={false}
			offset={4}
		>
			<Menu width={340} position="bottom-end" withinPortal>
				<Menu.Target>
					<ActionIcon
						variant="subtle"
						size="lg"
						aria-label={ariaLabel}
						color="gray"
					>
						<IconBell size={20} stroke={1.5} />
					</ActionIcon>
				</Menu.Target>

				<Menu.Dropdown>
					<Group justify="space-between" px="sm" py="xs">
						<Text fw={600} size="sm">
							Notifications
						</Text>
						{onReadAll && hasUnread && (
							<Anchor size="xs" onClick={onReadAll} component="button">
								Mark all as read
							</Anchor>
						)}
					</Group>
					<Menu.Divider />
					<ScrollArea.Autosize mah={300}>
						{notifications.length === 0 ? (
							<Text c="dimmed" ta="center" py="lg" size="sm">
								No notifications
							</Text>
						) : (
							notifications.map((n) => (
								<Menu.Item
									key={n.id}
									leftSection={n.icon}
									onClick={() => onRead?.(n.id)}
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
								</Menu.Item>
							))
						)}
					</ScrollArea.Autosize>
				</Menu.Dropdown>
			</Menu>
		</Indicator>
	);
}
