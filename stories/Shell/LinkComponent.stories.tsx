import { Text } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react";
import {
	IconChartBar,
	IconExternalLink,
	IconFileText,
	IconHome,
	IconSettings,
} from "@tabler/icons-react";
import type React from "react";
import { forwardRef } from "react";
import type { NavItemType } from "../../src";
import { NavGroup, NavHeader, NavShell, NavSidebar } from "../../src";

/**
 * A mock router Link component that simulates SPA navigation.
 * In a real app, this would be Next.js Link or React Router Link.
 */
const MockRouterLink = forwardRef<
	HTMLAnchorElement,
	React.AnchorHTMLAttributes<HTMLAnchorElement>
>((props, ref) => (
	<a
		ref={ref}
		{...props}
		role="link"
		// biome-ignore lint/a11y/useValidAnchor: mock SPA router link for story demo
		onClick={(e) => {
			e.preventDefault();
			// eslint-disable-next-line no-console
			console.log(`[MockRouterLink] SPA navigate to: ${props.href}`);
			props.onClick?.(e);
		}}
		data-router-link
	/>
));
MockRouterLink.displayName = "MockRouterLink";

const meta: Meta<typeof NavShell> = {
	title: "Shell/LinkComponent",
	component: NavShell,
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					'Pass a `linkComponent` to NavShell to inject a router-aware Link component (e.g. Next.js Link or React Router Link). All NavGroup link items will use it automatically. Items with `external: true` bypass the linkComponent and render as plain `<a>` with `target="_blank"`.',
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof NavShell>;

const items: NavItemType[] = [
	{
		id: "home",
		type: "link",
		label: "Home",
		href: "/",
		icon: <IconHome size={18} stroke={1.5} />,
	},
	{
		id: "analytics",
		type: "link",
		label: "Analytics",
		href: "/analytics",
		icon: <IconChartBar size={18} stroke={1.5} />,
	},
	{
		id: "settings",
		type: "link",
		label: "Settings",
		href: "/settings",
		icon: <IconSettings size={18} stroke={1.5} />,
	},
	{ id: "div-1", type: "divider" },
	{
		id: "docs",
		type: "link",
		label: "Documentation",
		href: "https://mantine.dev",
		icon: <IconFileText size={18} stroke={1.5} />,
		external: true,
		badge: <IconExternalLink size={14} />,
	},
];

/** Internal links use the custom `MockRouterLink` (check console for SPA navigation logs). External links open in a new tab. */
export const WithRouterLink: Story = {
	render: () => (
		<NavShell
			linkComponent={MockRouterLink}
			header={
				<NavHeader
					logo={
						<Text fw={700} size="lg">
							SPA App
						</Text>
					}
				/>
			}
			sidebar={
				<NavSidebar>
					<NavGroup items={items} currentPath="/" />
				</NavSidebar>
			}
		>
			<Text size="xl" fw={700} mb="md">
				Dashboard
			</Text>
			<Text>
				Click sidebar links and check the browser console. Internal links log
				&quot;SPA navigate to: ...&quot; while external links open in a new tab.
			</Text>
			<Text mt="sm">
				Inspect the DOM — internal links have a <code>data-router-link</code>{" "}
				attribute from the mock component.
			</Text>
		</NavShell>
	),
};
