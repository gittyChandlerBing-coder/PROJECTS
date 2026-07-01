import nextConfig from "eslint-config-next";

// eslint-config-next 16 ships its own flat config array natively, so this
// skips the legacy `next/core-web-vitals` string + FlatCompat shim path
// (which goes through @eslint/eslintrc and currently throws a circular-JSON
// error under ESLint 10, tripped up by eslint-plugin-react's flat config
// object self-referencing its own `configs`). Importing the array directly
// is both simpler and sidesteps it entirely.
const eslintConfig = [
  ...nextConfig,
  {
    ignores: [".next/**", "node_modules/**", "public/sw.js"],
  },
];

export default eslintConfig;
