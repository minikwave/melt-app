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
  // 빌드 캐시 비활성화 (Vercel 빌드 문제 해결)
  experimental: {
    forceSwcTransforms: true,
  },
  // Webpack alias 설정 (Vercel 빌드 환경 호환성)
  webpack: (config, { dir, defaultLoaders }) => {
    // 프로젝트 루트 경로 결정
    // Vercel에서 Root Directory가 'web'으로 설정된 경우, dir은 web 폴더를 가리킴
    const projectRoot = dir ? path.resolve(dir) : path.resolve(__dirname)
    
    // tsconfig-paths-webpack-plugin 사용
    const tsconfigPath = path.resolve(projectRoot, 'tsconfig.json')
    const tsconfigPlugin = new TsconfigPathsPlugin({
      configFile: tsconfigPath,
      baseUrl: projectRoot,
      extensions: config.resolve.extensions || ['.js', '.jsx', '.ts', '.tsx', '.json'],
    })
    
    if (config.resolve.plugins) {
      config.resolve.plugins.push(tsconfigPlugin)
    } else {
      config.resolve.plugins = [tsconfigPlugin]
    }
    
    // 직접 alias 설정 (절대 경로)
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': projectRoot,
    }
    
    // resolve.modules에 프로젝트 루트 추가
    if (!config.resolve.modules) {
      config.resolve.modules = ['node_modules']
    }
    if (!config.resolve.modules.includes(projectRoot)) {
      config.resolve.modules.unshift(projectRoot)
    }
    
    return config
  },
}

module.exports = nextConfig
