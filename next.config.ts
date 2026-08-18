import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // o Next 16 gera AGENTS.md/CLAUDE.md a cada dev; nao queremos no repo
  agentRules: false,
};

export default nextConfig;
