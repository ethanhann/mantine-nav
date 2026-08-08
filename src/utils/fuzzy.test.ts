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

describe("fuzzyMatch scoring", () => {
	it("scores a prefix match with a consecutive run", () => {
		// Arrange, Act
		const result = fuzzyMatch("set", "Settings");

		// Assert
		expect(result).toEqual({ score: 38, matchedIndices: [0, 1, 2] });
	});

	it("adds both the prefix and exact-match bonuses for a full match", () => {
		// Arrange, Act
		const result = fuzzyMatch("settings", "Settings");

		// Assert
		expect(result).toEqual({
			score: 133,
			matchedIndices: [0, 1, 2, 3, 4, 5, 6, 7],
		});
	});

	it("scores a single boundary character", () => {
		// Arrange, Act
		const result = fuzzyMatch("s", "Settings");

		// Assert
		expect(result).toEqual({ score: 26, matchedIndices: [0] });
	});

	it("treats spaces as free gaps that reset the run bonus", () => {
		// Arrange, Act
		const result = fuzzyMatch("usr stg", "User Settings");

		// Assert
		expect(result).toEqual({ score: 25, matchedIndices: [0, 1, 3, 5, 7, 11] });
	});

	it("penalizes a mid-word first match", () => {
		// Arrange, Act
		const result = fuzzyMatch("us", "Status");

		// Assert
		expect(result).toEqual({ score: 5.2, matchedIndices: [4, 5] });
	});

	it("treats a camelCase hump as a word boundary", () => {
		// Arrange, Act
		const result = fuzzyMatch("a", "myAccount");

		// Assert
		expect(result).toEqual({ score: 8.6, matchedIndices: [2] });
	});

	it("does not treat a run of capitals as a boundary", () => {
		// Arrange, Act
		const result = fuzzyMatch("p", "APIKey");

		// Assert
		expect(result).toEqual({ score: 0.8, matchedIndices: [1] });
	});

	it("caps the late-first-match penalty at ten characters", () => {
		// Arrange, Act
		const result = fuzzyMatch("z", "aaaaaaaaaaaaz");

		// Assert
		expect(result).toEqual({ score: -1, matchedIndices: [12] });
	});

	it("caps the gap penalty at ten characters", () => {
		// Arrange, Act
		const result = fuzzyMatch("az", "aaaaaaaaaaaaaz");

		// Assert
		expect(result).toEqual({ score: 7, matchedIndices: [0, 13] });
	});

	it("treats a character after a separator as a word boundary", () => {
		// Arrange, Act
		const result = fuzzyMatch("t", "my-thing");

		// Assert
		expect(result).toEqual({ score: 8.4, matchedIndices: [3] });
	});

	it("does not treat a digit after a letter as a word boundary", () => {
		// Arrange, Act
		const result = fuzzyMatch("1", "item1");

		// Assert
		expect(result?.matchedIndices).toEqual([4]);
		expect(result?.score).toBeCloseTo(0.2, 10);
	});

	it("applies the prefix and exact bonuses to the space-stripped query", () => {
		// Arrange, Act
		const result = fuzzyMatch("us er", "User");

		// Assert
		expect(result).toEqual({ score: 69, matchedIndices: [0, 1, 2, 3] });
	});

	it("returns a distinct empty result for a whitespace-only query", () => {
		// Arrange, Act
		const result = fuzzyMatch("   ", "Settings");

		// Assert
		expect(result).toEqual({ score: 0, matchedIndices: [] });
	});
});

describe("rankCommands ordering", () => {
	it("ranks by score with exact values", () => {
		// Arrange
		const items = [
			{ label: "User Settings" },
			{ label: "Settings" },
			{ label: "Saved Searches" },
		];

		// Act
		const ranked = rankCommands("set", items, (i) => i.label);

		// Assert
		expect(ranked.map((r) => [r.item.label, r.result.score])).toEqual([
			["Settings", 38],
			["User Settings", 4.8],
		]);
	});

	it("puts a higher score ahead of a shorter label", () => {
		// Arrange
		const items = [{ label: "Status" }, { label: "User Settings" }];

		// Act
		const ranked = rankCommands("us", items, (i) => i.label);

		// Assert
		expect(ranked.map((r) => r.item.label)).toEqual([
			"User Settings",
			"Status",
		]);
	});

	it("breaks a score tie with the shorter label", () => {
		// Arrange
		const items = [{ label: "Alphaa" }, { label: "Alph" }];

		// Act
		const ranked = rankCommands("al", items, (i) => i.label);

		// Assert
		expect(ranked.map((r) => [r.item.label, r.result.score])).toEqual([
			["Alph", 31],
			["Alphaa", 31],
		]);
	});

	it("preserves input order when score and length both tie", () => {
		// Arrange
		const items = [
			{ label: "Alpha", id: 1 },
			{ label: "Alpha", id: 2 },
		];

		// Act
		const ranked = rankCommands("alpha", items, (i) => i.label);

		// Assert
		expect(ranked.map((r) => r.item.id)).toEqual([1, 2]);
	});
});

describe("rankCommands keywords", () => {
	it("scores a keyword-only match one below the keyword score", () => {
		// Arrange
		const items = [{ label: "Appearance", keywords: ["dark mode", "theme"] }];

		// Act
		const ranked = rankCommands(
			"theme",
			items,
			(i) => i.label,
			(i) => i.keywords,
		);

		// Assert
		expect(ranked).toHaveLength(1);
		expect(ranked[0]?.result).toEqual({ score: 87, matchedIndices: [] });
	});

	it("lets a label match win a tie against an identical keyword", () => {
		// Arrange
		const items = [{ label: "Theme", keywords: ["Theme"] }];

		// Act
		const ranked = rankCommands(
			"theme",
			items,
			(i) => i.label,
			(i) => i.keywords,
		);

		// Assert
		expect(ranked[0]?.result.matchedIndices).toEqual([0, 1, 2, 3, 4]);
	});

	it("lets a strong keyword override a weaker label match", () => {
		// Arrange
		const items = [{ label: "Theme Zzz", keywords: ["theme"] }];

		// Act
		const ranked = rankCommands(
			"theme",
			items,
			(i) => i.label,
			(i) => i.keywords,
		);

		// Assert
		expect(ranked[0]?.result).toEqual({ score: 87, matchedIndices: [] });
	});

	it("drops items when neither the label nor any keyword matches", () => {
		// Arrange
		const items = [{ label: "Alpha" }];

		// Act
		const ranked = rankCommands("stryker", items, (i) => i.label);

		// Assert
		expect(ranked).toEqual([]);
	});

	it("ignores empty keywords", () => {
		// Arrange
		const items = [{ label: "Alpha", keywords: ["", "beta"] }];

		// Act
		const ranked = rankCommands(
			"beta",
			items,
			(i) => i.label,
			(i) => i.keywords,
		);

		// Assert
		expect(ranked).toHaveLength(1);
	});
});
