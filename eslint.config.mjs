import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".worktrees/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Existing client pages hydrate from localStorage/sessionStorage in effects.
      // Keep this non-blocking until those flows are refactored around an external store.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
