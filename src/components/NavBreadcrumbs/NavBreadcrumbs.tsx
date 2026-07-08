"use client";

import { Breadcrumbs, Group } from "@mantine/core";
import { createElement, type ReactNode } from "react";
import { type BreadcrumbEntry, useNavBreadcrumbs } from "../../hooks";
import type { ActiveMatcher, NavItemType, NavSlotStyles } from "../../types";
import { useOptionalNavShell } from "../NavShell";

export type NavBreadcrumbsSlot = "root" | "item" | "separator" | "currentPage";

export interface NavBreadcrumbsLabels {
	/** @default "Breadcrumb" */
	nav?: string;
}

export interface NavBreadcrumbsProps<TData = unknown>
	extends NavSlotStyles<NavBreadcrumbsSlot> {
	items: NavItemType<TData>[];
	currentPath?: string;
	matcher?: ActiveMatcher;
	rootEntry?: Pick<BreadcrumbEntry<TData>, "label" | "href" | "icon">;
	separator?: ReactNode;
	showIcons?: boolean;
	renderItem?: (entry: BreadcrumbEntry<TData>) => ReactNode;
	labels?: NavBreadcrumbsLabels;
}

function BreadcrumbContent({
	icon,
	label,
}: {
	icon: ReactNode;
	label: string;
}) {
	if (!icon) return <>{label}</>;
	return (
		<Group gap={4} wrap="nowrap">
			{icon}
			<span>{label}</span>
		</Group>
	);
}

export function NavBreadcrumbs<TData = unknown>(
	props: NavBreadcrumbsProps<TData>,
) {
	const {
		items,
		currentPath,
		matcher,
		rootEntry,
		separator,
		showIcons,
		renderItem,
		labels,
		classNames,
		styles,
	} = props;

	const shell = useOptionalNavShell();
	const LinkComponent = shell?.linkComponent ?? "a";
	const hrefProp = shell?.hrefProp ?? "href";

	const { breadcrumbs } = useNavBreadcrumbs({
		items,
		currentPath,
		matcher,
		rootEntry,
	});

	if (breadcrumbs.length === 0) return null;

	return (
		<nav
			aria-label={labels?.nav ?? "Breadcrumb"}
			className={classNames?.root}
			style={styles?.root}
		>
			<Breadcrumbs
				separator={separator}
				separatorMargin="xs"
				classNames={
					classNames?.separator
						? { separator: classNames.separator }
						: undefined
				}
				styles={styles?.separator ? { separator: styles.separator } : undefined}
			>
				{breadcrumbs.map((entry) => {
					if (renderItem) {
						return <span key={entry.id}>{renderItem(entry)}</span>;
					}

					const icon = showIcons ? entry.icon : null;

					if (entry.isCurrentPage) {
						return (
							<span
								key={entry.id}
								aria-current="page"
								className={classNames?.currentPage}
								style={styles?.currentPage}
							>
								<BreadcrumbContent icon={icon} label={entry.label} />
							</span>
						);
					}

					if (entry.href) {
						return createElement(
							LinkComponent,
							{
								key: entry.id,
								[hrefProp]: entry.href,
								className: classNames?.item,
								style: styles?.item,
							},
							<BreadcrumbContent icon={icon} label={entry.label} />,
						);
					}

					return (
						<span
							key={entry.id}
							className={classNames?.item}
							style={styles?.item}
						>
							<BreadcrumbContent icon={icon} label={entry.label} />
						</span>
					);
				})}
			</Breadcrumbs>
		</nav>
	);
}
