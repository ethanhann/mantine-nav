import { Text } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { NavItemType } from "../../src";
import {
	NavGroup,
	NavHeader,
	NavShell,
	NavSidebar,
	NotificationIndicator,
	WorkspaceSwitcher,
} from "../../src";
import { sampleNotifications, sampleWorkspaces } from "../_data";

/**
 * Every user-facing string is overridable. Components with several strings
 * take a `labels` object, and single-string surfaces take an `aria-label`.
 * This story renders the full shell in German.
 */
const meta: Meta = {
	title: "Customization/Localization",
	tags: ["autodocs"],
	parameters: {
		layout: "fullscreen",
	},
};

export default meta;
type Story = StoryObj;

const germanItems: NavItemType[] = [
	{ id: "start", type: "link", label: "Startseite", href: "/" },
	{
		id: "produkte",
		type: "group",
		label: "Produkte",
		defaultOpened: true,
		children: [
			{ id: "katalog", type: "link", label: "Katalog", href: "/produkte" },
			{ id: "lager", type: "link", label: "Lager", href: "/produkte/lager" },
		],
	},
	{ id: "einstellungen", type: "link", label: "Einstellungen", href: "/e" },
];

/** A fully translated shell: burger, sidebar toggle, tree name, switcher, and notifications. */
export const German: Story = {
	render: () => (
		<NavShell
			labels={{ toggleNavigation: "Menü öffnen" }}
			header={
				<NavHeader
					logo={<Text fw={700}>MeineApp</Text>}
					rightSection={
						<NotificationIndicator
							notifications={sampleNotifications}
							labels={{
								title: "Benachrichtigungen",
								markAllAsRead: "Alle als gelesen markieren",
								empty: "Keine Benachrichtigungen",
								bell: (unread) => `Benachrichtigungen (${unread} ungelesen)`,
							}}
							onReadAll={() => {}}
						/>
					}
				/>
			}
			sidebar={
				<NavSidebar
					labels={{
						collapseSidebar: "Seitenleiste einklappen",
						expandSidebar: "Seitenleiste ausklappen",
					}}
					header={
						<WorkspaceSwitcher
							workspaces={sampleWorkspaces}
							activeWorkspace={sampleWorkspaces[0]!}
							onSwitch={() => {}}
							onCreate={() => {}}
							searchable
							labels={{
								searchPlaceholder: "Arbeitsbereiche suchen...",
								searchAriaLabel: "Arbeitsbereiche suchen",
								emptyMessage: "Keine Arbeitsbereiche gefunden",
								createWorkspace: "Arbeitsbereich erstellen",
								switchWorkspace: (name) =>
									`Arbeitsbereich wechseln, aktuell: ${name}`,
							}}
						/>
					}
				>
					<NavGroup
						items={germanItems}
						currentPath="/"
						aria-label="Hauptnavigation"
					/>
				</NavSidebar>
			}
		>
			<Text p="md">
				Inspizieren Sie die Schaltflächen: alle Beschriftungen sind übersetzt.
			</Text>
		</NavShell>
	),
};
