import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const clientRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: clientRoot,
  reactStrictMode: true,
};

export default nextConfig;
