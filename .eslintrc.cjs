const { resolve } = require("node:path")

const project = resolve(process.cwd(), "tsconfig.app.json")

module.exports = {
    root: true, // Make sure eslint picks up the config at the root of the directory
    parser: "@typescript-eslint/parser",
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react/recommended",
        "prettier",
        "plugin:prettier/recommended", // Make this the last element so prettier config overrides other formatting rules
    ],
    parserOptions: {
        project,
    },
    globals: {
        JSX: true,
    },
    settings: {
        react: {
            version: "detect",
        },
        "import/resolver": {
            typescript: {
                project,
            },
            node: {
                extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx"],
            },
        },
    },
    ignorePatterns: ["node_modules/", "dist/", ".eslintrc.js", "postcss.config.js", "**/*.css"],
    plugins: ["react-hooks", "unused-imports"],
    // add rules configurations here
    rules: {
        "unused-imports/no-unused-imports": "error",
        "prettier/prettier": [
            "error",
            {
                endOfLine: "auto",
            },
            { usePrettierrc: true },
        ],
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
        "jsx-a11y/no-static-element-interactions": "off",
        "jsx-a11y/click-events-have-key-events": "off",
        "react/self-closing-comp": [
            "error",
            {
                component: true,
                html: true,
            },
        ],
        "sort-imports": [
            "error",
            {
                ignoreCase: true,
                ignoreDeclarationSort: true,
                ignoreMemberSort: true,
                memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
                allowSeparatedGroups: true,
            },
        ],
        "react/display-name": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/ban-ts-ignore": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/triple-slash-reference": "off",
        "prefer-const": [
            "warn",
            {
                destructuring: "all",
                ignoreReadBeforeAssign: false,
            },
        ],
        "object-shorthand": "warn",
        "no-debugger": "warn",
        "array-callback-return": ["warn", { allowImplicit: true, checkForEach: true }],
        "@typescript-eslint/no-empty-function": "off",
        "react/jsx-boolean-value": ["warn", "never"],
        "react/jsx-curly-brace-presence": "warn",
        "@typescript-eslint/no-unused-vars": [
            "warn",
            {
                ignoreRestSiblings: true,
                argsIgnorePattern: "^_",
                caughtErrorsIgnorePattern: "^_",
                args: "after-used",
            },
        ],
        "no-useless-rename": [
            "error",
            {
                ignoreDestructuring: false,
                ignoreImport: false,
                ignoreExport: false,
            },
        ],
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/prefer-as-const": "off",
        "no-duplicate-imports": "error",
        "@typescript-eslint/switch-exhaustiveness-check": "error",
    },
    overrides: [
        {
            files: ["*.config.js", "vite.config.ts"],
            env: {
                node: true,
            },
        },
    ],
}
