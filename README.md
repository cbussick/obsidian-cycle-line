# Obsidian Cycle Line 🔁

"Cycle Line" is a plugin for [Obsidian](https://obsidian.md/). It allows you to change the line your cursor is currently in by cycling through different options:

1. Normal paragraph

    ```plaintext
    I am a normal paragraph 👋🏻
    ```

2. Unordered list

    ```plaintext
    - I am an unordered list 👋🏻
    ```

3. Checklist (unchecked)

    ```plaintext
    - [] I am an unchecked checklist 👋🏻
    ```

4. Checklist (checked)

    ```plaintext
    - [x] I am an unordered list 👋🏻
    ```

5. Ordered list

    ```plaintext
    1. I am an ordered list 👋🏻
    ```

This plugin is intentionally lightweight and only adds two new commands for you to use:

1. "Cycle forwards"
   This allows you to cycle through the options above _forwards_ one at a time.
2. "Cycle backwards"
   This allows you to cycle through the options _backwards_ one at a time.

💡**Tip**: Add these commands as hotkeys to quickly cycle through the different options. For example:

- "Cycle forwards" -> `Ctrl + Space`
- "Cycle backwards" -> `Ctrl + Shift + Space`

## Manually installing the plugin

Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

## Development set up

For making changes to the source code, you need to:

1. Clone the repository
2. Install the dependencies:

    ```shell
    npm install
    ```

3. Start the esbuild watch mode, which will build the project:

    ```shell
    npm run dev
    ```

4. Make changes 👷🏻
5. You're Done ✅

## Releasing new releases

- Update your `manifest.json` with your new version number, such as `1.0.1`, and the minimum Obsidian version required for your latest release.
- Update your `versions.json` file with `"new-plugin-version": "minimum-obsidian-version"` so older versions of Obsidian can download an older version of your plugin that's compatible.
- Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: https://github.com/obsidianmd/obsidian-sample-plugin/releases
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.
- Publish the release.

> You can simplify the version bump process by running `npm version patch`, `npm version minor` or `npm version major` after updating `minAppVersion` manually in `manifest.json`.
> The command will bump version in `manifest.json` and `package.json`, and add the entry for the new version to `versions.json`
