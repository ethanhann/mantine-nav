import { MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	commandPaletteControls,
	useCommandPalette,
} from "../../hooks/useCommandPalette";
import type { NavItemType } from "../../types";
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
});
