import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: [
    "@react-pdf/renderer",
    "pdf2json",
    "mammoth",
    "better-sqlite3",
  ],
};

export default nextConfig;
