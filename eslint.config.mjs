import tseslintPlugin from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";

// ESLint loads custom rules only through a plugin, so this one sits in an
// inline plugin named local. Long arrow functions become named functions.
const maxArrowLinesRule = {
  meta: {
    type: "suggestion",
    docs: { description: "limit arrow function length" },
    schema: [
      {
        type: "object",
        properties: { max: { type: "number" } },
        additionalProperties: false,
      },
    ],
    messages: {
      tooLong:
        "Arrow function has {{lines}} lines. Maximum allowed is {{max}}.",
    },
  },
  create(context) {
    const max = context.options[0]?.max ?? 100;

    return {
      ArrowFunctionExpression(node) {
        if (!node.loc) {
          return;
        }

        const lines = node.loc.end.line - node.loc.start.line + 1;

        if (lines > max) {
          context.report({ node, messageId: "tooLong", data: { lines, max } });
        }
      },
    };
  },
};

export default [
  {
    ignores: [
      "node_modules/",
      "frontend/dist/",
      "dist/",
      "build/",
      "coverage/",
      "tmp/",
      "temp/",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslintParser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        // Every tsconfig in the repo, so typed rules see every file.
        project: ["./frontend/tsconfig.json"],
      },
    },
    plugins: {
      "@typescript-eslint": tseslintPlugin,
      local: { rules: { "max-arrow-lines": maxArrowLinesRule } },
    },
    rules: {
      // Type and value imports from one module must share a line, so a module
      // is named exactly once per file and nothing drifts out of sync.
      "no-duplicate-imports": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: false },
      ],
      // Inline rather than separate, so a type import never counts as a second
      // import of a module already imported for its values.
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "max-lines": [
        "error",
        { max: 500, skipBlankLines: true, skipComments: true },
      ],
      "local/max-arrow-lines": ["error", { max: 100 }],
    },
  },
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    languageOptions: { ecmaVersion: "latest", sourceType: "module" },
  },
];
