import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'Melt - 방송 외 후원 플랫폼',
  description: '방송이 꺼진 뒤에도 후원이 흐르도록',
}

// 정적 생성 허용 (빌드 시 미리 생성)
// export const dynamic = 'force-dynamic' // 제거하여 정적 생성 허용

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        {/* MetaMask 오류 방지 - 브라우저 확장 프로그램 오류 무시 */}
        <Script id="metamask-error-handler" strategy="beforeInteractive">
          {`
            (function() {
              // MetaMask 관련 오류를 완전히 무시
              const originalError = window.onerror;
              window.onerror = function(message, source, lineno, colno, error) {
                if (message && (
                  message.toString().includes('MetaMask') ||
                  message.toString().includes('Failed to connect to MetaMask') ||
                  message.toString().includes('ethereum') ||
                  source && source.includes('metamask') ||
                  source && source.includes('nkbihfbeogaeaoehlefnkodbefgpgknn')
                )) {
                  console.warn('MetaMask extension error ignored:', message);
                  return true; // 오류 처리됨
                }
                if (originalError) {
                  return originalError.apply(this, arguments);
                }
                return false;
              };

              // Promise rejection 처리
              window.addEventListener('unhandledrejection', (event) => {
                const reason = event.reason;
                if (reason && (
                  (reason.message && (
                    reason.message.includes('MetaMask') ||
                    reason.message.includes('Failed to connect to MetaMask') ||
                    reason.message.includes('ethereum')
                  )) ||
                  reason.toString().includes('MetaMask') ||
                  reason.toString().includes('nkbihfbeogaeaoehlefnkodbefgpgknn')
                )) {
                  console.warn('MetaMask promise rejection ignored:', reason);
                  event.preventDefault();
                  event.stopPropagation();
                  return false;
                }
              }, true);

              // 일반 에러 이벤트 처리
              window.addEventListener('error', (event) => {
                if (event.message && (
                  event.message.includes('MetaMask') ||
                  event.message.includes('Failed to connect to MetaMask') ||
                  event.message.includes('ethereum') ||
                  event.filename && event.filename.includes('metamask') ||
                  event.filename && event.filename.includes('nkbihfbeogaeaoehlefnkodbefgpgknn')
                )) {
                  console.warn('MetaMask error event ignored:', event.message);
                  event.preventDefault();
                  event.stopPropagation();
                  return false;
                }
              }, true);
            })();
          `}
        </Script>
      </head>
      <body>
        <div className="min-h-screen w-full bg-neutral-950 text-white">
          {/* Side mask for desktop */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),rgba(0,0,0,0.9))]" />
          </div>

          {/* Center mobile frame */}
          <div className="relative mx-auto min-h-screen w-full max-w-[460px] bg-neutral-900 shadow-2xl mobile-frame">
            <Providers>
              <div className="min-h-screen">
                {children}
              </div>
            </Providers>
          </div>
        </div>
      </body>
    </html>
  )
}
