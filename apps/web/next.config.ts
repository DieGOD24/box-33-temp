import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const API_URL = process.env['API_URL'] ?? 'http://localhost:3001'

const nextConfig: NextConfig = {
  transpilePackages: ['@box33/types'],
  // Standalone output → minimal Docker runtime image.
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  async rewrites() {
    return [
      // Dashboard-uploaded images stay same-origin for the browser; Next
      // streams them from the internal API (API_URL is never exposed).
      {
        source: '/api/uploads/:path*',
        destination: `${API_URL}/api/uploads/:path*`,
      },
    ]
  },
}

export default withNextIntl(nextConfig)
