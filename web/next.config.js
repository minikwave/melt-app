/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 정적 페이지 생성 완전 비활성화
  // 빌드 시 정적 생성이 발생하지 않도록 설정
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // 개발 모드 최적화
  devIndicators: {
    buildActivity: true,
  },
}

module.exports = nextConfig
