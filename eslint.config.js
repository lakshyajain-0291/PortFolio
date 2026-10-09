import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-unused-vars": "off",
      // The stored portfolio JSON is loosely typed and the data layer
      // (portfolioStorage, PortfolioContext, githubService) is intentionally
      // left untouched — surface `any` as a warning rather than a hard error.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  {
    // Data-layer modules kept byte-for-byte as-is (GitHub/API fetching).
    files: ["src/lib/githubService.ts", "src/lib/api.ts"],
    rules: {
      "no-useless-escape": "off",
      "no-empty": "off",
    },
  }
);
