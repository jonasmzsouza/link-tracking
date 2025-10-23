// eslint.config.js
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import pluginImport from "eslint-plugin-import";

export default [
  js.configs.recommended,
  {
    plugins: {
      import: pluginImport,
    },
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
    env: {
      browser: true,
      node: true,
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": "off",
      "prefer-const": "warn",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
  prettierConfig,
  {
    ignores: ["dist/**/*.js"],
  },
];
