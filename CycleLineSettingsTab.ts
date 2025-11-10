import CycleLinePlugin from "main";
import { App, PluginSettingTab, Setting, ToggleComponent } from "obsidian";

export class CycleLineSettingsTab extends PluginSettingTab {
	plugin: CycleLinePlugin;

	constructor(app: App, plugin: CycleLinePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		const settingDescription = document.createDocumentFragment();

		// settingDescription.createEl("p", {
		// });

		settingDescription.createEl("p", {
			text: "Enable this to automatically increment ordered lists.",
		});
		settingDescription.createEl("i", { text: "Example:" });

		const incrementedListExample = settingDescription.createEl("ol");
		incrementedListExample.createEl("li", { text: "Dog 🐕" });
		incrementedListExample.createEl("li", { text: "Cat 🐈" });

		settingDescription.createEl("p", {
			text: "If this is disabled, ordered lists will not be automatically incremented.",
		});
		settingDescription.createEl("i", { text: "Example:" });

		const notIncrementedListExample = settingDescription.createEl("ol");
		notIncrementedListExample.createEl("li", {
			text: "Dog 🐕",
			attr: { value: "1" },
		});
		notIncrementedListExample.createEl("li", {
			text: "Cat 🐈",
			attr: { value: "1" },
		});

		settingDescription.createEl("p", {
			text: `💡 If this is disabled and ordered lists are still automatically incremented, check the Obsidian setting for "smart lists" under the "editor"-settings and disable it.`,
		});

		new Setting(containerEl)
			.setName("Automatically increment ordered lists")
			.setDesc(settingDescription)
			.addToggle((toggle: ToggleComponent) => {
				toggle
					.setValue(this.plugin.settings.autoIncrementOrderedList)
					.onChange(async (value) => {
						this.plugin.settings.autoIncrementOrderedList = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
