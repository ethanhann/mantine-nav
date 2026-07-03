"use client";
import {
	AppShell,
	type AppShellMainProps,
	Burger,
	Group,
	type MantineBreakpoint,
	type MantineSpacing,
	Overlay,
	useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import {
	createContext,
	type ReactElement,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
} from "react";

/** Context value provided by NavShell to descendant components. */
export interface NavShellContextValue {
	mobileOpened: boolean;
	toggleMobile: () => void;
	openMobile: () => void;
	closeMobile: () => void;
	desktopCollapsed: boolean;
	toggleDesktop: () => void;
	collapseDesktop: () => void;
	expandDesktop: () => void;
	isMobile: boolean;
	linkComponent?: React.ElementType;
	/** Prop name used to pass the destination URL to linkComponent (default: "href"). Set to "to" for React Router. */
	hrefProp?: string;
}

const FOCUSABLE_SELECTOR =
	'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const NavShellContext = createContext<NavShellContextValue | null>(null);

/**
 * Access the NavShell context for sidebar state and mobile toggles.
 *
 * @throws {Error} If used outside of a `<NavShell>` component.
 *
 * @example
 * ```tsx
 * const { desktopCollapsed, toggleDesktop } = useNavShell();
 * ```
 */
export function useNavShell(): NavShellContextValue {
	const ctx = useContext(NavShellContext);
	if (!ctx) {
		throw new Error("useNavShell() must be used within a <NavShell>");
	}
	return ctx;
}

/** Access NavShell context, returning null if not within a NavShell. */
export function useOptionalNavShell(): NavShellContextValue | null {
	return useContext(NavShellContext);
}

/** Props for the NavShell layout component. */
export interface NavShellProps {
	header?: ReactNode;
	sidebar?: ReactNode;
	aside?: ReactNode;
	footer?: ReactNode;
	children: ReactNode;
	headerHeight?: number;
	sidebarWidth?: number;
	sidebarCollapsedWidth?: number;
	sidebarBreakpoint?: MantineBreakpoint;
	sidebarCollapsible?: boolean;
	defaultDesktopCollapsed?: boolean;
	layout?: "default" | "alt";
	withBorder?: boolean;
	padding?: MantineSpacing;
	transitionDuration?: number;
	/** Component used to render nav link items (e.g. React Router's Link or Next.js Link). */
	linkComponent?: React.ElementType;
	/** Prop name used to pass the destination URL to linkComponent (default: "href"). Set to "to" for React Router. */
	hrefProp?: string;
	mainProps?: AppShellMainProps;
}

/**
 * Top-level layout shell wrapping Mantine's AppShell.
 *
 * Provides responsive sidebar collapse, mobile drawer, and shared context
 * via `useNavShell()` for descendant components.
 *
 * @example
 * ```tsx
 * <NavShell
 *   header={<NavHeader logo={<Logo />} />}
 *   sidebar={<NavSidebar><NavGroup items={items} /></NavSidebar>}
 * >
 *   <main>Page content</main>
 * </NavShell>
 * ```
 */
export function NavShell({
	header,
	sidebar,
	aside,
	footer,
	children,
	headerHeight = 60,
	sidebarWidth = 260,
	sidebarCollapsedWidth = 80,
	sidebarBreakpoint = "sm",
	sidebarCollapsible = true,
	defaultDesktopCollapsed = false,
	layout = "default",
	withBorder = true,
	padding = "md",
	transitionDuration = 200,
	linkComponent,
	hrefProp,
	mainProps = {},
}: NavShellProps): ReactElement {
	const [
		mobileOpened,
		{ toggle: toggleMobile, open: openMobile, close: closeMobile },
	] = useDisclosure(false);
	const [
		desktopExpanded,
		{
			toggle: toggleDesktopExpanded,
			open: expandDesktopInner,
			close: collapseDesktopInner,
		},
	] = useDisclosure(!defaultDesktopCollapsed);

	const desktopCollapsed = sidebarCollapsible ? !desktopExpanded : false;
	// Resolve the breakpoint from the active theme so a custom theme keeps
	// isMobile in sync with AppShell's own collapse point.
	const theme = useMantineTheme();
	const isMobile =
		useMediaQuery(`(max-width: ${theme.breakpoints[sidebarBreakpoint]})`) ??
		false;

	const toggleDesktop = toggleDesktopExpanded;
	const collapseDesktop = collapseDesktopInner;
	const expandDesktop = expandDesktopInner;

	// Close mobile sidebar on Escape key
	const handleEscape = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === "Escape" && mobileOpened) {
				closeMobile();
			}
		},
		[mobileOpened, closeMobile],
	);

	useEffect(() => {
		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [handleEscape]);

	// Mobile drawer focus management: move focus into the drawer on open and
	// restore it to the previously focused element on close.
	const navbarRef = useRef<HTMLDivElement>(null);
	const returnFocusRef = useRef<HTMLElement | null>(null);
	const drawerActive = isMobile && mobileOpened;

	useEffect(() => {
		if (!drawerActive) return;
		returnFocusRef.current = document.activeElement as HTMLElement | null;
		const navbar = navbarRef.current;
		if (navbar) {
			const first = navbar.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
			(first ?? navbar).focus();
		}
		return () => {
			returnFocusRef.current?.focus();
			returnFocusRef.current = null;
		};
	}, [drawerActive]);

	const handleDrawerKeyDown = useCallback((e: React.KeyboardEvent) => {
		if (e.key !== "Tab" || !navbarRef.current) return;
		const focusables = Array.from(
			navbarRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
		);
		if (focusables.length === 0) return;
		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		const active = document.activeElement;
		if (e.shiftKey && (active === first || active === navbarRef.current)) {
			e.preventDefault();
			last?.focus();
		} else if (!e.shiftKey && active === last) {
			e.preventDefault();
			first?.focus();
		}
	}, []);

	const ctx: NavShellContextValue = useMemo(
		() => ({
			mobileOpened,
			toggleMobile,
			openMobile,
			closeMobile,
			desktopCollapsed,
			toggleDesktop,
			collapseDesktop,
			expandDesktop,
			isMobile,
			linkComponent,
			hrefProp,
		}),
		[
			mobileOpened,
			toggleMobile,
			openMobile,
			closeMobile,
			desktopCollapsed,
			toggleDesktop,
			collapseDesktop,
			expandDesktop,
			isMobile,
			linkComponent,
			hrefProp,
		],
	);

	return (
		<NavShellContext.Provider value={ctx}>
			<AppShell
				header={header ? { height: headerHeight } : undefined}
				navbar={
					sidebar
						? {
								width: desktopCollapsed ? sidebarCollapsedWidth : sidebarWidth,
								breakpoint: sidebarBreakpoint,
								collapsed: {
									mobile: !mobileOpened,
									desktop: false,
								},
							}
						: undefined
				}
				aside={
					aside
						? { width: 300, breakpoint: "md", collapsed: { mobile: true } }
						: undefined
				}
				footer={footer ? { height: 60 } : undefined}
				layout={layout}
				padding={padding}
				withBorder={withBorder}
				transitionDuration={transitionDuration}
			>
				{header && (
					<AppShell.Header>
						<Group h="100%" px="md" wrap="nowrap">
							{sidebar && (
								<Burger
									opened={mobileOpened}
									onClick={toggleMobile}
									hiddenFrom={sidebarBreakpoint}
									size="sm"
									aria-label="Toggle navigation"
								/>
							)}
							{header}
						</Group>
					</AppShell.Header>
				)}

				{sidebar && (
					<AppShell.Navbar
						p="sm"
						ref={navbarRef}
						onKeyDown={drawerActive ? handleDrawerKeyDown : undefined}
					>
						{sidebar}
					</AppShell.Navbar>
				)}

				{aside && <AppShell.Aside p="md">{aside}</AppShell.Aside>}

				{/* Backdrop overlay when mobile sidebar is open. Click-to-close is
				    a pointer convenience only; keyboard users close with Escape. */}
				{drawerActive && (
					<Overlay
						onClick={closeMobile}
						opacity={0.5}
						color="var(--mantine-color-black)"
						zIndex={"calc(var(--mantine-z-index-app) - 1)" as unknown as number}
					/>
				)}

				<AppShell.Main {...mainProps}>{children}</AppShell.Main>

				{footer && <AppShell.Footer p="md">{footer}</AppShell.Footer>}
			</AppShell>
		</NavShellContext.Provider>
	);
}
