import { CycleLineSettingsTab } from "CycleLineSettingsTab";
import { normalizeIndentation } from "helpers/normalizeIndentation";
import { Editor, Plugin } from "obsidian";

interface CycleLinePluginSettings {
	autoIncrementOrderedList: boolean;
}

const defaultSettings: CycleLinePluginSettings = {
	autoIncrementOrderedList: true,
};

const unorderedListStart = "- ";
const checklistStart = "- [ ] ";
const checklistDoneStart = "- [x] ";
const orderedListStart = /^\d+\. /;

const listOptionPrefixes: (string | RegExp)[] = [
	unorderedListStart,
	checklistStart,
	checklistDoneStart,
	orderedListStart,
];

export default class CycleLinePlugin extends Plugin {
	settings: CycleLinePluginSettings;

	cycleLine = (listOptionPrefixes: (string | RegExp)[], editor: Editor) => {
		const { line: lineNumber, ch: oldCursorPosition } = editor.getCursor();

		const oldLineContent = editor.getLine(lineNumber);

		const firstNonWhitespaceCharIndex = oldLineContent.search(/\S/);

		const lineContentWithoutIndentation =
			firstNonWhitespaceCharIndex > -1
				? oldLineContent.slice(firstNonWhitespaceCharIndex)
				: "";

		// Check if the current line is some type of list.
		// If yes, get the index of the current list type inside the list options
		// in order to know which list it should be turned into.
		let oldListOptionsIndex = listOptionPrefixes.findIndex((option) => {
			if (option instanceof RegExp) {
				// If it is a regular expression, it can *only* be an ordered list.
				return option.test(lineContentWithoutIndentation);
			} else {
				return lineContentWithoutIndentation.startsWith(option);
			}
		});

		// If the check resulted in it being an unordered list, it could still be a checklist (checked and unchecked),
		// since they have the same prefix "- ", so we need to furthermore check if it is a check list here.
		if (
			oldListOptionsIndex ===
			listOptionPrefixes.indexOf(unorderedListStart)
		) {
			if (lineContentWithoutIndentation.startsWith(checklistStart)) {
				oldListOptionsIndex =
					listOptionPrefixes.indexOf(checklistStart);
			} else if (
				lineContentWithoutIndentation.startsWith(checklistDoneStart)
			) {
				oldListOptionsIndex =
					listOptionPrefixes.indexOf(checklistDoneStart);
			}
		}

		const oldListPrefix = listOptionPrefixes[oldListOptionsIndex];
		let oldListPrefixLength: number;
		let newLineOrderedListPrefix = "1. ";

		const isTurningIntoOrderedList =
			oldListOptionsIndex ===
			listOptionPrefixes.indexOf(orderedListStart) - 1;

		// The indentation.
		// If there is no non-whitespace character, the whole line (i.e. tabs and space characters) is considered the indentation.
		const indentation =
			firstNonWhitespaceCharIndex > -1
				? oldLineContent.slice(0, firstNonWhitespaceCharIndex)
				: oldLineContent;

		if (oldListPrefix instanceof RegExp) {
			// If the line is an ordered list, we need to find the length of the old list prefix.
			// Examples
			// "1. " -> length: 3
			// "15. " -> length: 4
			const match = orderedListStart.exec(lineContentWithoutIndentation);
			oldListPrefixLength = match?.[0].length ?? 0;
		} else {
			oldListPrefixLength = oldListPrefix?.length || 0;

			if (
				isTurningIntoOrderedList &&
				this.settings.autoIncrementOrderedList
			) {
				// If we are turning the line *into* an ordered list and the setting is enabled, we need to add the correct number.
				// I.e. auto-increment if the line above is also an ordered list line.

				const lineAbove =
					lineNumber > 0 ? editor.getLine(lineNumber - 1) : null;
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
						const lineAboveWithoutIndentation = lineAbove.slice(
							lineAbovefirstNonWhitespaceCharIndex,
						);

						const lineAboveOrderedListMatch = orderedListStart.exec(
							lineAboveWithoutIndentation,
						);

						if (lineAboveOrderedListMatch !== null) {
							newLineOrderedListPrefix = `${Number.parseInt(lineAboveOrderedListMatch[0].slice(0, -2)) + 1}. `;
						}
					}
				}
			}
		}
		// If the line ...
		// - is the last list option, cycle back to a normal paragraph.
		// - is some other type of list, turn it into the next type of list.
		// - is not a list (i.e. a normal paragraph), make it the first list option.
		const newLineListPrefix = isTurningIntoOrderedList
			? newLineOrderedListPrefix
			: `${
					oldListOptionsIndex === listOptionPrefixes.length - 1
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
		// Take the old cursor position and offset it by how many characters were added/removed.
		const newCursorPosition = oldCursorPosition + characterAmountDifference;

		editor.setLine(lineNumber, newLineContent);
		editor.setCursor({
			line: lineNumber,
			ch: newCursorPosition,
		});
	};

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "cycle-forwards",
			name: "Cycle forwards",
			editorCallback: (editor: Editor) => {
				this.cycleLine(listOptionPrefixes, editor);
			},
		});

		this.addCommand({
			id: "cycle-backwards",
			name: "Cycle backwards",
			editorCallback: (editor: Editor) => {
				this.cycleLine([...listOptionPrefixes].reverse(), editor);
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
