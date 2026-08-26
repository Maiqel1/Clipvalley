import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin uses dynamic requires and native deps (grpc, protobufjs).
  // Bundling it — especially into proxy.ts — breaks at runtime on Vercel.
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
