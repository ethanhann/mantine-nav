"use client";

import { ActionIcon, Tooltip } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { useNavColorScheme } from "../../hooks/useNavColorScheme";

/** Props for the color scheme toggle button. */
export interface ColorSchemeToggleProps {
	/** Size of the ActionIcon wrapper. */
	size?: "xs" | "sm" | "md" | "lg" | "xl";
}

/**
 * A dark/light mode toggle button for the header bar.
 *
 * Uses `useNavColorScheme` internally so it works anywhere inside a
 * `MantineProvider` with `colorSchemeManager`.
 *
 * @example
 * ```tsx
 * <NavHeader
 *   logo={<Logo />}
 *   rightSection={<ColorSchemeToggle />}
 * />
 * ```
 */
export function ColorSchemeToggle({ size = "lg" }: ColorSchemeToggleProps) {
	const { isDark, toggleColorScheme } = useNavColorScheme();

	return (
		<Tooltip label={isDark ? "Light mode" : "Dark mode"}>
			<ActionIcon
				variant="subtle"
				size={size}
				color="gray"
				onClick={toggleColorScheme}
				aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
			>
				{isDark ? (
					<IconSun size={20} stroke={1.5} />
				) : (
					<IconMoon size={20} stroke={1.5} />
				)}
			</ActionIcon>
		</Tooltip>
	);
}
