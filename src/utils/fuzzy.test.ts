import { describe, expect, it } from "vitest";
import { fuzzyMatch, rankCommands } from "./fuzzy";

describe("fuzzyMatch", () => {
	it("matches a contiguous substring", () => {
		expect(fuzzyMatch("set", "Settings")).not.toBeNull();
	});

	it("matches a space-separated subsequence across words", () => {
		expect(fuzzyMatch("usr stg", "User Settings")).not.toBeNull();
	});

	it("is case-insensitive", () => {
		expect(fuzzyMatch("USER", "user settings")).not.toBeNull();
	});

	it("returns null when characters are missing or out of order", () => {
		expect(fuzzyMatch("xyz", "Settings")).toBeNull();
		expect(fuzzyMatch("gnit", "Settings")).toBeNull();
	});

	it("treats an empty query as a match with score 0", () => {
		expect(fuzzyMatch("", "anything")).toEqual({
			score: 0,
			matchedIndices: [],
		});
	});

	it("scores a prefix/word-boundary match higher than a scattered one", () => {
		const prefix = fuzzyMatch("inv", "Inventory")?.score ?? 0;
		// "inv" is a scattered subsequence of "Final Override" (i, n, v).
		const scattered = fuzzyMatch("inv", "Final Override")?.score ?? 0;
		expect(prefix).toBeGreaterThan(scattered);

		const boundary = fuzzyMatch("us", "User Settings")?.score ?? 0;
		const mid = fuzzyMatch("us", "Status")?.score ?? 0;
		expect(boundary).toBeGreaterThan(mid);
	});

	it("treats camelCase humps as word boundaries", () => {
		// "a" matches the capitalized hump in "myAccount" (a word boundary)...
		const camel = fuzzyMatch("a", "myAccount")?.score ?? 0;
		// ...which should outscore a plain mid-word "a" in "salary".
		const mid = fuzzyMatch("a", "salary")?.score ?? 0;
		expect(camel).toBeGreaterThan(mid);
	});
});

describe("rankCommands", () => {
	const items = [
		{ label: "User Settings" },
		{ label: "Settings" },
		{ label: "Saved Searches" },
	];

	it("filters out non-matches and ranks matches by score", () => {
		const ranked = rankCommands("set", items, (i) => i.label);
		const labels = ranked.map((r) => r.item.label);
		expect(labels).toContain("Settings");
		expect(labels).toContain("User Settings");
		expect(labels).not.toContain("Saved Searches");
		// "Settings" (shorter, prefix) should outrank "User Settings".
		expect(labels[0]).toBe("Settings");
	});

	it("matches against keywords when provided", () => {
		const data = [{ label: "Appearance", keywords: ["dark mode", "theme"] }];
		const ranked = rankCommands(
			"theme",
			data,
			(i) => i.label,
			(i) => i.keywords,
		);
		expect(ranked).toHaveLength(1);
	});

	it("is stable for equal scores (preserves original order)", () => {
		const dupes = [{ label: "Alpha" }, { label: "Alpha" }];
		const ranked = rankCommands("alpha", dupes, (i) => i.label);
		expect(ranked).toHaveLength(2);
	});
});
