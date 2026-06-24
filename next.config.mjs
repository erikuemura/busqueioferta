/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  experimental: {
    // sharp e bullmq são pesados/server-only; mantemos fora do bundle do edge
    serverComponentsExternalPackages: ["sharp", "bullmq", "ioredis", "bcryptjs"],
  },
};

export default nextConfig;
