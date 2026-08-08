import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CollapsedActiveIndicator } from "./CollapsedActiveIndicator";

function renderIndicator() {
	const { container } = render(<CollapsedActiveIndicator />);
	return container.querySelector("span") as HTMLElement;
}

describe("CollapsedActiveIndicator", () => {
	it("renders a decorative element hidden from assistive technology", () => {
		// Arrange, Act
		const el = renderIndicator();

		// Assert
		expect(el).not.toBeNull();
		expect(el).toHaveAttribute("aria-hidden", "true");
		expect(el).toBeEmptyDOMElement();
	});

	it("pins itself to the inline start edge, vertically centered", () => {
		// Arrange, Act
		const el = renderIndicator();

		// Assert
		expect(el.style.position).toBe("absolute");
		expect(el.style.getPropertyValue("inset-inline-start")).toBe("0px");
		expect(el.style.top).toBe("50%");
		expect(el.style.transform).toBe("translateY(-50%)");
	});

	it("renders as a thin rounded bar in the primary color", () => {
		// Arrange, Act
		const el = renderIndicator();

		// Assert
		expect(el.style.width).toBe("3px");
		expect(el.style.height).toBe("60%");
		expect(el.style.borderRadius).toBe("3px");
		expect(el.style.backgroundColor).toBe(
			"var(--mantine-primary-color-filled)",
		);
	});
});
