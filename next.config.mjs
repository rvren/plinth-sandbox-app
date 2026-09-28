import { fileURLToPath } from "node:url";
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets a production build (pnpm demo) sit beside the dev server's .next.
  distDir: process.env.PLINTH_NEXT_DIST_DIR ?? ".next",
  // The monorepo root, stated rather than guessed: a stray lockfile in a parent folder would
  // otherwise be taken for the workspace root.
  outputFileTracingRoot: fileURLToPath(new URL("../..", import.meta.url)),
  // Workspace packages ship TypeScript source rather than build output, so Next compiles
  // them itself.
  transpilePackages: [
    "@plinth/contract",
    "@plinth/ports",
    "@plinth/renderer",
    "@plinth/guardrails",
    "@plinth/telemetry",
    "@plinth/policy-engine",
    "@plinth/sdk-react",
    "@plinth/sdk-core",
    "@plinth/sdk-browser",
    "@plinth/federation",
  ],
  reactStrictMode: true,
  devIndicators: false,

  webpack: (config) => {
    // Our packages use ESM-correct `./foo.js` specifiers that point at `./foo.ts` sources.
    // tsc (moduleResolution: bundler) and vitest follow that; webpack does not without
    // being told. Rewriting the imports to be extensionless would break real Node ESM
    // resolution, so teach the bundler instead.
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};
export default nextConfig;
