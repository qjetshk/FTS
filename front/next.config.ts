import type { NextConfig } from "next";

// базовые заголовки безопасности; строгий CSP — отдельно (Next требует nonce для inline-скриптов)
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // прод-образ в Docker: server.js + только нужные node_modules
  output: "standalone",
  // значок Next.js в углу мешает скриншотам интерфейса
  devIndicators: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
