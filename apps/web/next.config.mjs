/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // I pacchetti del workspace sono TS non compilati: Next li transpila.
  transpilePackages: ['@imi/shared'],
};

export default nextConfig;
