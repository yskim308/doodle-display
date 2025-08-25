import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
    // 👇 Add this object to your config array
  {
    rules: {
      // Disables the rule that bans using "any"
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];


export default eslintConfig;
