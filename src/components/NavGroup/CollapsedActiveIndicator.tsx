export function CollapsedActiveIndicator() {
	return (
		<span
			aria-hidden
			style={{
				position: "absolute",
				insetInlineStart: 0,
				top: "50%",
				transform: "translateY(-50%)",
				width: 3,
				height: "60%",
				borderRadius: 3,
				backgroundColor: "var(--mantine-primary-color-filled)",
			}}
		/>
	);
}
