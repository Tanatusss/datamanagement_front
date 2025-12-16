import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",      
  basePath: "/dmp",
  assetPrefix: "/dmp",
  reactCompiler: true,       
  turbopack: {},             // (ไว้ให้ Next หยุดเตือน Turbopack config)
};

export default nextConfig;
