import tseslintPlugin from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";

const localRulesPlugin = {
  rules: {
    "max-arrow-lines": {
      meta: {
        type: "suggestion",
        schema: [
          {
            type: "object",
            properties: {
              max: { type: "number" },
            },
            additionalProperties: false,
          },
        ],
      },
      create(context) {
        const [{ max = 100 } = {}] = context.options;

        return {
          ArrowFunctionExpression(node) {
            if (!node.loc) {
              return;
            }

            const lineCount = node.loc.end.line - node.loc.start.line + 1;

            if (lineCount <= max) {
              return;
            }

            context.report({
              node,
              message: `Arrow function has too many lines (${lineCount}). Maximum allowed is ${max}.`,
            });
          },
        };
      },
    },
  },
};

export default [
  {
    ignores: [
      "node_modules/",
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
        project: ["./tsconfig.json", "./tsconfig.spec.json"],
      },
    },
    plugins: {
      "@typescript-eslint": tseslintPlugin,
      local: localRulesPlugin,
    },
    rules: {
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
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],
      "max-lines": [
        "error",
        { max: 500, skipBlankLines: true, skipComments: true },
      ],
      "local/max-arrow-lines": ["error", { max: 100 }],
    },
  },
  {
    files: ["**/*.js", "**/*.jsx", "**/*.cjs", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {},
  },
];
