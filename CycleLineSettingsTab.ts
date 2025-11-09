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

		containerEl.createEl("h2", { text: "Cycle Line Settings" });

		const settingDescriptionFragment = document.createDocumentFragment();
		const paragraph = document.createElement("p");
		paragraph.innerHTML = `Automatically increment ordered lists.<br><i>Example</i>:<br><code>1. dog 🐕</code><br><code>2. cat 🐈</code><br><br>If this is disabled, ordered lists will not be automatically incremented.<br><i>Example</i>:<br><code>1. dog 🐕</code><br><code>1. cat 🐈</code><br><br>💡 If this is disabled and ordered lists are still automatically incremented, check the Obsidian setting for "Smart lists" under the "Editor" settings and turn it off.`;
		settingDescriptionFragment.appendChild(paragraph);

		new Setting(containerEl)
			.setName("Auto Increment Ordered Lists")
			.setDesc(settingDescriptionFragment)
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
