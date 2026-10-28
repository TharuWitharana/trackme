import type { NextConfig } from "next";

// cacheComponents is left off: Ant Design's style registry (AntdRegistry)
// uses Math.random() on startup, which cacheComponents rejects during prerender.
const nextConfig: NextConfig = {};

export default nextConfig;
