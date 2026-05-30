/** @type {import('next').NextConfig} */
const traceExcludes = [
  ".next/cache/**",
  ".agents/**",
  ".git/**",
  "node_modules/@swc/core-linux-x64-gnu/**",
  "node_modules/@swc/core-linux-x64-musl/**",
  "node_modules/@swc/core-darwin-x64/**",
  "node_modules/@swc/core-darwin-arm64/**",
  "node_modules/@swc/core-win32-x64-msvc/**",
  "node_modules/@esbuild/**",
  "node_modules/webpack/**",
  "node_modules/terser/**",
  "node_modules/uglify-js/**",
  "node_modules/@prisma/engines/**",
  "node_modules/@prisma/engines/node_modules/**",
  "node_modules/.prisma/client/*.tmp*",
  "node_modules/.prisma/client/schema-engine-*",
  "node_modules/.prisma/client/query_engine-windows.dll.node",
  "node_modules/.prisma/client/query_engine-*darwin*",
  "node_modules/.prisma/client/libquery_engine-debian-*",
  "node_modules/.prisma/client/libquery_engine-linux-arm64-*",
  "seeds/founder/**",
];

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
    outputFileTracingExcludes: {
      "*": traceExcludes,
    },
    outputFileTracingIncludes: {
      "/api/knowledge/route": ["./seeds/templates/linkedin-profile.md"],
      "/api/knowledge/seed/route": ["./seeds/starter/**/*"],
      "/api/knowledge/build/route": ["./seeds/starter/**/*"],
    },
  },
};

export default nextConfig;
