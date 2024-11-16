import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
    {
        ignores: [
            "data/*",
            "build/*",
            "eslint.config.mjs",
            "scripts/*",
            "jest.config.ts",
        ],
    },
    {
        files: ["**/*.{js,mjs,cjs,ts}"],
    },
    {
        files: ["**/*.js"],
        languageOptions: { sourceType: "commonjs" },
    },
    { languageOptions: { globals: globals.node } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
];
