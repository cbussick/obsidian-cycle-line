import { CycleLineSettingsTab } from "CycleLineSettingsTab";
import { normalizeIndentation } from "helpers/normalizeIndentation";
import { Editor, Plugin } from "obsidian";

interface CycleLinePluginSettings {
	// Increment a numbered list line automatically based on the line above.
	autoIncrementNumberedList: boolean;
}

const defaultSettings: CycleLinePluginSettings = {
	autoIncrementNumberedList: true,
};

const bulletListStart = "- ";
const checkListStart = "- [ ] ";
const checkListDoneStart = "- [x] ";
const numberedListStart = /^\d+\. /;

const listOptionPrefixes: (string | RegExp)[] = [
	bulletListStart,
	checkListStart,
	checkListDoneStart,
	numberedListStart,
];

export default class CycleLinePlugin extends Plugin {
	settings: CycleLinePluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "cycle-line",
			name: "Cycle Line",
			editorCallback: (editor: Editor) => {
				const { line: lineNumber, ch: oldCursorPosition } =
					editor.getCursor();

				const oldLineContent = editor.getLine(lineNumber);

				const firstNonWhitespaceCharIndex = oldLineContent.search(/\S/);

				const lineContentWithoutIndentation =
					firstNonWhitespaceCharIndex > -1
						? oldLineContent.slice(firstNonWhitespaceCharIndex)
						: "";

				// Check if the current line is some type of list.
				// If yes, get the index of the current list type inside the list options
				// in order to know which list it should be turned into.
				let oldListOptionsIndex = listOptionPrefixes.findIndex(
					(option) => {
						if (option instanceof RegExp) {
							return option.test(lineContentWithoutIndentation);
						} else {
							return lineContentWithoutIndentation.startsWith(
								option,
							);
						}
					},
				);

				// If the check resulted in it being a bullet list, it could still be a check list (checked and unchecked),
				// since they have the same prefix "- ", so we need to check if it is a check list here.
				if (
					oldListOptionsIndex ===
					listOptionPrefixes.indexOf(bulletListStart)
				) {
					if (
						lineContentWithoutIndentation.startsWith(checkListStart)
					) {
						oldListOptionsIndex =
							listOptionPrefixes.indexOf(checkListStart);
					} else if (
						lineContentWithoutIndentation.startsWith(
							checkListDoneStart,
						)
					) {
						oldListOptionsIndex =
							listOptionPrefixes.indexOf(checkListDoneStart);
					}
				}

				const oldListPrefix = listOptionPrefixes[oldListOptionsIndex];
				let oldListPrefixLength: number;
				let newLineNumberedListPrefix = "1. ";

				const isTurningIntoNumberedList =
					oldListOptionsIndex ===
					listOptionPrefixes.indexOf(numberedListStart) - 1;

				// The indentation.
				// If there is no non-whitespace character, the whole line (i.e. tabs and space characters) is considered the indentation.
				const indentation =
					firstNonWhitespaceCharIndex > -1
						? oldLineContent.slice(0, firstNonWhitespaceCharIndex)
						: oldLineContent;

				if (oldListPrefix instanceof RegExp) {
					// If the line is a numbered list, we need to find the length of the old list prefix.
					// Examples
					// "1." -> length: 3
					// "15." -> length: 4
					const match = numberedListStart.exec(
						lineContentWithoutIndentation,
					);
					oldListPrefixLength = match?.[0].length ?? 0;
				} else {
					oldListPrefixLength = oldListPrefix?.length || 0;

					if (
						isTurningIntoNumberedList &&
						this.settings.autoIncrementNumberedList
					) {
						// If we are turning the line *into* a numbered list, we need to add the correct number.
						// I.e. auto-increment if the line above is also a numbered list line.

						const lineAbove =
							lineNumber > 0
								? editor.getLine(lineNumber - 1)
								: null;
						if (lineAbove) {
							const lineAbovefirstNonWhitespaceCharIndex =
								lineAbove.search(/\S/);
							const lineAboveIndentation = lineAbove.slice(
								0,
								lineAbovefirstNonWhitespaceCharIndex,
							);

							// Transform possibly mixed indentations into spaces and compare them.
							const isSameIndentationAsLineAbove =
								normalizeIndentation(indentation) ===
								normalizeIndentation(lineAboveIndentation);

							if (isSameIndentationAsLineAbove) {
								const lineAboveWithoutIndentation =
									lineAbove.slice(
										lineAbovefirstNonWhitespaceCharIndex,
									);

								const lineAboveNumberedListMatch =
									numberedListStart.exec(
										lineAboveWithoutIndentation,
									);

								if (lineAboveNumberedListMatch !== null) {
									newLineNumberedListPrefix = `${Number.parseInt(lineAboveNumberedListMatch[0].slice(0, -2)) + 1}. `;
								}
							}
						}
					}
				}
				// If the line:
				// - is the last list option, cycle back to a normal paragraph.
				// - is a type of list, turn it into the next type of list.
				// - is not a list (i.e. a "normal" paragraph), make it the first list option.
				const newLineListPrefix = isTurningIntoNumberedList
					? newLineNumberedListPrefix
					: `${
							oldListOptionsIndex ===
							listOptionPrefixes.length - 1
								? ""
								: listOptionPrefixes[oldListOptionsIndex + 1] ||
									listOptionPrefixes[0]
						}`;

				const oldLineContentWithoutIndentationAndListPrefix =
					lineContentWithoutIndentation.slice(oldListPrefixLength);

				const newLineContent = `${indentation}${newLineListPrefix}${oldLineContentWithoutIndentationAndListPrefix}`;

				const characterAmountDifference =
					newLineContent.length - oldLineContent.length;

				// Move the cursor to the new correct position:
				// Take the old position and offset it by how many characters were added/removed.
				const newCursorPosition =
					oldCursorPosition + characterAmountDifference;

				editor.setLine(lineNumber, newLineContent);
				editor.setCursor({
					line: lineNumber,
					ch: newCursorPosition,
				});
			},
		});

		// Add a settings tab for the plugin
		this.addSettingTab(new CycleLineSettingsTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			defaultSettings,
			(await this.loadData()) as CycleLinePluginSettings,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
