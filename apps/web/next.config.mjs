/** @type {import('next').NextConfig} */

// Origine dell'API (server-side). In hosting arriva da API_ORIGIN (solo host,
// senza schema): aggiungiamo https:// se manca. In locale: http://localhost:4000.
function apiOrigin() {
  const raw = process.env.API_ORIGIN;
  if (!raw) return 'http://localhost:4000';
  return /^https?:\/\//.test(raw) ? raw : `https://${raw}`;
}

const nextConfig = {
  reactStrictMode: true,
  // I pacchetti del workspace sono TS non compilati: Next li transpila.
  transpilePackages: ['@imi/shared'],
  // Proxy: il browser chiama /api/* (same-origin), Next inoltra all'API.
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiOrigin()}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
