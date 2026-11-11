// One ESLint config for every workspace. Formatting is left to Prettier.
import js from "@eslint/js";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["**/node_modules/", "**/dist/", "apps/web/.next/", "apps/web/out/", "apps/web/next-env.d.ts"]),

  js.configs.recommended,
  tseslint.configs.recommended,

  {
    files: ["apps/signaling/**/*.ts", "*.mjs"],
    languageOptions: { globals: globals.node },
  },

  {
    files: ["apps/web/**/*.{ts,tsx}"],
    extends: [nextVitals],
    settings: { next: { rootDir: "apps/web" } },
  },

  prettier,
]);
