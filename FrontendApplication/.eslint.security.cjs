//
// ESLint Security Configuration (override) for FrontendApplication
//
// Usage suggestions (add to package.json "scripts"):
//   "lint:sec": "eslint -c .eslint.security.cjs \"src/**/*.{js,jsx}\" --max-warnings=0",
//   "lint:sec:json": "eslint -c .eslint.security.cjs \"src/**/*.{js,jsx}\" --format json -o security-report-eslint.json --max-warnings=0"
//
// Install (from FrontendApplication):
//   npm install --save-dev eslint eslint-plugin-security eslint-plugin-no-secrets eslint-plugin-react eslint-plugin-jsx-a11y
//
// This file complements existing eslint.config.mjs. It focuses on security-sensitive rules.
// You can continue to use eslint.config.mjs for general linting.

module.exports = {
  root: false, // keep existing root config behavior
  overrides: [
    {
      files: ["**/*.{js,jsx}"],
      env: {
        browser: true,
        es2021: true,
        node: false,
        jest: true,
      },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      plugins: ["security", "no-secrets", "react", "jsx-a11y"],
      ignores: [
        "node_modules/",
        "build/",
        "dist/",
        "coverage/",
      ],
      rules: {
        // Dangerous sinks
        "no-eval": "error",
        "no-implied-eval": "error",
        "no-new-func": "error",

        // React-specific risky patterns
        "react/no-danger": "error", // blocks dangerouslySetInnerHTML
        "react/no-unknown-property": "warn",

        // Basic input sanitization patterns (semantic rules are limited in ESLint; supplement with Semgrep)
        "security/detect-object-injection": "warn",
        "security/detect-non-literal-fs-filename": "warn",
        "security/detect-unsafe-regex": "warn",
        "security/detect-non-literal-regexp": "warn",
        "security/detect-eval-with-expression": "error",
        "security/detect-new-buffer": "error",
        "security/detect-pseudoRandomBytes": "warn",

        // Secrets detection (heuristic): avoid committing tokens/keys
        "no-secrets/no-secrets": ["warn", { tolerance: 4.2, ignoreContent: ["localhost", "127.0.0.1"] }],

        // Accessibility-influenced security
        "jsx-a11y/no-autofocus": "warn",

        // General robustness
        "no-unused-vars": ["warn", { varsIgnorePattern: "React|App" }],
        "no-console": ["warn", { allow: ["warn", "error"] }],
      },
    },
  ],
};

