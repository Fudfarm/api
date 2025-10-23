module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json", "./tsconfig.dev.json"],
    sourceType: "module",
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/generated/**/*", // Ignore generated files.
  ],
  plugins: ["@typescript-eslint", "import"],
  rules: {
    "quotes": ["error", "double"],
    "import/no-unresolved": 0,
    "indent": ["error", 2],
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": ["warn", {
      "argsIgnorePattern": "^_",
    }],
  },
  overrides: [
    {
      files: ["**/*.ts"],
      rules: {
        "object-curly-spacing": "off",
        "new-cap": "off", // Ignore functions starting with cap
        "max-len": ["error", {"code": 130, "ignoreComments": true}],
        "indent": ["error", 2, {"SwitchCase": 1}],
        "no-invalid-this": "off",
        "@typescript-eslint/no-invalid-this": "off",
        "space-before-function-paren": "off",
        "curly": "off",
        "operator-linebreak": ["error", "after", {
          "overrides": {"?": "ignore", ":": "ignore"},
        }],
      },
    },
  ],
};
