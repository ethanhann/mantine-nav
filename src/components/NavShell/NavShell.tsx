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
	useState,
} from "react";
import type { NavigateEvent, NavSlotStyles } from "../../types";

export type NavShellSlot = "header" | "navbar" | "aside" | "footer" | "main";

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
	onNavigate?: (event: NavigateEvent) => void;
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
export interface NavShellProps extends NavSlotStyles<NavShellSlot> {
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
	/** Controlled collapse state. When set, pair with onDesktopCollapsedChange. */
	desktopCollapsed?: boolean;
	/** Called with the intended collapse state on toggle/collapse/expand. */
	onDesktopCollapsedChange?: (collapsed: boolean) => void;
	/** localStorage key for persisting collapse state. Ignored in controlled mode. */
	collapsePersistKey?: string;
	/** Aside panel width. @default 300 */
	asideWidth?: number;
	/** Breakpoint below which the aside is hidden. @default "md" */
	asideBreakpoint?: MantineBreakpoint;
	/** Footer height. @default 60 */
	footerHeight?: number;
	layout?: "default" | "alt";
	withBorder?: boolean;
	padding?: MantineSpacing;
	transitionDuration?: number;
	/** Component used to render nav link items (e.g. React Router's Link or Next.js Link). */
	linkComponent?: React.ElementType;
	/** Prop name used to pass the destination URL to linkComponent (default: "href"). Set to "to" for React Router. */
	hrefProp?: string;
	mainProps?: AppShellMainProps;
	/** Called when a user activates a navigation link from any surface (sidebar, command palette, breadcrumbs). */
	onNavigate?: (event: NavigateEvent) => void;
	/** Overrides for user-facing strings. */
	labels?: {
		/** Burger aria-label. @default "Toggle navigation" */
		toggleNavigation?: string;
	};
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
	desktopCollapsed: desktopCollapsedProp,
	onDesktopCollapsedChange,
	collapsePersistKey,
	asideWidth = 300,
	asideBreakpoint = "md",
	footerHeight = 60,
	layout = "default",
	withBorder = true,
	padding = "md",
	transitionDuration = 200,
	linkComponent,
	hrefProp,
	mainProps = {},
	onNavigate,
	labels,
	classNames,
	styles,
}: NavShellProps): ReactElement {
	const [
		mobileOpened,
		{ toggle: toggleMobile, open: openMobile, close: closeMobile },
	] = useDisclosure(false);
	const [desktopExpanded, setDesktopExpanded] = useState(() => {
		if (collapsePersistKey && typeof window !== "undefined") {
			try {
				const stored = localStorage.getItem(collapsePersistKey);
				if (stored === "true") return false;
				if (stored === "false") return true;
			} catch {}
		}
		return !defaultDesktopCollapsed;
	});

	const isCollapseControlled = desktopCollapsedProp !== undefined;
	const desktopCollapsed = sidebarCollapsible
		? (desktopCollapsedProp ?? !desktopExpanded)
		: false;

	const collapseFirstRun = useRef(true);
	const collapseFromStorage = useRef(false);
	useEffect(() => {
		if (collapseFirstRun.current) {
			collapseFirstRun.current = false;
			return;
		}
		if (collapseFromStorage.current) {
			collapseFromStorage.current = false;
			return;
		}
		if (!collapsePersistKey || isCollapseControlled) return;
		try {
			localStorage.setItem(collapsePersistKey, String(!desktopExpanded));
		} catch {}
	}, [collapsePersistKey, isCollapseControlled, desktopExpanded]);

	useEffect(() => {
		if (
			!collapsePersistKey ||
			isCollapseControlled ||
			typeof window === "undefined"
		)
			return;
		const handler = (event: StorageEvent) => {
			if (event.key !== collapsePersistKey) return;
			if (event.newValue === "true") {
				collapseFromStorage.current = true;
				setDesktopExpanded(false);
			} else if (event.newValue === "false") {
				collapseFromStorage.current = true;
				setDesktopExpanded(true);
			}
		};
		window.addEventListener("storage", handler);
		return () => window.removeEventListener("storage", handler);
	}, [collapsePersistKey, isCollapseControlled]);
	// Resolve the breakpoint from the active theme so a custom theme keeps
	// isMobile in sync with AppShell's own collapse point.
	const theme = useMantineTheme();
	const isMobile =
		useMediaQuery(`(max-width: ${theme.breakpoints[sidebarBreakpoint]})`) ??
		false;

	const setDesktopCollapsed = useCallback(
		(collapsed: boolean) => {
			if (!isCollapseControlled) {
				setDesktopExpanded(!collapsed);
			}
			onDesktopCollapsedChange?.(collapsed);
		},
		[isCollapseControlled, onDesktopCollapsedChange],
	);

	const toggleDesktop = useCallback(
		() => setDesktopCollapsed(!desktopCollapsed),
		[setDesktopCollapsed, desktopCollapsed],
	);
	const collapseDesktop = useCallback(
		() => setDesktopCollapsed(true),
		[setDesktopCollapsed],
	);
	const expandDesktop = useCallback(
		() => setDesktopCollapsed(false),
		[setDesktopCollapsed],
	);

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
			onNavigate,
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
			onNavigate,
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
						? {
								width: asideWidth,
								breakpoint: asideBreakpoint,
								collapsed: { mobile: true },
							}
						: undefined
				}
				footer={footer ? { height: footerHeight } : undefined}
				layout={layout}
				padding={padding}
				withBorder={withBorder}
				transitionDuration={transitionDuration}
			>
				{header && (
					<AppShell.Header
						className={classNames?.header}
						style={styles?.header}
					>
						<Group h="100%" px="md" wrap="nowrap">
							{sidebar && (
								<Burger
									opened={mobileOpened}
									onClick={toggleMobile}
									hiddenFrom={sidebarBreakpoint}
									size="sm"
									aria-label={labels?.toggleNavigation ?? "Toggle navigation"}
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
						className={classNames?.navbar}
						style={styles?.navbar}
					>
						{sidebar}
					</AppShell.Navbar>
				)}

				{aside && (
					<AppShell.Aside
						p="md"
						className={classNames?.aside}
						style={styles?.aside}
					>
						{aside}
					</AppShell.Aside>
				)}

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

				<AppShell.Main
					className={classNames?.main}
					style={styles?.main}
					{...mainProps}
				>
					{children}
				</AppShell.Main>

				{footer && (
					<AppShell.Footer
						p="md"
						className={classNames?.footer}
						style={styles?.footer}
					>
						{footer}
					</AppShell.Footer>
				)}
			</AppShell>
		</NavShellContext.Provider>
	);
}

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
		/>
	);
}
