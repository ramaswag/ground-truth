import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // lib/db.ts reads the Risk Radar export from data/ at runtime. Next.js can't see that from
  // the imports, so ship the files with every server route (Vercel needs this).
  outputFileTracingIncludes: {
    "/**": ["./data/risk-radar-export.csv", "./data/risk-radar.csv", "./data/risk-radar.sample.json"],
  },
};

export default nextConfig;
