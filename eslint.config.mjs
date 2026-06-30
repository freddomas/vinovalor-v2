import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname
});

const config = [
  {
    ignores: [".next/**", "node_modules/**", "artifacts/**", "artifacts.Path/**", "public/media/**"]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/triple-slash-reference": "off",
      "import/no-anonymous-default-export": "off",
      "react/no-unescaped-entities": "off"
    }
  }
];

export default config;
