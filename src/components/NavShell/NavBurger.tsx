"use client";

import { Burger, type MantineBreakpoint } from "@mantine/core";
import type { ReactElement } from "react";
import { useOptionalNavShell } from "./NavShell";

/** Props for the standalone mobile navigation toggle. */
export interface NavBurgerProps {
	size?: string | number;
	/** Hide the burger from this breakpoint upward. */
	hiddenFrom?: MantineBreakpoint;
	/** @default "Toggle navigation" */
	"aria-label"?: string;
}

/**
 * Standalone mobile drawer toggle bound to the surrounding NavShell.
 *
 * Use it in layouts without a header, where NavShell's built-in Burger is
 * not rendered. Renders nothing outside a NavShell.
 */
export function NavBurger({
	size = "sm",
	hiddenFrom,
	"aria-label": ariaLabel = "Toggle navigation",
}: NavBurgerProps): ReactElement | null {
	const shell = useOptionalNavShell();
	if (!shell) return null;
	return (
		<Burger
			opened={shell.mobileOpened}
			onClick={shell.toggleMobile}
			hiddenFrom={hiddenFrom}
			size={size}
			aria-label={ariaLabel}
			aria-expanded={shell.mobileOpened}
			aria-controls={shell.navbarId}
		/>
	);
}
