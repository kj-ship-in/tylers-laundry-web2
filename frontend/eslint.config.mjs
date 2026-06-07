import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierPlugin from "eslint-plugin-prettier";
import parser from "@typescript-eslint/parser";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    "node_modules/**",
    ".next/**",
    ".netlify/**",
    "out/**",
    "dist/**",
    "build/**",
    "*.config.js",
    "*.config.ts",
    "*.config.mjs",
    "next.config.js",
    "next.config.mjs",
    "jest.config.js",
    "coverage/**",
    ".vscode/**",
    ".husky/**",
    ".history/**",
    "tsconfig.json",
    "public/**",
    ".env*",
  ]),

  // TypeScript files with type information
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: parser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
  },

  // Custom rules
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": [
        "error",
        {
          semi: true,
          singleQuote: true,
          quoteProps: "as-needed",
          printWidth: 80,
          tabWidth: 2,
          jsxSingleQuote: true,
          trailingComma: "all",
          endOfLine: "auto",
          arrowParens: "avoid",
          bracketSpacing: true,
          bracketSameLine: false,
          embeddedLanguageFormatting: "auto",
        },
      ],

      // TypeScript rules
      "@typescript-eslint/no-unused-vars": "off", // handled by unused-imports
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-var-requires": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          prefer: "type-imports",
          disallowTypeAnnotations: false,
        },
      ],
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-ignore": "allow-with-description",
        },
      ],

      // React rules
      "react/react-in-jsx-scope": "off", // Next.js doesn't require React import
      "react/prop-types": "off",
      "react/display-name": "off",
      "react/no-unescaped-entities": "off",
      "react/jsx-key": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-no-undef": "error",
      "react/jsx-uses-vars": "error",
      "react/no-children-prop": "error",
      "react/no-danger-with-children": "error",
      "react/no-deprecated": "error",
      "react/no-direct-mutation-state": "error",
      "react/no-find-dom-node": "error",
      "react/no-is-mounted": "error",
      "react/no-render-return-value": "error",
      "react/no-string-refs": "error",
      "react/no-unknown-property": "error",
      "react/no-unsafe": "warn",
      "react/require-render-return": "error",
      "react/jsx-boolean-value": ["error", "never"],
      "react/jsx-curly-brace-presence": ["error", "never"],
      "react/jsx-fragments": ["error", "syntax"],
      "react/jsx-no-useless-fragment": "error",
      "react/jsx-pascal-case": "error",
      "react/self-closing-comp": "error",
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/exhaustive-deps": "warn",

      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
]);

export default eslintConfig;
