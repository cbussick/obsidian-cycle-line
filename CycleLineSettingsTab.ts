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
		paragraph.innerHTML = `Automatically increment numbered lists.<br>E.g.:<br><code>1. dog</code><br><code>2. cat</code><br><br>If not enabled, the list will not be automatically incremented.<br>E.g.<br><code>1. dog</code><br><code>1. cat</code><br><br> If this is disabled and the lists are still automaticaly incremented, check the Obsidian setting for "Smart lists" and turn it off.`;
		settingDescriptionFragment.appendChild(paragraph);

		new Setting(containerEl)
			.setName("Auto Increment Numbered List")
			.setDesc(settingDescriptionFragment)
			.addToggle((toggle: ToggleComponent) => {
				toggle
					.setValue(this.plugin.settings.autoIncrementNumberedList)
					.onChange(async (value) => {
						this.plugin.settings.autoIncrementNumberedList = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
