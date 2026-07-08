import { describe, expect, it } from "vitest";
import { matchItem } from "./matchItem";

describe("matchItem", () => {
	it("exact: matches identical paths", () => {
		// Arrange
		const currentPath = "/settings";
		const href = "/settings";

		// Act
		const result = matchItem(currentPath, href, "exact");

		// Assert
		expect(result).toBe(true);
	});

	it("exact: rejects different paths", () => {
		// Arrange
		const currentPath = "/settings/team";
		const href = "/settings";

		// Act
		const result = matchItem(currentPath, href, "exact");

		// Assert
		expect(result).toBe(false);
	});

	it("prefix: matches path and subpaths", () => {
		// Arrange
		const currentPath = "/settings/team";
		const href = "/settings";

		// Act
		const result = matchItem(currentPath, href, "prefix");

		// Assert
		expect(result).toBe(true);
	});

	it("prefix: does not match across word boundaries", () => {
		// Arrange
		const currentPath = "/settings-old";
		const href = "/settings";

		// Act
		const result = matchItem(currentPath, href, "prefix");

		// Assert
		expect(result).toBe(false);
	});

	it("prefix: matches exact path", () => {
		// Arrange
		const currentPath = "/settings";
		const href = "/settings";

		// Act
		const result = matchItem(currentPath, href, "prefix");

		// Assert
		expect(result).toBe(true);
	});

	it("regex: matches with href as regex pattern", () => {
		// Arrange
		const currentPath = "/projects/123";
		const href = "^/projects(/.*)?$";

		// Act
		const result = matchItem(currentPath, href, "regex");

		// Assert
		expect(result).toBe(true);
	});

	it("regex: falls back to exact match on malformed pattern", () => {
		// Arrange
		const href = "/settings?tab=1(";
		const currentPath = href;

		// Act
		const result = matchItem(currentPath, href, "regex");

		// Assert
		expect(result).toBe(true);
	});

	it("RegExp instance: tests currentPath against the pattern", () => {
		// Arrange
		const currentPath = "/projects/456";
		const matcher = /^\/projects(\/.*)?$/;

		// Act
		const result = matchItem(currentPath, "/projects", matcher);

		// Assert
		expect(result).toBe(true);
	});

	it("custom function: receives currentPath and href", () => {
		// Arrange
		const currentPath = "/anything/users";
		const href = "/admin/users";
		const matcher = (current: string, itemHref: string) =>
			current.endsWith(itemHref.split("/").pop()!);

		// Act
		const result = matchItem(currentPath, href, matcher);

		// Assert
		expect(result).toBe(true);
	});

	it("custom function: returns false when function returns false", () => {
		// Arrange
		const matcher = () => false;

		// Act
		const result = matchItem("/a", "/b", matcher);

		// Assert
		expect(result).toBe(false);
	});
});
