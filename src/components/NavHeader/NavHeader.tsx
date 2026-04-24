"use client";

import { Badge, Group, type MantineColor } from "@mantine/core";
import type { ReactElement, ReactNode } from "react";

/** Props for the header bar component. */
export interface NavHeaderProps {
	logo?: ReactNode;
	children?: ReactNode;
	rightSection?: ReactNode;
	environment?: { label: string; color: MantineColor };
}

/**
 * Top header bar with logo, optional center content, and right-aligned actions.
 *
 * Renders inside `AppShell.Header`. Accepts an optional environment badge
 * for staging/production indicators.
 *
 * @example
 * ```tsx
 * <NavHeader
 *   logo={<Logo />}
 *   environment={{ label: 'Staging', color: 'orange' }}
 *   rightSection={<NotificationIndicator count={3} />}
 * />
 * ```
 */
export function NavHeader({
	logo,
	children,
	rightSection,
	environment,
}: NavHeaderProps): ReactElement {
	return (
		<Group h="100%" justify="space-between" wrap="nowrap" flex={1}>
			<Group gap="md" wrap="nowrap">
				{logo}
				{environment && (
					<Badge
						color={environment.color}
						variant="light"
						size="sm"
						autoContrast
					>
						{environment.label}
					</Badge>
				)}
			</Group>

			{children && (
				<Group gap="xs" flex={1} justify="center">
					{children}
				</Group>
			)}

			{rightSection && (
				<Group gap="xs" wrap="nowrap">
					{rightSection}
				</Group>
			)}
		</Group>
	);
}
