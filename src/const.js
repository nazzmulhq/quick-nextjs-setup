export const getDockerFile = (nodeVersion) => {
  return `
FROM node:${nodeVersion}

RUN npm install pm2 -g

EXPOSE 3000
`;
};

export const getDockerComposeFile = (projectName) => {
  return `
    version: "3.9"
    services:
        admin:
            build:
                context: ./
                dockerfile: Dockerfile
            image: ${projectName}
            tty: true
            restart: unless-stopped
            container_name: ${projectName}
            working_dir: /app/
            volumes:
                - ./:/app
            ports:
                - "3000:3000"
            networks:
                - ${projectName}
    networks:
        ${projectName}:
            driver: bridge
    `;
};
export const getEcosystemConfigJsFile = (projectName) => {
  return `
    module.exports = {
        apps: [
          {
            name: "${projectName}-prod",
            script: "yarn",
            args: "start",
            interpreter: "/bin/bash",
            env: {
              NODE_ENV: "production",
            },
          },
          {
            name: "${projectName}-dev",
            script: "yarn",
            args: "dev",
            interpreter: "/bin/bash",
            watch: true,
          },
        ],
      };
    `;
};

export const getDeployShFile = (projectName) => {
  return `
    git pull
    docker-compose down
    docker-compose up -d
    docker exec ${projectName} yarn install
    docker exec ${projectName} yarn build
    docker exec ${projectName} pm2 start --only "${projectName}-prod"
    `;
};

export const getLintStagedConfigJsFile = () => {
  return `
module.exports = {
    "**/*.ts?(x)": () => "tsc -p tsconfig.json --noEmit",
    "**/*.(ts|tsx|js)": filenames => [
        \`prettier --write \${filenames.join(" ")}\`,
        \`eslint --fix \${filenames.join(" ")}\`,
    ],
    "**/*.(json|md)": "prettier --write",
};`;
};

export const getPrettierrc = () => {
  return `
module.exports = {
  tabWidth: 4,
  printWidth: 80,
  endOfLine: 'auto',
  trailingComma: 'all',
  arrowParens: 'avoid',
  semi: true,
  useTabs: false,
  singleQuote: false,
  bracketSpacing: true,
};
`;
};

export const getEslintConfigJsFile = () => {
  return `
import { FlatCompat } from "@eslint/eslintrc";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintPluginReact from "eslint-plugin-react";
import { dirname } from "path";
import { fileURLToPath } from "url";
import prettierConfig from "./.prettierrc.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

const eslintConfig = [
    ...compat.extends("next/core-web-vitals", "next/typescript"),
    {
        ignores: ["node_modules/**", "dist/**", ".prettierrc.js", ".next/**"],
        languageOptions: {
            ecmaVersion: 2021,
            sourceType: "module",
        },
        linterOptions: {
            reportUnusedDisableDirectives: true,
        },
        plugins: {
            react: eslintPluginReact,
            "@typescript-eslint": typescriptEslintPlugin,
            prettier: eslintPluginPrettier,
        },
        rules: {
            // Possible errors
            "no-console": "warn",
            // Best practices
            "dot-notation": "error",
            "no-else-return": "error",
            "no-floating-decimal": "error",
            "no-sequences": "error",
            "@typescript-eslint/no-var-requires": "off",
            // Stylistic
            "array-bracket-spacing": "error",
            "computed-property-spacing": ["error", "never"],
            curly: "error",
            "no-lonely-if": "error",
            "no-unneeded-ternary": "error",
            "one-var-declaration-per-line": "error",
            quotes: [
                "error",
                "double",
                {
                    allowTemplateLiterals: false,
                    avoidEscape: true,
                },
            ],
            // ES6
            "array-callback-return": "off",
            "prefer-const": "error",
            // Imports
            "import/prefer-default-export": "off",
            "sort-imports": [
                "error",
                {
                    ignoreCase: true,
                    ignoreDeclarationSort: true,
                },
            ],
            "no-unused-expressions": "off",
            "no-prototype-builtins": "off",
            "@typescript-eslint/no-explicit-any": "warn",

            // REACT
            "react/jsx-uses-react": "off",
            "react/react-in-jsx-scope": "off",
            "jsx-a11y/href-no-hash": [0],
            "react/display-name": 0,
            "react/no-deprecated": "error",
            "react/no-unsafe": [
                "error",
                {
                    checkAliases: true,
                },
            ],
            "react/jsx-sort-props": [
                "error",
                {
                    ignoreCase: true,
                },
            ],
            "react-hooks/rules-of-hooks": "error",
            "react-hooks/exhaustive-deps": 0,
            "react/state-in-constructor": 0,
            indent: 0,
            "linebreak-style": 0,
            "react/prop-types": 0,
            "jsx-a11y/click-events-have-key-events": 0,
            "react/jsx-filename-extension": [
                1,
                {
                    extensions: [".js", ".jsx", ".ts", ".tsx"],
                },
            ],

            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-empty-object-type": "off",
            "prettier/prettier": ["error", { ...prettierConfig }],
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    },
];

export default eslintConfig;
    `;
};

export const getEsLintIgnore = `
{
  "eslintIgnore": [".prettierrc.js"]
}
`;
