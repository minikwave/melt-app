const path = require('path')

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
  webpack: (config, { dir, isServer }) => {
    // 절대 경로로 alias 설정
    // Vercel에서 Root Directory가 'web'으로 설정된 경우
    // dir 파라미터가 제공되면 사용하고, 없으면 __dirname 사용
    const projectRoot = dir ? path.resolve(dir) : path.resolve(__dirname)
    
    // resolve.modules에 현재 디렉토리 추가
    if (!config.resolve.modules) {
      config.resolve.modules = ['node_modules']
    }
    if (!config.resolve.modules.includes(projectRoot)) {
      config.resolve.modules.unshift(projectRoot)
    }
    
    // alias 설정 (절대 경로 사용)
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': projectRoot,
    }
    
    return config
  },
}

module.exports = nextConfig
