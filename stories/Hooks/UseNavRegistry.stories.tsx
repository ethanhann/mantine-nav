import { CodeHighlight } from "@mantine/code-highlight";
import { Button, Text } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react";
import {
	IconChartBar,
	IconClipboardList,
	IconHome,
	IconPackage,
	IconSettings,
	IconUsers,
} from "@tabler/icons-react";
import { useEffect } from "react";
import {
	NavGroup,
	NavHeader,
	NavShell,
	NavSidebar,
	useNavRegistry,
} from "../../src";

const meta: Meta = {
	title: "Hooks/useNavRegistry",
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"The `useNavRegistry` hook enables flat, dot-notation registration of nav items that automatically builds a nested tree. Register items like `products.catalog` from different modules. Intermediate groups are auto-created when a child is registered before its parent.",
			},
		},
	},
};

export default meta;
type Story = StoryObj;

function RegistryDemo() {
	const { items, register } = useNavRegistry();

	useEffect(() => {
		// These could be called from different modules/feature slices
		register("home", {
			type: "link",
			label: "Home",
			href: "/",
			icon: <IconHome size={18} stroke={1.5} />,
			weight: -10,
		});
		register("products", {
			type: "group",
			label: "Products",
			icon: <IconPackage size={18} stroke={1.5} />,
			weight: 10,
		});
		register("products.catalog", {
			type: "link",
			label: "Catalog",
			href: "/products/catalog",
			weight: 10,
		});
		register("products.inventory", {
			type: "link",
			label: "Inventory",
			href: "/products/inventory",
			weight: 20,
		});
		register("products.pricing", {
			type: "link",
			label: "Pricing",
			href: "/products/pricing",
			weight: 30,
		});
		register("orders", {
			type: "group",
			label: "Orders",
			icon: <IconClipboardList size={18} stroke={1.5} />,
			weight: 20,
		});
		register("orders.all", {
			type: "link",
			label: "All Orders",
			href: "/orders",
		});
		register("orders.returns", {
			type: "link",
			label: "Returns",
			href: "/orders/returns",
		});
		register("analytics", {
			type: "link",
			label: "Analytics",
			href: "/analytics",
			icon: <IconChartBar size={18} stroke={1.5} />,
			weight: 30,
		});
		register("settings", {
			type: "link",
			label: "Settings",
			href: "/settings",
			icon: <IconSettings size={18} stroke={1.5} />,
			weight: 100,
		});
	}, [register]);

	const exampleCode = `
register('home', { type: 'link', label: 'Home', ... })
register('products', { type: 'group', label: 'Products', ... })
register('products.catalog', { type: 'link', label: 'Catalog', ... })
register('products.inventory', { type: 'link', label: 'Inventory', ... })
register('products.pricing', { type: 'link', label: 'Pricing', ... })
register('orders.all', { type: 'link', label: 'All Orders', ... })
// 'orders' group auto-created as placeholder
        `;

	return (
		<NavShell
			header={
				<NavHeader
					logo={
						<Text fw={700} size="lg">
							Registry Demo
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
				useNavRegistry
			</Text>
			<Text c="dimmed" mb="sm">
				All nav items above were registered flat using dot-notation IDs and
				assembled into a tree automatically.
			</Text>
			<Text
				c="dimmed"
				size="sm"
				component="pre"
				style={{ fontFamily: "monospace", whiteSpace: "pre-wrap" }}
			></Text>
			<CodeHighlight code={exampleCode} language="typescript" radius="md" />
		</NavShell>
	);
}

/** Items registered flat with dot-notation build a nested sidebar tree. Weight ordering is applied. */
export const FlatRegistration: Story = {
	render: () => <RegistryDemo />,
};

function LazyRegistrationDemo() {
	const { items, register, unregister } = useNavRegistry();
	const [showAdmin, setShowAdmin] = React.useState(false);

	useEffect(() => {
		register("home", {
			type: "link",
			label: "Home",
			href: "/",
			icon: <IconHome size={18} stroke={1.5} />,
		});
		register("analytics", {
			type: "link",
			label: "Analytics",
			href: "/analytics",
			icon: <IconChartBar size={18} stroke={1.5} />,
		});
	}, [register]);

	useEffect(() => {
		if (showAdmin) {
			register("admin", {
				type: "group",
				label: "Admin",
				icon: <IconSettings size={18} stroke={1.5} />,
			});
			register("admin.users", {
				type: "link",
				label: "Users",
				href: "/admin/users",
				icon: <IconUsers size={18} stroke={1.5} />,
			});
			register("admin.settings", {
				type: "link",
				label: "Settings",
				href: "/admin/settings",
			});
		} else {
			unregister("admin");
			unregister("admin.users");
			unregister("admin.settings");
		}
	}, [showAdmin, register, unregister]);

	return (
		<NavShell
			header={
				<NavHeader
					logo={
						<Text fw={700} size="lg">
							Lazy Registration
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
				Dynamic Registration
			</Text>
			<Text c="dimmed" mb="md">
				Items can be registered and unregistered dynamically. Toggle the button
				to add/remove the Admin section.
			</Text>
			<Button onClick={() => setShowAdmin((v) => !v)}>
				{showAdmin ? "Remove Admin Section" : "Add Admin Section"}
			</Button>
		</NavShell>
	);
}

/** Demonstrates dynamic registration and unregistration of nav items at runtime. */
export const DynamicRegistration: Story = {
	render: () => <LazyRegistrationDemo />,
};
