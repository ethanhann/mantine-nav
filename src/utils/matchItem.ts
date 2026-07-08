import type { ActiveMatcher } from "../types";

export function matchItem(
	currentPath: string,
	href: string,
	matcher: ActiveMatcher,
): boolean {
	if (typeof matcher === "function" && !(matcher instanceof RegExp)) {
		return matcher(currentPath, href);
	}
	if (matcher instanceof RegExp) {
		return matcher.test(currentPath);
	}
	switch (matcher) {
		case "exact":
			return currentPath === href;
		case "prefix": {
			if (currentPath === href) return true;
			return currentPath.startsWith(`${href}/`);
		}
		case "regex":
			try {
				return new RegExp(href).test(currentPath);
			} catch {
				return currentPath === href;
			}
		default:
			return currentPath === href;
	}
}
