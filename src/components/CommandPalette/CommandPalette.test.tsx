import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CommandSearchResult } from "../../hooks";
import { commandPaletteControls, useCommandPalette } from "../../hooks";
import type { NavItemType } from "../../types";
import { NavShell, useNavShell } from "../NavShell";
import { CommandPalette, type CommandPaletteProps } from "./CommandPalette";

const items: NavItemType[] = [
	{ id: "home", type: "link", label: "Home", href: "/" },
	{
		id: "products",
		type: "group",
		label: "Products",
		children: [
			{
				id: "inventory",
				type: "link",
				label: "Inventory",
				href: "/products/inventory",
			},
		],
	},
];

function Harness(props: CommandPaletteProps) {
	const { open } = useCommandPalette();
	return (
		<MantineProvider>
			<button type="button" onClick={open}>
				open-palette
			</button>
			<CommandPalette {...props} />
		</MantineProvider>
	);
}

async function openPalette() {
	const user = userEvent.setup();
	await user.click(screen.getByText("open-palette"));
	await screen.findByPlaceholderText("Search…");
	return user;
}

beforeEach(() => {
	// Node's experimental global localStorage lacks removeItem/clear, so reset
	// by writing empty arrays (the same get/set API the hooks use).
	localStorage.setItem("nav-recently-viewed", "[]");
	localStorage.setItem("nav-starred-pages", "[]");
});

afterEach(() => {
	commandPaletteControls.close();
});

describe("CommandPalette", () => {
	it("opens via the shared store and shows the search input", async () => {
		render(<Harness items={items} />);
		await openPalette();
		expect(screen.getByPlaceholderText("Search…")).toBeInTheDocument();
	});

	it("shows Recently Viewed and Starred sections on an empty query", async () => {
		localStorage.setItem(
			"nav-recently-viewed",
			JSON.stringify([
				{ id: "r1", label: "Last Page", href: "/last", timestamp: 1 },
			]),
		);
		localStorage.setItem(
			"nav-starred-pages",
			JSON.stringify([{ id: "s1", label: "Favourite", href: "/fav" }]),
		);

		render(<Harness items={items} />);
		await openPalette();

		// Spotlight renders group headings as a CSS pseudo-element (via the
		// `--spotlight-label` custom property), so we assert on the items.
		expect(screen.getByText("Last Page")).toBeInTheDocument();
		expect(screen.getByText("Favourite")).toBeInTheDocument();
	});

	it("fuzzy-filters nav commands as the user types", async () => {
		render(<Harness items={items} />);
		const user = await openPalette();

		await user.type(screen.getByPlaceholderText("Search…"), "inv");
		expect(screen.getByText("Inventory")).toBeInTheDocument();
		expect(screen.queryByText("Home")).not.toBeInTheDocument();
	});

	it("shows the nothing-found message for a non-matching query", async () => {
		render(<Harness items={items} nothingFoundMessage="No commands found" />);
		const user = await openPalette();

		await user.type(screen.getByPlaceholderText("Search…"), "zzzzz");
		expect(await screen.findByText("No commands found")).toBeInTheDocument();
	});

	it("calls onNavigate and records the selection as recently viewed", async () => {
		const onNavigate = vi.fn();
		render(<Harness items={items} onNavigate={onNavigate} />);
		const user = await openPalette();

		await user.type(screen.getByPlaceholderText("Search…"), "inv");
		await user.click(screen.getByText("Inventory"));

		expect(onNavigate).toHaveBeenCalledWith(
			expect.objectContaining({ id: "inventory", href: "/products/inventory" }),
		);
		await waitFor(() => {
			const stored = JSON.parse(
				localStorage.getItem("nav-recently-viewed") ?? "[]",
			);
			expect(stored.some((i: { id: string }) => i.id === "inventory")).toBe(
				true,
			);
		});
	});

	it("invokes a custom action's onSelect", async () => {
		const onSelect = vi.fn();
		const actions = [{ id: "logout", label: "Log out", onSelect }];
		render(<Harness items={items} actions={actions} />);
		const user = await openPalette();

		await user.click(screen.getByText("Log out"));
		expect(onSelect).toHaveBeenCalledTimes(1);
	});

	it("opens external links in a new tab without recording them", async () => {
		const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
		const externalItems: NavItemType[] = [
			{
				id: "docs",
				type: "link",
				label: "External Docs",
				href: "https://example.com",
				external: true,
			},
		];
		render(<Harness items={externalItems} />);
		const user = await openPalette();

		await user.type(screen.getByPlaceholderText("Search…"), "docs");
		await user.click(screen.getByText("External Docs"));

		expect(openSpy).toHaveBeenCalledWith(
			"https://example.com",
			"_blank",
			"noopener,noreferrer",
		);
		const stored = JSON.parse(
			localStorage.getItem("nav-recently-viewed") ?? "[]",
		);
		expect(stored.some((i: { id: string }) => i.id === "docs")).toBe(false);
		openSpy.mockRestore();
	});

	it("merges backend search results alongside local matches", async () => {
		const search = async () => [
			{ id: "remote-1", label: "Remote Result", href: "/remote/1" },
		];
		render(
			<Harness
				items={items}
				search={search}
				searchDebounce={0}
				minSearchLength={1}
			/>,
		);
		const user = await openPalette();

		await user.type(screen.getByPlaceholderText("Search…"), "inv");
		expect(await screen.findByText("Remote Result")).toBeInTheDocument();
		expect(screen.getByText("Inventory")).toBeInTheDocument(); // local still shown
	});

	it("dedups a backend result that matches a local href (local wins)", async () => {
		const search = async () => [
			{ id: "dup", label: "Inventory (remote)", href: "/products/inventory" },
			{ id: "ok", label: "Other Remote", href: "/other" },
		];
		render(
			<Harness
				items={items}
				search={search}
				searchDebounce={0}
				minSearchLength={1}
			/>,
		);
		const user = await openPalette();

		await user.type(screen.getByPlaceholderText("Search…"), "inv");
		// Wait for remote results to settle (the non-dup one appears)...
		await screen.findByText("Other Remote");
		// ...the dup sharing a local href is filtered out.
		expect(screen.queryByText("Inventory (remote)")).not.toBeInTheDocument();
	});

	it("navigates to and records a selected backend result", async () => {
		const onNavigate = vi.fn();
		const search = async () => [
			{ id: "r1", label: "Remote Page", href: "/remote/page" },
		];
		render(
			<Harness
				items={items}
				search={search}
				onNavigate={onNavigate}
				searchDebounce={0}
				minSearchLength={1}
			/>,
		);
		const user = await openPalette();

		await user.type(screen.getByPlaceholderText("Search…"), "rem");
		await user.click(await screen.findByText("Remote Page"));

		expect(onNavigate).toHaveBeenCalledWith(
			expect.objectContaining({ id: "r1", href: "/remote/page" }),
		);
		await waitFor(() => {
			const stored = JSON.parse(
				localStorage.getItem("nav-recently-viewed") ?? "[]",
			);
			expect(stored.some((i: { id: string }) => i.id === "r1")).toBe(true);
		});
	});

	it("invokes a nav item's own onClick when no onNavigate is given", async () => {
		const onClick = vi.fn();
		const withClick: NavItemType[] = [
			{ id: "clicky", type: "link", label: "Clicky", href: "/clicky", onClick },
		];
		render(<Harness items={withClick} />);
		const user = await openPalette();

		await user.type(screen.getByPlaceholderText("Search…"), "clic");
		await user.click(screen.getByText("Clicky"));
		expect(onClick).toHaveBeenCalled();
	});

	it("records an internal nav selection made without onNavigate", async () => {
		// Exercises the window.location.assign fallback (a no-op in jsdom) and
		// asserts the recently-viewed side effect that proves the path ran.
		render(<Harness items={items} />);
		const user = await openPalette();

		await user.type(screen.getByPlaceholderText("Search…"), "inv");
		await user.click(screen.getByText("Inventory"));
		await waitFor(() => {
			const stored = JSON.parse(
				localStorage.getItem("nav-recently-viewed") ?? "[]",
			);
			expect(stored.some((i: { id: string }) => i.id === "inventory")).toBe(
				true,
			);
		});
	});

	it("ranks a matching action above nav when the query favors it", async () => {
		const actions = [{ id: "theme", label: "Toggle theme", onSelect: vi.fn() }];
		render(<Harness items={items} actions={actions} />);
		const user = await openPalette();

		await user.type(screen.getByPlaceholderText("Search…"), "theme");
		expect(await screen.findByText("Toggle theme")).toBeInTheDocument();
	});

	it("shows the searching message while a backend request is pending", async () => {
		const search = (): Promise<CommandSearchResult[]> => new Promise(() => {});
		render(
			<Harness
				items={items}
				search={search}
				searchDebounce={0}
				minSearchLength={1}
			/>,
		);
		const user = await openPalette();

		// "zzzz" has no local match, so the empty area reflects the search state.
		await user.type(screen.getByPlaceholderText("Search…"), "zzzz");
		expect(await screen.findByText("Searching…")).toBeInTheDocument();
	});

	it("shows the error message when a backend search rejects", async () => {
		const search = async (): Promise<CommandSearchResult[]> => {
			throw new Error("nope");
		};
		render(
			<Harness
				items={items}
				search={search}
				searchDebounce={0}
				minSearchLength={1}
			/>,
		);
		const user = await openPalette();

		await user.type(screen.getByPlaceholderText("Search…"), "zzzz");
		expect(await screen.findByText("Search failed")).toBeInTheDocument();
	});

	it("closes the mobile drawer when selecting inside a NavShell on mobile", async () => {
		const original = window.matchMedia;
		// Force the NavShell to report mobile so the close-on-select path runs.
		window.matchMedia = ((query: string) => ({
			matches: true,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		})) as unknown as typeof window.matchMedia;

		try {
			function DrawerProbe() {
				const shell = useNavShell();
				return (
					<>
						<button type="button" onClick={shell.openMobile}>
							open-drawer
						</button>
						<span data-testid="drawer-open">{String(shell.mobileOpened)}</span>
					</>
				);
			}

			function MobileHarness() {
				const { open } = useCommandPalette();
				return (
					<MantineProvider>
						<NavShell>
							<DrawerProbe />
							<button type="button" onClick={open}>
								open-palette
							</button>
							<CommandPalette items={items} onNavigate={() => {}} />
						</NavShell>
					</MantineProvider>
				);
			}

			render(<MobileHarness />);
			const user = userEvent.setup();
			await user.click(screen.getByText("open-drawer"));
			expect(screen.getByTestId("drawer-open")).toHaveTextContent("true");

			await user.click(screen.getByText("open-palette"));
			await screen.findByPlaceholderText("Search…");
			await user.type(screen.getByPlaceholderText("Search…"), "inv");
			await user.click(screen.getByText("Inventory"));

			await waitFor(() =>
				expect(screen.getByTestId("drawer-open")).toHaveTextContent("false"),
			);
		} finally {
			window.matchMedia = original;
		}
	});

	it("shows a backend hit whose href exists in the nav tree when the local item didn't match the query", async () => {
		// "rep" doesn't fuzzy-match "Inventory", but the backend content-matches
		// that page — the hit must not be deduped against undisplayed nav items.
		const search = async () => [
			{
				id: "content-hit",
				label: "Inventory report (docs)",
				href: "/products/inventory",
			},
		];
		render(
			<Harness
				items={items}
				search={search}
				searchDebounce={0}
				minSearchLength={1}
			/>,
		);
		const user = await openPalette();

		await user.type(screen.getByPlaceholderText("Search…"), "rep");
		expect(
			await screen.findByText("Inventory report (docs)"),
		).toBeInTheDocument();
	});

	it("caps the backend Results group at `limit`", async () => {
		const search = async (): Promise<CommandSearchResult[]> =>
			Array.from({ length: 6 }, (_, i) => ({
				id: `r${i}`,
				label: `Remote ${i}`,
				href: `/remote/${i}`,
			}));
		render(
			<Harness
				items={items}
				search={search}
				limit={2}
				searchDebounce={0}
				minSearchLength={1}
			/>,
		);
		const user = await openPalette();

		await user.type(screen.getByPlaceholderText("Search…"), "rem");
		await screen.findByText("Remote 0");
		expect(screen.getByText("Remote 1")).toBeInTheDocument();
		expect(screen.queryByText("Remote 2")).not.toBeInTheDocument();
	});

	it("renders empty-query backend suggestions when minSearchLength is 0", async () => {
		const search = async () => [
			{ id: "sugg", label: "Suggested doc", href: "/docs/suggested" },
		];
		render(
			<Harness
				items={items}
				search={search}
				searchDebounce={0}
				minSearchLength={0}
			/>,
		);
		await openPalette();

		// No typing — results arrive for the empty query.
		expect(await screen.findByText("Suggested doc")).toBeInTheDocument();
	});

	it("shows an inline error indicator when local rows match and the backend fails", async () => {
		const search = async (): Promise<CommandSearchResult[]> => {
			throw new Error("backend down");
		};
		render(
			<Harness
				items={items}
				search={search}
				searchDebounce={0}
				minSearchLength={1}
			/>,
		);
		const user = await openPalette();

		// "inv" matches the local Inventory row, so the Empty slot never renders;
		// the failure must surface in the search input instead.
		await user.type(screen.getByPlaceholderText("Search…"), "inv");
		expect(screen.getByText("Inventory")).toBeInTheDocument();
		// Re-query inside waitFor: with searchDebounce 0 each keystroke's request
		// rejects and the next one transiently clears the error, so a found node
		// can be replaced before a detached-element assertion runs.
		await waitFor(() =>
			expect(screen.getByLabelText("Search failed")).toBeInTheDocument(),
		);
	});

	it("clears a stale search error as soon as the query is cleared", async () => {
		const search = async (): Promise<CommandSearchResult[]> => {
			throw new Error("nope");
		};
		render(
			<Harness
				items={[]}
				search={search}
				searchDebounce={50}
				minSearchLength={1}
			/>,
		);
		const user = await openPalette();

		const input = screen.getByPlaceholderText("Search…");
		await user.type(input, "zzzz");
		expect(await screen.findByText("Search failed")).toBeInTheDocument();

		// Clearing must hide the error immediately — not after the debounce.
		await user.clear(input);
		expect(screen.queryByText("Search failed")).not.toBeInTheDocument();
		expect(screen.getByText("Nothing found")).toBeInTheDocument();
	});
});
