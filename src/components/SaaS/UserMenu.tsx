"use client";

import {
	Avatar,
	Box,
	Group,
	type MantineColor,
	Menu,
	Text,
	UnstyledButton,
} from "@mantine/core";
import {
	type CSSProperties,
	Fragment,
	type ReactElement,
	type ReactNode,
} from "react";
import type { UserInfo } from "../../types";

const truncateStyle: CSSProperties = {
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
};

export interface UserMenuItem {
	/** Stable identity for React keys. Falls back to label + index if omitted. */
	id?: string;
	label: string;
	icon?: ReactNode;
	href?: string;
	onClick?: () => void;
	color?: MantineColor;
	dividerBefore?: boolean;
}

/** Props for the user menu dropdown. */
export interface UserMenuProps {
	user: UserInfo;
	menuItems?: UserMenuItem[];
	showRole?: boolean;
	showEmail?: boolean;
	avatarSize?: number | string;
	/** "full" shows avatar + name + role/email (sidebar). "compact" shows avatar only (header). */
	variant?: "full" | "compact";
}

/**
 * User avatar with dropdown menu for profile actions.
 *
 * Displays the user's name, optional role/email, and a menu with
 * configurable actions like profile, settings, and sign out.
 *
 * @example
 * ```tsx
 * <UserMenu
 *   user={{ id: '1', name: 'Jane', email: 'jane@acme.com', role: 'Admin' }}
 *   menuItems={[
 *     { label: 'Profile', onClick: () => navigate('/profile') },
 *     { label: 'Sign out', onClick: signOut, color: 'red', dividerBefore: true },
 *   ]}
 * />
 * ```
 */
export function UserMenu({
	user,
	menuItems = [],
	showRole = true,
	showEmail = false,
	avatarSize = "sm",
	variant = "full",
}: UserMenuProps): ReactElement {
	const isCompact = variant === "compact";

	return (
		<Menu
			width={200}
			position={isCompact ? "bottom-end" : "top-start"}
			withinPortal
		>
			<Menu.Target>
				{isCompact ? (
					<UnstyledButton
						aria-label={`User menu for ${user.name}`}
						style={{ borderRadius: "var(--mantine-radius-xl)" }}
					>
						<Avatar
							src={user.avatarUrl}
							size={avatarSize}
							radius="xl"
							name={user.name}
							color="initials"
						/>
					</UnstyledButton>
				) : (
					<UnstyledButton
						p="xs"
						w="100%"
						aria-label={`User menu for ${user.name}`}
						style={{ borderRadius: "var(--mantine-radius-sm)" }}
					>
						<Group gap="sm" wrap="nowrap">
							<Avatar
								src={user.avatarUrl}
								size={avatarSize}
								radius="xl"
								name={user.name}
								color="initials"
							/>
							<Box flex={1} miw={0}>
								<Text size="sm" fw={500} truncate>
									{user.name}
								</Text>
								{showRole && user.role && (
									<Text size="xs" c="dimmed" truncate>
										{user.role}
									</Text>
								)}
								{showEmail && user.email && (
									<Text size="xs" c="dimmed" truncate>
										{user.email}
									</Text>
								)}
							</Box>
						</Group>
					</UnstyledButton>
				)}
			</Menu.Target>

			<Menu.Dropdown>
				<Menu.Label style={truncateStyle}>{user.name}</Menu.Label>
				{user.email && (
					<Menu.Label style={truncateStyle}>{user.email}</Menu.Label>
				)}
				<Menu.Divider />
				{menuItems.map((item, index) => (
					<Fragment key={item.id ?? `${item.label}-${index}`}>
						{item.dividerBefore && <Menu.Divider />}
						<Menu.Item
							leftSection={item.icon}
							color={item.color}
							onClick={item.onClick}
							component={item.href ? "a" : undefined}
							{...(item.href ? { href: item.href } : {})}
						>
							{item.label}
						</Menu.Item>
					</Fragment>
				))}
			</Menu.Dropdown>
		</Menu>
	);
}
