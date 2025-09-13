/**
 * Takes a possibly mixed indentation (i.e. tabs and spaces) and normalizes it so that it only consists of spaces.
 *
 * **Note**: Obsidian currently *always* has a tab be equal to four spaces. Maybe this might change in the future and causes problems with this function.
 */
export const normalizeIndentation = (
	indentation: string,
	tabSize = 4,
): string => {
	return indentation.replace(/\t/g, " ".repeat(tabSize));
};
