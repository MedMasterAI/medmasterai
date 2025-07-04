// .eslintrc.cjs
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
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/generated/**/*", // Ignore generated files.
    "src/lib/credentials/vision-service-account.js", // <--- AÑADIDA ESTA LÍNEA
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "@typescript-eslint/no-require-imports": "off",
    "quotes": ["error", "double"],
    "import/no-unresolved": 0,
    "indent": ["error", 2],
    "max-len": ["error", { "code": 120, "ignoreComments": true, "ignoreUrls": true, "ignoreTemplateLiterals": true, "ignoreRegExpLiterals": true }],
    "object-curly-spacing": ["error", "always"],
    "semi": ["error", "always"],
    "arrow-parens": ["error", "as-needed"],
    "comma-dangle": ["error", "always-multiline"],
    "require-jsdoc": "off",
    "valid-jsdoc": "off",
    "no-trailing-spaces": "error",
    "eol-last": ["error", "always"],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "error",
    "import/no-duplicates": "warn",
    "padded-blocks": ["error", "never"]
  },
  settings: {
    "import/resolver": {
      typescript: true,
      node: true,
    },
  },
};