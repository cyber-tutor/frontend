/** @type {import("eslint").Linter.Config} */
const config = {
  extends: ["next/core-web-vitals"],
  rules: {
    "@next/next/no-img-element": "off",
  },
};

module.exports = config;
