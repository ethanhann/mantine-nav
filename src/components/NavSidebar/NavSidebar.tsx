"use client";

import {
	ActionIcon,
	AppShell,
	Box,
	Divider,
	ScrollArea,
	Tooltip,
} from "@mantine/core";
import { IconChevronsLeft } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useOptionalNavShell } from "../NavShell";

/** Props for the sidebar content component. */
export interface NavSidebarProps {
	header?: ReactNode;
	children: ReactNode;
	footer?: ReactNode;
	showCollapseToggle?: boolean;
	collapseTogglePosition?: "header" | "footer";
}

function CollapseToggle() {
	const shell = useOptionalNavShell();
	if (!shell) return null;
	const { desktopCollapsed, toggleDesktop, isMobile } = shell;

	// Don't show collapse toggle on mobile — it controls desktop state
	if (isMobile) return null;

	return (
		<Tooltip
			label={desktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
			position="right"
		>
			<ActionIcon
				variant="subtle"
				onClick={toggleDesktop}
				aria-label={desktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
				color="gray"
				size="sm"
				w="100%"
				style={{ borderRadius: "var(--mantine-radius-sm)" }}
			>
				<IconChevronsLeft
					size={14}
					stroke={1.5}
					style={{
						transform: desktopCollapsed ? "rotate(180deg)" : undefined,
						transition: "transform 200ms ease",
					}}
				/>
			</ActionIcon>
		</Tooltip>
	);
}

/**
 * Sidebar content with optional header, scrollable body, and footer sections.
 *
 * Renders inside `AppShell.Navbar` and includes an optional collapse toggle
 * that integrates with `NavShell`'s sidebar state. When the sidebar is
 * collapsed on desktop, header and footer content are hidden and only
 * icon-based navigation is shown.
 *
 * @example
 * ```tsx
 * <NavSidebar
 *   header={<WorkspaceSwitcher ... />}
 *   footer={<UserMenu ... />}
 * >
 *   <NavGroup items={navItems} />
 * </NavSidebar>
 * ```
 */
export function NavSidebar({
	header,
	children,
	footer,
	showCollapseToggle = true,
	collapseTogglePosition = "footer",
}: NavSidebarProps) {
	const shell = useOptionalNavShell();
	const desktopCollapsed = shell?.desktopCollapsed ?? false;
	const isMobile = shell?.isMobile ?? false;
	// On desktop collapsed, visually hide header/footer to make room for icon rail
	const hideHeaderFooter = !isMobile && desktopCollapsed;
	const hiddenStyle: React.CSSProperties | undefined = hideHeaderFooter
		? {
				opacity: 0,
				maxHeight: 0,
				overflow: "hidden",
				transition: "opacity 200ms ease, max-height 200ms ease",
			}
		: {
				opacity: 1,
				maxHeight: "500px",
				overflow: "hidden",
				transition: "opacity 200ms ease, max-height 200ms ease",
			};

	return (
		<>
			{header && (
				<AppShell.Section style={hiddenStyle}>
					<Box pb="xs">
						{header}
						{!hideHeaderFooter &&
							shell &&
							collapseTogglePosition === "header" &&
							showCollapseToggle && <CollapseToggle />}
						<Divider mt="xs" />
					</Box>
				</AppShell.Section>
			)}

			<AppShell.Section grow component={ScrollArea} type="hover" pt="xs">
				{children}
			</AppShell.Section>

			{(footer ||
				(!hideHeaderFooter &&
					shell &&
					collapseTogglePosition === "footer" &&
					showCollapseToggle)) && (
				<AppShell.Section style={hiddenStyle}>
					<Box pt="xs">
						<Divider mb="xs" />
						{footer}
						{!hideHeaderFooter &&
							shell &&
							collapseTogglePosition === "footer" &&
							showCollapseToggle && <CollapseToggle />}
					</Box>
				</AppShell.Section>
			)}

			{/* When collapsed on desktop, show toggle at the bottom */}
			{hideHeaderFooter && shell && showCollapseToggle && (
				<AppShell.Section>
					<Divider mb="xs" />
					<CollapseToggle />
				</AppShell.Section>
			)}
		</>
	);
}
