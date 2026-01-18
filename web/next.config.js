const path = require('path')

/**
 * @type {import('next').NextConfig}
 * 주의: output: 'export' 를 사용하면 app/api/* (route.ts) 서버리스 함수가 제외됩니다. Vercel 배포 시 사용 금지.
 */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  devIndicators: {
    buildActivity: true,
  },
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    forceSwcTransforms: true,
  },
  webpack: (config, { dir }) => {
    const projectRoot = dir ? path.resolve(dir) : path.resolve(__dirname)

    try {
      const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
      const tsconfigPath = path.resolve(projectRoot, 'tsconfig.json')
      const tsconfigPlugin = new TsconfigPathsPlugin({
        configFile: tsconfigPath,
        baseUrl: projectRoot,
        extensions: config.resolve.extensions || ['.js', '.jsx', '.ts', '.tsx', '.json'],
      })
      if (config.resolve.plugins) config.resolve.plugins.push(tsconfigPlugin)
      else config.resolve.plugins = [tsconfigPlugin]
    } catch (_) {
      /* tsconfig-paths-webpack-plugin 없음(예: npm install --omit=dev) 시 스킵 */
    }

    config.resolve.alias = { ...config.resolve.alias, '@': projectRoot }
    if (!config.resolve.modules) config.resolve.modules = ['node_modules']
    if (!config.resolve.modules.includes(projectRoot)) config.resolve.modules.unshift(projectRoot)
    return config
  },
}

module.exports = nextConfig
