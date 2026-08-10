import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PlanBadge } from "./PlanBadge";

function Wrapper({ children }: { children: React.ReactNode }) {
	return <MantineProvider>{children}</MantineProvider>;
}

describe("PlanBadge", () => {
	it("PlanBadge renders plan name", () => {
		render(<PlanBadge plan="Pro" />, { wrapper: Wrapper });
		expect(screen.getByText("Pro")).toBeInTheDocument();
	});

	it("PlanBadge shows upgrade CTA", () => {
		render(<PlanBadge plan="Free" showUpgrade onUpgrade={() => {}} />, {
			wrapper: Wrapper,
		});
		expect(screen.getByText("Upgrade")).toBeInTheDocument();
	});
});
