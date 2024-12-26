/** @type {import("eslint").Linter.Config} */
const config = {
  plugins: ["prettier"],
  extends: ["next/core-web-vitals", "prettier"],
  rules: {
    "@next/next/no-img-element": "off",
    "prettier/prettier": "error",
  },
};

module.exports = config;
