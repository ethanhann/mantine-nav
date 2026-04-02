import { MantineProvider } from "@mantine/core";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { NavGroup } from "../components/NavGroup";
import { NavHeader } from "../components/NavHeader";
import { NavShell } from "../components/NavShell";
import { NavSidebar } from "../components/NavSidebar";
import { ColorSchemeToggle } from "../components/SaaS/ColorSchemeToggle";
import { UserMenu } from "../components/SaaS/UserMenu";
import { WorkspaceSwitcher } from "../components/SaaS/WorkspaceSwitcher";
import type { NavItemType } from "../types";
import { sampleNavItems, sampleUser, sampleWorkspaces } from "./helpers";

function renderApp(
	opts: {
		items?: NavItemType[];
		currentPath?: string;
		collapsed?: boolean;
		sidebarFooter?: React.ReactNode;
		sidebarHeader?: React.ReactNode;
	} = {},
) {
	const items = opts.items ?? sampleNavItems;
	return render(
		<MantineProvider>
			<NavShell
				header={
					<NavHeader logo={<span>Logo</span>}>
						<span>Center</span>
					</NavHeader>
				}
				sidebar={
					<NavSidebar header={opts.sidebarHeader} footer={opts.sidebarFooter}>
						<NavGroup
							items={items}
							currentPath={opts.currentPath}
							enableKeyboardNav
						/>
					</NavSidebar>
				}
				defaultDesktopCollapsed={opts.collapsed}
			>
				<h1>Page Content</h1>
			</NavShell>
		</MantineProvider>,
	);
}

describe("Accessibility (axe-core)", () => {
	it("full nav shell has no a11y violations", async () => {
		const { container } = renderApp({ currentPath: "/" });
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("nav with active item has no a11y violations", async () => {
		const { container } = renderApp({ currentPath: "/dashboard" });
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("nav with expanded group has no a11y violations", async () => {
		const items: NavItemType[] = [
			{ id: "home", type: "link", label: "Home", href: "/" },
			{
				id: "settings",
				type: "group",
				label: "Settings",
				defaultOpened: true,
				children: [
					{
						id: "general",
						type: "link",
						label: "General",
						href: "/settings/general",
					},
					{
						id: "security",
						type: "link",
						label: "Security",
						href: "/settings/security",
					},
				],
			},
		];
		const { container } = renderApp({
			items,
			currentPath: "/settings/general",
		});
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("nav with section headers and dividers has no a11y violations", async () => {
		const items: NavItemType[] = [
			{ id: "section-1", type: "section", label: "Main" },
			{ id: "home", type: "link", label: "Home", href: "/" },
			{ id: "divider-1", type: "divider" },
			{ id: "section-2", type: "section", label: "Admin" },
			{
				id: "settings",
				type: "link",
				label: "Settings",
				href: "/settings",
			},
		];
		const { container } = renderApp({ items });
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("nav with disabled items has no a11y violations", async () => {
		const items: NavItemType[] = [
			{ id: "home", type: "link", label: "Home", href: "/" },
			{
				id: "disabled",
				type: "link",
				label: "Disabled Link",
				href: "/disabled",
				disabled: true,
			},
		];
		const { container } = renderApp({ items });
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("sidebar with workspace switcher has no a11y violations", async () => {
		const { container } = renderApp({
			sidebarHeader: (
				<WorkspaceSwitcher
					workspaces={sampleWorkspaces}
					activeWorkspace={sampleWorkspaces[0]!}
					onSwitch={() => {}}
				/>
			),
		});
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("sidebar with user menu has no a11y violations", async () => {
		const { container } = renderApp({
			sidebarFooter: (
				<UserMenu
					user={sampleUser}
					menuItems={[{ label: "Profile", onClick: () => {} }]}
				/>
			),
		});
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("sidebar with color scheme toggle has no a11y violations", async () => {
		const { container } = renderApp({
			sidebarFooter: <ColorSchemeToggle />,
		});
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("keyboard focus management produces no a11y violations", async () => {
		const user = userEvent.setup();
		const { container } = renderApp({ currentPath: "/" });

		const tree = container.querySelector('[role="tree"]')!;
		(tree as HTMLElement).focus();
		await user.keyboard("{ArrowDown}");
		await user.keyboard("{ArrowDown}");

		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
