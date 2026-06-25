/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@matriwatch/shared"],
  experimental: {
    typedRoutes: true
  }
};

export default nextConfig;

