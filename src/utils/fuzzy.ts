/**
 * Lightweight fuzzy matcher with ranking — no external dependency.
 *
 * Matches the query as a case-insensitive subsequence of the target. Spaces in
 * the query are treated as soft separators (they reset the "consecutive run"
 * bonus but otherwise allow a free gap), so `"usr stg"` matches `"User Settings"`.
 */

export interface FuzzyResult {
	/** Higher is a better match. */
	score: number;
	/** Indices in the target string that were matched (for optional highlighting). */
	matchedIndices: number[];
}

export interface RankedItem<T> {
	item: T;
	result: FuzzyResult;
}

/** Characters that mark the start of a new "word" inside a target string. */
const BOUNDARY_CHARS = /[\s/_\-.]/;

function isWordBoundary(target: string, idx: number): boolean {
	if (idx <= 0) return true;
	const prev = target[idx - 1] ?? "";
	if (BOUNDARY_CHARS.test(prev)) return true;
	// camelCase boundary: previous char is lower-case, current is upper-case.
	const cur = target[idx] ?? "";
	if (
		prev === prev.toLowerCase() &&
		cur !== cur.toLowerCase() &&
		cur === cur.toUpperCase()
	) {
		return true;
	}
	return false;
}

/**
 * Match `query` against `target`. Returns `null` when there is no match, or a
 * {@link FuzzyResult} with a relative score when there is. An empty query
 * matches everything with a score of 0.
 */
export function fuzzyMatch(query: string, target: string): FuzzyResult | null {
	const trimmed = query.trim();
	if (trimmed === "") return { score: 0, matchedIndices: [] };

	const lowerQ = trimmed.toLowerCase();
	const lowerT = target.toLowerCase();

	const matchedIndices: number[] = [];
	let score = 0;
	let searchFrom = 0;
	let prevMatchIdx = -1;
	let runLength = 0;

	for (let qi = 0; qi < lowerQ.length; qi++) {
		const qc = lowerQ[qi];
		if (qc === " ") {
			// Whitespace resets the consecutive-run bonus but allows a free gap.
			runLength = 0;
			continue;
		}

		let found = -1;
		for (let k = searchFrom; k < lowerT.length; k++) {
			if (lowerT[k] === qc) {
				found = k;
				break;
			}
		}
		if (found === -1) return null;

		matchedIndices.push(found);
		score += 1; // base reward per matched character
		if (isWordBoundary(target, found)) score += 8;

		if (found === prevMatchIdx + 1) {
			runLength += 1;
			score += runLength * 2; // reward consecutive runs
		} else {
			runLength = 1;
		}

		if (prevMatchIdx === -1) {
			score -= Math.min(found, 10) * 0.2; // penalize a late first match
		} else {
			const gap = found - prevMatchIdx - 1;
			score -= Math.min(gap, 10) * 0.5; // penalize gaps between matches
		}

		prevMatchIdx = found;
		searchFrom = found + 1;
	}

	const condensedQ = lowerQ.replace(/\s+/g, "");
	if (lowerT.startsWith(condensedQ)) score += 15; // prefix bonus
	if (lowerT === condensedQ) score += 30; // exact-match bonus

	return { score, matchedIndices };
}

/**
 * Rank and filter `items` against `query`. Each item is scored against its
 * primary text and any keywords (best score wins); non-matches are dropped.
 * Results are sorted by score (desc), then shorter text, then original order
 * (stable).
 */
export function rankCommands<T>(
	query: string,
	items: T[],
	getText: (item: T) => string,
	getKeywords?: (item: T) => string[],
): RankedItem<T>[] {
	const scored: Array<{
		item: T;
		result: FuzzyResult;
		length: number;
		order: number;
	}> = [];

	items.forEach((item, order) => {
		const text = getText(item);
		let best = fuzzyMatch(query, text);

		const keywords = getKeywords?.(item) ?? [];
		for (const keyword of keywords) {
			if (!keyword) continue;
			const result = fuzzyMatch(query, keyword);
			// A keyword match is slightly penalized so a direct label match wins ties.
			if (result && (!best || result.score - 1 > best.score)) {
				best = { score: result.score - 1, matchedIndices: [] };
			}
		}

		if (best) {
			scored.push({ item, result: best, length: text.length, order });
		}
	});

	scored.sort(
		(a, b) =>
			b.result.score - a.result.score ||
			a.length - b.length ||
			a.order - b.order,
	);

	return scored.map(({ item, result }) => ({ item, result }));
}
