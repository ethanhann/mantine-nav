import { Button, MantineProvider } from "@mantine/core";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { type ContextItem, ContextSwitcher } from "./ContextSwitcher";

function Wrapper({ children }: { children: React.ReactNode }) {
	return <MantineProvider>{children}</MantineProvider>;
}

interface Persona {
	type: string;
	id: string;
}

const personas: ContextItem<Persona>[] = [
	{
		id: "admin:1",
		label: "Admin",
		description: "Acme Corp",
		section: "Organization roles",
		data: { type: "admin", id: "1" },
	},
	{
		id: "personal:2",
		label: "Personal",
		section: "Personal",
		data: { type: "personal", id: "2" },
	},
];

function deferred() {
	let resolve!: () => void;
	let reject!: (err: unknown) => void;
	const promise = new Promise<void>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

describe("ContextSwitcher", () => {
	it("renders the active item's label and description in the trigger", () => {
		render(
			<ContextSwitcher items={personas} active="admin:1" onSelect={() => {}} />,
			{ wrapper: Wrapper },
		);
		expect(screen.getByText("Admin")).toBeInTheDocument();
		expect(screen.getByText("Acme Corp")).toBeInTheDocument();
	});

	it("renders a placeholder when active is null", () => {
		render(
			<ContextSwitcher
				items={personas}
				active={null}
				onSelect={() => {}}
				placeholder="Choose a persona"
			/>,
			{ wrapper: Wrapper },
		);
		expect(screen.getByText("Choose a persona")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Choose a persona" }),
		).toBeInTheDocument();
	});

	it("calls onSelect with the full item including consumer data", async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		render(
			<ContextSwitcher items={personas} active="admin:1" onSelect={onSelect} />,
			{ wrapper: Wrapper },
		);

		await user.click(screen.getByTestId("context-switcher-target"));
		await user.click(
			await screen.findByTestId("context-switcher-item-personal:2"),
		);
		expect(onSelect).toHaveBeenCalledWith(
			expect.objectContaining({
				id: "personal:2",
				data: { type: "personal", id: "2" },
			}),
		);
	});

	it("closes the menu after a sync selection", async () => {
		const user = userEvent.setup();
		render(
			<ContextSwitcher items={personas} active="admin:1" onSelect={() => {}} />,
			{ wrapper: Wrapper },
		);

		const trigger = screen.getByTestId("context-switcher-target");
		await user.click(trigger);
		await user.click(
			await screen.findByTestId("context-switcher-item-personal:2"),
		);
		await waitFor(() =>
			expect(trigger).toHaveAttribute("aria-expanded", "false"),
		);
	});

	it("does not call onSelect when clicking the active item", async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		render(
			<ContextSwitcher items={personas} active="admin:1" onSelect={onSelect} />,
			{ wrapper: Wrapper },
		);

		const trigger = screen.getByTestId("context-switcher-target");
		await user.click(trigger);
		const activeItem = await screen.findByTestId(
			"context-switcher-item-admin:1",
		);
		expect(activeItem).toHaveAttribute("aria-current", "true");
		await user.click(activeItem);
		expect(onSelect).not.toHaveBeenCalled();
		await waitFor(() =>
			expect(trigger).toHaveAttribute("aria-expanded", "false"),
		);
	});

	it("does not call onSelect for disabled items", async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		render(
			<ContextSwitcher
				items={[
					...personas,
					{ id: "locked", label: "Locked persona", disabled: true },
				]}
				active="admin:1"
				onSelect={onSelect}
			/>,
			{ wrapper: Wrapper },
		);

		await user.click(screen.getByTestId("context-switcher-target"));
		const locked = await screen.findByTestId("context-switcher-item-locked");
		expect(locked).toBeDisabled();
		await user.click(locked);
		expect(onSelect).not.toHaveBeenCalled();
	});

	describe("async pending", () => {
		it("shows a loader on the pending item, disables others, and keeps the menu open", async () => {
			const user = userEvent.setup();
			const { promise, resolve } = deferred();
			render(
				<ContextSwitcher
					items={personas}
					active="admin:1"
					onSelect={() => promise}
				/>,
				{ wrapper: Wrapper },
			);

			const trigger = screen.getByTestId("context-switcher-target");
			await user.click(trigger);
			await user.click(
				await screen.findByTestId("context-switcher-item-personal:2"),
			);

			const pendingItem = screen.getByTestId(
				"context-switcher-item-personal:2",
			);
			expect(pendingItem).toHaveAttribute("data-pending", "true");
			// The previously active item is disabled while the switch is in flight
			expect(
				screen.getByTestId("context-switcher-item-admin:1"),
			).toBeDisabled();
			// Not optimistically marked active
			expect(pendingItem).not.toHaveAttribute("aria-current");
			expect(
				screen.getByTestId("context-switcher-item-admin:1"),
			).toHaveAttribute("aria-current", "true");
			// Menu stays open
			expect(trigger).toHaveAttribute("aria-expanded", "true");

			resolve();
			await waitFor(() =>
				expect(trigger).toHaveAttribute("aria-expanded", "false"),
			);
		});

		it("ignores further selections while pending", async () => {
			const user = userEvent.setup();
			const { promise, resolve } = deferred();
			const onSelect = vi.fn(() => promise);
			render(
				<ContextSwitcher items={personas} active={null} onSelect={onSelect} />,
				{ wrapper: Wrapper },
			);

			await user.click(screen.getByTestId("context-switcher-target"));
			await user.click(
				await screen.findByTestId("context-switcher-item-personal:2"),
			);
			await user.click(screen.getByTestId("context-switcher-item-admin:1"));
			expect(onSelect).toHaveBeenCalledTimes(1);
			resolve();
		});

		it("clears pending and keeps the menu open when onSelect rejects", async () => {
			const user = userEvent.setup();
			const { promise, reject } = deferred();
			render(
				<ContextSwitcher
					items={personas}
					active="admin:1"
					onSelect={() => promise}
				/>,
				{ wrapper: Wrapper },
			);

			const trigger = screen.getByTestId("context-switcher-target");
			await user.click(trigger);
			await user.click(
				await screen.findByTestId("context-switcher-item-personal:2"),
			);

			reject(new Error("server said no"));
			await waitFor(() =>
				expect(
					screen.getByTestId("context-switcher-item-personal:2"),
				).not.toHaveAttribute("data-pending"),
			);
			expect(trigger).toHaveAttribute("aria-expanded", "true");
			// Items are selectable again
			expect(
				screen.getByTestId("context-switcher-item-personal:2"),
			).not.toBeDisabled();
		});
	});

	it("filters items by label and description when searchable", async () => {
		const user = userEvent.setup();
		render(
			<ContextSwitcher
				items={personas}
				active={null}
				onSelect={() => {}}
				searchable
			/>,
			{ wrapper: Wrapper },
		);

		await user.click(screen.getByTestId("context-switcher-target"));
		const search = await screen.findByTestId("context-switcher-search");
		await user.type(search, "acme");
		expect(screen.getByText("Admin")).toBeInTheDocument();
		expect(screen.queryByText("Personal")).not.toBeInTheDocument();

		await user.clear(search);
		await user.type(search, "zzz");
		expect(screen.getByTestId("context-switcher-empty")).toBeInTheDocument();
	});

	it("groups items under section labels", async () => {
		const user = userEvent.setup();
		render(
			<ContextSwitcher items={personas} active={null} onSelect={() => {}} />,
			{ wrapper: Wrapper },
		);

		await user.click(screen.getByTestId("context-switcher-target"));
		expect(await screen.findByText("Organization roles")).toBeInTheDocument();
		expect(screen.getByText("Personal", { selector: "div" })).toBeDefined();
	});

	it("renders item badges", async () => {
		const user = userEvent.setup();
		render(
			<ContextSwitcher
				items={[
					{ id: "a", label: "Acme Corp", badge: "3 projects" },
					{ id: "b", label: "Globex" },
				]}
				active={null}
				onSelect={() => {}}
			/>,
			{ wrapper: Wrapper },
		);

		await user.click(screen.getByTestId("context-switcher-target"));
		expect(await screen.findByText("3 projects")).toBeInTheDocument();
	});

	it("supports keyboard navigation and Enter selection", async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		render(
			<ContextSwitcher
				items={[
					{ id: "a", label: "Alpha" },
					{ id: "b", label: "Beta" },
				]}
				active={null}
				onSelect={onSelect}
			/>,
			{ wrapper: Wrapper },
		);

		const trigger = screen.getByTestId("context-switcher-target");
		trigger.focus();
		await user.keyboard("{Enter}");
		await screen.findByText("Alpha");
		await user.keyboard("{ArrowDown}");
		expect(screen.getByTestId("context-switcher-item-a")).toHaveFocus();
		await user.keyboard("{ArrowDown}");
		expect(screen.getByTestId("context-switcher-item-b")).toHaveFocus();
		await user.keyboard("{Enter}");
		expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "b" }));
	});

	it("renders footer actions and calls their handlers", async () => {
		const user = userEvent.setup();
		const onManage = vi.fn();
		render(
			<ContextSwitcher
				items={personas}
				active={null}
				onSelect={() => {}}
				actions={[
					{ id: "manage", label: "Manage workspaces", onClick: onManage },
				]}
			/>,
			{ wrapper: Wrapper },
		);

		await user.click(screen.getByTestId("context-switcher-target"));
		await user.click(
			await screen.findByTestId("context-switcher-action-manage"),
		);
		expect(onManage).toHaveBeenCalled();
	});

	it("renders footer content", async () => {
		const user = userEvent.setup();
		render(
			<ContextSwitcher
				items={personas}
				active={null}
				onSelect={() => {}}
				footer={<div data-testid="custom-footer">Signed in as Jane</div>}
			/>,
			{ wrapper: Wrapper },
		);

		await user.click(screen.getByTestId("context-switcher-target"));
		expect(await screen.findByTestId("custom-footer")).toBeInTheDocument();
	});

	it("supports a custom trigger via renderTarget", async () => {
		const user = userEvent.setup();
		render(
			<ContextSwitcher
				items={personas}
				active={null}
				onSelect={() => {}}
				renderTarget={(active, _opened) => (
					<Button variant="subtle">{active?.label ?? "Choose context"}</Button>
				)}
			/>,
			{ wrapper: Wrapper },
		);

		const trigger = screen.getByRole("button", { name: "Choose context" });
		await user.click(trigger);
		expect(trigger).toHaveAttribute("aria-expanded", "true");
		expect(await screen.findByText("Admin")).toBeInTheDocument();
	});

	it("supports custom item rendering via renderItem", async () => {
		const user = userEvent.setup();
		render(
			<ContextSwitcher
				items={personas}
				active="admin:1"
				onSelect={() => {}}
				renderItem={(item, state) => (
					<span>
						{item.label}
						{state.active ? " (current)" : ""}
					</span>
				)}
			/>,
			{ wrapper: Wrapper },
		);

		await user.click(screen.getByTestId("context-switcher-target"));
		expect(await screen.findByText("Admin (current)")).toBeInTheDocument();
	});
});
