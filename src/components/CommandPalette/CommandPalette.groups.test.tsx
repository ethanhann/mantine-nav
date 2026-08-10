import { MantineProvider } from "@mantine/core";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { commandPaletteControls, useCommandPalette } from "../../hooks";
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

function groupLabels() {
	return Array.from(
		document.querySelectorAll(".mantine-Spotlight-actionsGroup"),
	).map((el) =>
		(el as HTMLElement).style
			.getPropertyValue("--spotlight-label")
			.replace(/^'|'$/g, ""),
	);
}

function actionLabels() {
	return Array.from(
		document.querySelectorAll(".mantine-Spotlight-actionLabel"),
	).map((el) => el.textContent);
}

function seedRecent(entries: Array<{ id: string; label: string }>) {
	localStorage.setItem(
		"nav-recently-viewed",
		JSON.stringify(
			entries.map((e, i) => ({
				id: e.id,
				label: e.label,
				href: `/${e.id}`,
				timestamp: 1000 - i,
			})),
		),
	);
}

beforeEach(() => {
	localStorage.setItem("nav-recently-viewed", "[]");
	localStorage.setItem("nav-starred-pages", "[]");
});

afterEach(async () => {
	await act(() => {
		commandPaletteControls.close();
	});
});

describe("CommandPalette group headings", () => {
	it("uses the default headings", async () => {
		// Arrange
		seedRecent([{ id: "a", label: "Alpha" }]);
		localStorage.setItem(
			"nav-starred-pages",
			JSON.stringify([{ id: "s", label: "Starred Page", href: "/s" }]),
		);
		render(
			<Harness
				items={items}
				actions={[{ id: "act", label: "Do Thing", onSelect: () => {} }]}
			/>,
		);

		// Act
		await openPalette();

		// Assert
		expect(groupLabels()).toEqual([
			"Recently Viewed",
			"Starred",
			"Actions",
			"Pages",
		]);
	});

	it("honors overridden headings", async () => {
		// Arrange
		render(
			<Harness
				items={items}
				actions={[{ id: "act", label: "Do Thing", onSelect: () => {} }]}
				labels={{ pages: "Seiten", actions: "Aktionen" }}
			/>,
		);

		// Act
		await openPalette();

		// Assert
		expect(groupLabels()).toEqual(["Aktionen", "Seiten"]);
	});

	it("renders no Pages group without items", async () => {
		// Arrange
		render(<Harness />);

		// Act
		await openPalette();

		// Assert
		expect(groupLabels()).toEqual([]);
	});
});

describe("CommandPalette empty query groups", () => {
	it("caps the recent list at recentLimit", async () => {
		// Arrange
		seedRecent(
			Array.from({ length: 6 }, (_, i) => ({
				id: `r${i}`,
				label: `Recent ${i}`,
			})),
		);
		render(<Harness recentLimit={4} />);

		// Act
		await openPalette();

		// Assert
		expect(actionLabels()).toHaveLength(4);
	});

	it("hides the recent group when disabled", async () => {
		// Arrange
		seedRecent([{ id: "a", label: "Alpha" }]);
		render(<Harness showRecent={false} />);

		// Act
		await openPalette();

		// Assert
		expect(groupLabels()).toEqual([]);
	});

	it("treats a whitespace query as empty", async () => {
		// Arrange
		seedRecent([{ id: "a", label: "Alpha" }]);
		render(<Harness items={items} />);
		const user = await openPalette();

		// Act
		await user.type(screen.getByPlaceholderText("Search…"), "   ");

		// Assert
		expect(groupLabels()).toEqual(["Recently Viewed", "Pages"]);
	});

	it("reads recent entries from a custom storage key", async () => {
		// Arrange
		localStorage.setItem(
			"custom-recent",
			JSON.stringify([
				{ id: "x", label: "From Custom Key", href: "/x", timestamp: 1 },
			]),
		);
		render(<Harness storageKeys={{ recent: "custom-recent" }} />);

		// Act
		await openPalette();

		// Assert
		expect(actionLabels()).toEqual(["From Custom Key"]);
	});
});

describe("CommandPalette descriptions", () => {
	it("describes a nested page by its ancestor path", async () => {
		// Arrange
		render(<Harness items={items} />);

		// Act
		await openPalette();

		// Assert
		const descriptions = Array.from(
			document.querySelectorAll(".mantine-Spotlight-actionDescription"),
		).map((el) => el.textContent);
		// Home is top level so it has no path; Inventory is described by its group.
		expect(descriptions).toEqual(["", "Products"]);
	});
});

describe("CommandPalette ranking order", () => {
	const actions = [
		{ id: "zoom", label: "Zoom Settings", onSelect: () => {} },
		{
			id: "theme",
			label: "Toggle Theme",
			description: "switch appearance",
			keywords: ["dark"],
			onSelect: () => {},
		},
	];

	it("leads with Pages when a page matches best", async () => {
		// Arrange
		render(<Harness items={items} actions={actions} />);
		const user = await openPalette();

		// Act
		await user.type(screen.getByPlaceholderText("Search…"), "invent");

		// Assert
		expect(groupLabels()[0]).toBe("Pages");
	});

	it("leads with Actions when an action matches best", async () => {
		// Arrange
		render(<Harness items={items} actions={actions} />);
		const user = await openPalette();

		// Act
		await user.type(screen.getByPlaceholderText("Search…"), "zoom");

		// Assert
		expect(groupLabels()[0]).toBe("Actions");
	});

	it("matches an action by its description", async () => {
		// Arrange
		render(<Harness actions={actions} />);
		const user = await openPalette();

		// Act
		await user.type(screen.getByPlaceholderText("Search…"), "appearance");

		// Assert
		expect(actionLabels()).toEqual(["Toggle Theme"]);
	});

	it("matches an action by a keyword", async () => {
		// Arrange
		render(<Harness actions={actions} />);
		const user = await openPalette();

		// Act
		await user.type(screen.getByPlaceholderText("Search…"), "dark");

		// Assert
		expect(actionLabels()).toEqual(["Toggle Theme"]);
	});

	it("matches a page by its ancestor group name", async () => {
		// Arrange
		render(<Harness items={items} />);
		const user = await openPalette();

		// Act
		await user.type(screen.getByPlaceholderText("Search…"), "products");

		// Assert
		expect(actionLabels()).toContain("Inventory");
	});

	it("caps each group at the limit", async () => {
		// Arrange
		const many: NavItemType[] = Array.from({ length: 6 }, (_, i) => ({
			id: `p${i}`,
			type: "link",
			label: `Page ${i}`,
			href: `/p${i}`,
		}));
		render(<Harness items={many} limit={2} />);
		const user = await openPalette();

		// Act
		await user.type(screen.getByPlaceholderText("Search…"), "page");

		// Assert
		expect(actionLabels()).toHaveLength(2);
	});
});

describe("CommandPalette query lifecycle", () => {
	it("clears the query when the palette closes", async () => {
		// Arrange
		render(<Harness items={items} />);
		const user = await openPalette();
		await user.type(screen.getByPlaceholderText("Search…"), "invent");

		// Act
		await act(() => {
			commandPaletteControls.close();
		});
		await openPalette();

		// Assert
		expect(screen.getByPlaceholderText("Search…")).toHaveValue("");
	});
});

describe("CommandPalette group ordering with both groups matching", () => {
	const pages: NavItemType[] = [
		{ id: "zoom", type: "link", label: "Zoom", href: "/zoom" },
	];

	it("leads with Pages when the page scores higher", async () => {
		// Arrange
		render(
			<Harness
				items={pages}
				actions={[{ id: "a", label: "Zoom Settings", onSelect: () => {} }]}
			/>,
		);
		const user = await openPalette();

		// Act
		await user.type(screen.getByPlaceholderText("Search…"), "zoom");

		// Assert
		expect(groupLabels()).toEqual(["Pages", "Actions"]);
	});

	it("leads with Actions when the action scores higher", async () => {
		// Arrange
		render(
			<Harness
				items={[
					{ id: "zs", type: "link", label: "Zoom Settings", href: "/zs" },
				]}
				actions={[{ id: "a", label: "Zoom", onSelect: () => {} }]}
			/>,
		);
		const user = await openPalette();

		// Act
		await user.type(screen.getByPlaceholderText("Search…"), "zoom");

		// Assert
		expect(groupLabels()).toEqual(["Actions", "Pages"]);
	});

	it("keeps Pages ahead of Actions on a tie", async () => {
		// Arrange
		render(
			<Harness
				items={pages}
				actions={[{ id: "a", label: "Zoom", onSelect: () => {} }]}
			/>,
		);
		const user = await openPalette();

		// Act
		await user.type(screen.getByPlaceholderText("Search…"), "zoom");

		// Assert
		expect(groupLabels()).toEqual(["Pages", "Actions"]);
	});
});

describe("CommandPalette stored entries", () => {
	it("gives recent entries no path description", async () => {
		// Arrange
		seedRecent([{ id: "a", label: "Alpha" }]);
		render(<Harness />);

		// Act
		await openPalette();

		// Assert
		const descriptions = Array.from(
			document.querySelectorAll(".mantine-Spotlight-actionDescription"),
		).map((el) => el.textContent);
		expect(descriptions).toEqual([""]);
	});

	it("gives starred entries no path description", async () => {
		// Arrange
		localStorage.setItem(
			"nav-starred-pages",
			JSON.stringify([{ id: "s", label: "Starred Page", href: "/s" }]),
		);
		render(<Harness showRecent={false} />);

		// Act
		await openPalette();

		// Assert
		const descriptions = Array.from(
			document.querySelectorAll(".mantine-Spotlight-actionDescription"),
		).map((el) => el.textContent);
		expect(descriptions).toEqual([""]);
	});

	it("reads starred entries from a custom storage key", async () => {
		// Arrange
		localStorage.setItem(
			"custom-starred",
			JSON.stringify([{ id: "x", label: "Custom Starred", href: "/x" }]),
		);
		render(
			<Harness
				showRecent={false}
				storageKeys={{ starred: "custom-starred" }}
			/>,
		);

		// Act
		await openPalette();

		// Assert
		expect(actionLabels()).toEqual(["Custom Starred"]);
	});
});

describe("CommandPalette selection side effects", () => {
	it("opens an external command in a new tab", async () => {
		// Arrange
		const open = vi.spyOn(window, "open").mockReturnValue(null);
		render(
			<Harness
				items={[
					{
						id: "ext",
						type: "link",
						label: "External Docs",
						href: "https://docs.test",
						external: true,
					},
				]}
			/>,
		);
		const user = await openPalette();

		// Act
		await user.click(screen.getByText("External Docs"));

		// Assert
		expect(open).toHaveBeenCalledWith(
			"https://docs.test",
			"_blank",
			"noopener,noreferrer",
		);
		open.mockRestore();
	});

	it("records a selected page in recently viewed", async () => {
		// Arrange
		render(<Harness items={items} />);
		const user = await openPalette();

		// Act
		await user.click(screen.getByText("Home"));

		// Assert
		expect(localStorage.getItem("nav-recently-viewed")).toContain(
			'"id":"home"',
		);
	});

	it("records nothing when recordRecent is off", async () => {
		// Arrange
		render(<Harness items={items} recordRecent={false} />);
		const user = await openPalette();

		// Act
		await user.click(screen.getByText("Home"));

		// Assert
		expect(localStorage.getItem("nav-recently-viewed")).toBe("[]");
	});

	it("does not record an external command", async () => {
		// Arrange
		const open = vi.spyOn(window, "open").mockReturnValue(null);
		render(
			<Harness
				items={[
					{
						id: "ext",
						type: "link",
						label: "External Docs",
						href: "https://docs.test",
						external: true,
					},
				]}
			/>,
		);
		const user = await openPalette();

		// Act
		await user.click(screen.getByText("External Docs"));

		// Assert
		expect(localStorage.getItem("nav-recently-viewed")).toBe("[]");
		open.mockRestore();
	});
});

describe("CommandPalette backend search failures", () => {
	it("labels the error indicator with the default message", async () => {
		// Arrange
		const search = async () => {
			throw new Error("boom");
		};
		render(<Harness search={search} searchDebounce={0} minSearchLength={1} />);
		const user = await openPalette();

		// Act
		await user.type(screen.getByPlaceholderText("Search…"), "inv");

		// Assert
		await waitFor(() =>
			expect(screen.getByLabelText("Search failed")).toBeInTheDocument(),
		);
	});

	it("labels the error indicator with a custom message", async () => {
		// Arrange
		const search = async () => {
			throw new Error("boom");
		};
		render(
			<Harness
				search={search}
				searchDebounce={0}
				minSearchLength={1}
				searchErrorMessage="Suche fehlgeschlagen"
			/>,
		);
		const user = await openPalette();

		// Act
		await user.type(screen.getByPlaceholderText("Search…"), "inv");

		// Assert
		await waitFor(() =>
			expect(screen.getByLabelText("Suche fehlgeschlagen")).toBeInTheDocument(),
		);
	});
});
