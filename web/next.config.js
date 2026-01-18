const path = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 정적 페이지 생성 활성화
  // 빌드 시 모든 페이지를 미리 생성하여 빠른 로딩
  onDemandEntries: {
    maxInactiveAge: 60 * 1000, // 60초 동안 캐시 유지
    pagesBufferLength: 5, // 더 많은 페이지 버퍼링
  },
  // 개발 모드 최적화
  devIndicators: {
    buildActivity: true,
  },
  // 프로덕션 빌드 최적화
  swcMinify: true,
  // 컴파일러 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Webpack alias 설정 (Vercel 빌드 환경 호환성)
  webpack: (config, { dir }) => {
    // tsconfig.json의 paths를 사용하여 alias 자동 설정
    const projectRoot = dir ? path.resolve(dir) : path.resolve(__dirname)
    
    // tsconfig-paths-webpack-plugin 사용
    if (config.resolve.plugins) {
      config.resolve.plugins.push(
        new TsconfigPathsPlugin({
          configFile: path.resolve(projectRoot, 'tsconfig.json'),
          baseUrl: projectRoot,
        })
      )
    } else {
      config.resolve.plugins = [
        new TsconfigPathsPlugin({
          configFile: path.resolve(projectRoot, 'tsconfig.json'),
          baseUrl: projectRoot,
        }),
      ]
    }
    
    // 추가로 직접 alias 설정 (이중 보안)
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': projectRoot,
    }
    
    return config
  },
}

module.exports = nextConfig
