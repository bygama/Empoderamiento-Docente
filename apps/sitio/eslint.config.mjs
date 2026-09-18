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
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Lo genera Payload; no es código nuestro (spec del panel, §3).
    "src/app/(payload)/**",
    "src/payload-types.ts",
    "src/cms/migraciones/**",
  ]),
]);

export default eslintConfig;
