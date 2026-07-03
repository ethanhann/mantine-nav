"use client";

import {
	ActionIcon,
	Center,
	Menu,
	SegmentedControl,
	Tooltip,
} from "@mantine/core";
import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";
import type { ReactElement, ReactNode } from "react";
import { useNavColorScheme } from "../../hooks/useNavColorScheme";

export interface ColorMode {
	value: string;
	label: string;
	icon: ReactNode;
	onActivate?: () => void;
}

export interface ColorModePickerProps {
	variant?: "toggle" | "segmented" | "menu";
	modes?: ColorMode[];
	value?: string;
	onChange?: (value: string) => void;
	size?: "xs" | "sm" | "md" | "lg" | "xl";
	showLabels?: boolean;
	"aria-label"?: string;
}

const BUILTIN_VALUES = new Set(["light", "dark", "auto"]);

const DEFAULT_MODES: ColorMode[] = [
	{
		value: "auto",
		label: "System",
		icon: <IconDeviceDesktop size={16} stroke={1.5} />,
	},
	{
		value: "light",
		label: "Light",
		icon: <IconSun size={16} stroke={1.5} />,
	},
	{
		value: "dark",
		label: "Dark",
		icon: <IconMoon size={16} stroke={1.5} />,
	},
];

export function ColorModePicker({
	variant = "toggle",
	modes = DEFAULT_MODES,
	value: controlledValue,
	onChange,
	size = "sm",
	showLabels = true,
	"aria-label": ariaLabel = "Color mode",
}: ColorModePickerProps): ReactElement | null {
	const { rawColorScheme, setColorScheme } = useNavColorScheme();

	const activeValue = controlledValue ?? rawColorScheme;

	if (modes.length === 0) return null;

	function handleChange(newValue: string) {
		onChange?.(newValue);

		const mode = modes.find((m) => m.value === newValue);
		if (mode?.onActivate) {
			mode.onActivate();
		}

		if (BUILTIN_VALUES.has(newValue) && controlledValue === undefined) {
			setColorScheme(newValue as "light" | "dark" | "auto");
		}
	}

	if (variant === "toggle") {
		const currentIndex = modes.findIndex((m) => m.value === activeValue);
		const activeMode = currentIndex !== -1 ? modes[currentIndex] : modes[0];
		const nextIndex =
			(currentIndex !== -1 ? currentIndex + 1 : 1) % modes.length;
		const nextMode = modes[nextIndex];

		return (
			<Tooltip label={activeMode?.label}>
				<ActionIcon
					variant="subtle"
					size={size}
					color="gray"
					onClick={() => {
						if (nextMode) handleChange(nextMode.value);
					}}
					aria-label={`${activeMode?.label}, switch to ${nextMode?.label}`}
				>
					{activeMode?.icon}
				</ActionIcon>
			</Tooltip>
		);
	}

	if (variant === "menu") {
		const activeMode = modes.find((m) => m.value === activeValue) ?? modes[0];

		return (
			<Menu shadow="md" width={160}>
				<Menu.Target>
					<Tooltip label={ariaLabel}>
						<ActionIcon
							variant="subtle"
							size={size}
							color="gray"
							aria-label={ariaLabel}
						>
							{activeMode?.icon}
						</ActionIcon>
					</Tooltip>
				</Menu.Target>
				<Menu.Dropdown>
					{modes.map((mode) => (
						<Menu.Item
							key={mode.value}
							leftSection={mode.icon}
							onClick={() => handleChange(mode.value)}
							style={
								mode.value === activeValue ? { fontWeight: 600 } : undefined
							}
						>
							{mode.label}
						</Menu.Item>
					))}
				</Menu.Dropdown>
			</Menu>
		);
	}

	const segmentData = modes.map((mode) => ({
		value: mode.value,
		label: (
			<Center style={{ gap: 6 }} aria-label={mode.label}>
				{mode.icon}
				{showLabels && <span>{mode.label}</span>}
			</Center>
		),
	}));

	return (
		<SegmentedControl
			value={activeValue}
			onChange={handleChange}
			data={segmentData}
			size={size}
			aria-label={ariaLabel}
		/>
	);
}
