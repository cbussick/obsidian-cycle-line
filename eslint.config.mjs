import eslint from "@eslint/js";
import prettier from "eslint-config-prettier";
import { globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config([
	globalIgnores(["node_modules", "main.js"]),
	{
		files: ["**/*.{js,ts}"],
		extends: [
			eslint.configs.recommended,
			tseslint.configs.recommendedTypeChecked,
			tseslint.configs.stylisticTypeChecked,
		],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.node,
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			"no-console": "warn",
		},
	},
	prettier,
]);
