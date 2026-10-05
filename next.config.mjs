/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  experimental: {
    // Landing de página única com CSS pequeno: inline no <head> elimina o
    // round-trip render-blocking do stylesheet e melhora FCP/LCP.
    inlineCss: true,
  },
};

export default nextConfig;
