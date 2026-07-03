"use client";

import {
	ActionIcon,
	AppShell,
	Box,
	Collapse,
	Divider,
	ScrollArea,
	Tooltip,
} from "@mantine/core";
import { IconChevronsLeft } from "@tabler/icons-react";
import type { ReactElement, ReactNode } from "react";
import { useOptionalNavShell } from "../NavShell";

/** Props for the sidebar content component. */
export interface NavSidebarProps {
	header?: ReactNode;
	children: ReactNode;
	footer?: ReactNode;
	showCollapseToggle?: boolean;
	collapseTogglePosition?: "header" | "footer";
	/** @deprecated Sections no longer clamp their height; this prop is ignored. */
	sectionMaxHeight?: number | string;
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
 * Section wrapper that renders AppShell.Section inside a NavShell and a plain
 * element standalone, since AppShell.Section throws outside an AppShell tree.
 */
function SidebarSection({
	inShell,
	body,
	children,
}: {
	inShell: boolean;
	body?: boolean;
	children: ReactNode;
}): ReactElement {
	if (inShell) {
		if (body) {
			return (
				<AppShell.Section grow component={ScrollArea} type="hover" pt="xs">
					{children}
				</AppShell.Section>
			);
		}
		return <AppShell.Section>{children}</AppShell.Section>;
	}
	if (body) {
		return (
			<ScrollArea type="hover" pt="xs" style={{ flex: 1 }}>
				{children}
			</ScrollArea>
		);
	}
	return <div>{children}</div>;
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
}: NavSidebarProps): ReactElement {
	const shell = useOptionalNavShell();
	const inShell = shell !== null;
	const desktopCollapsed = shell?.desktopCollapsed ?? false;
	const isMobile = shell?.isMobile ?? false;
	// On desktop collapsed, hide header/footer to make room for the icon rail
	const hideHeaderFooter = !isMobile && desktopCollapsed;

	return (
		<>
			{header && (
				<SidebarSection inShell={inShell}>
					<Collapse expanded={!hideHeaderFooter} transitionDuration={200}>
						<Box pb="xs">
							{header}
							{!hideHeaderFooter &&
								shell &&
								collapseTogglePosition === "header" &&
								showCollapseToggle && <CollapseToggle />}
							<Divider mt="xs" />
						</Box>
					</Collapse>
				</SidebarSection>
			)}

			<SidebarSection inShell={inShell} body>
				{children}
			</SidebarSection>

			{(footer ||
				(!hideHeaderFooter &&
					shell &&
					collapseTogglePosition === "footer" &&
					showCollapseToggle)) && (
				<SidebarSection inShell={inShell}>
					<Collapse expanded={!hideHeaderFooter} transitionDuration={200}>
						<Box pt="xs">
							<Divider mb="xs" />
							{footer}
							{!hideHeaderFooter &&
								shell &&
								collapseTogglePosition === "footer" &&
								showCollapseToggle && <CollapseToggle />}
						</Box>
					</Collapse>
				</SidebarSection>
			)}

			{/* When collapsed on desktop, show toggle at the bottom */}
			{hideHeaderFooter && shell && showCollapseToggle && (
				<SidebarSection inShell={inShell}>
					<Divider mb="xs" />
					<CollapseToggle />
				</SidebarSection>
			)}
		</>
	);
}
