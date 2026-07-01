import ts from "typescript-eslint";
import svelte from "eslint-plugin-svelte";
import globals from "globals";

export default ts.config(
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // Kept as warnings during the rewrite; tightened to errors as code is migrated.
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "prefer-const": "warn",
      // Downgraded for the legacy Svelte-4-style components. These are fixed and
      // set back to "error" during the Svelte 5 runes migration.
      "svelte/require-each-key": "warn",
      "svelte/no-unused-svelte-ignore": "warn",
      "svelte/no-immutable-reactive-statements": "warn",
    },
  },
  {
    files: ["**/*.svelte", "**/*.svelte.ts"],
    languageOptions: {
      parserOptions: { parser: ts.parser },
    },
  },
  {
    ignores: [
      ".wxt/",
      ".output/",
      "dist/",
      "node_modules/",
      ".dev/",
      "*.config.js",
      "*.config.ts",
    ],
  }
);
