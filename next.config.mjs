/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
    outputFileTracingExcludes: {
      "*": [
        ".agents/**",
        "node_modules/@swc/core-linux-x64-gnu/**",
        "node_modules/@swc/core-linux-x64-musl/**",
        "node_modules/@swc/core-darwin-x64/**",
        "node_modules/@swc/core-darwin-arm64/**",
        "node_modules/@swc/core-win32-x64-msvc/**",
        "node_modules/@esbuild/**",
        "node_modules/webpack/**",
        "node_modules/terser/**",
        "node_modules/uglify-js/**",
        "node_modules/@prisma/engines/node_modules/**",
        "node_modules/@prisma/engines/schema-engine-*",
        "node_modules/.prisma/client/*.tmp*",
        "node_modules/.prisma/client/schema-engine-*",
      ],
    },
  },
};

export default nextConfig;
