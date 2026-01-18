import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import Script from 'next/script'
import Navigation from '../components/Navigation'

export const metadata: Metadata = {
  title: 'Melt - 방송 외 후원 플랫폼',
  description: '방송이 꺼진 뒤에도 후원이 흐르도록',
}

// 동적 렌더링 활성화 (React Query 등 클라이언트 컴포넌트 사용)
export const dynamic = 'force-dynamic'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        {/* 브라우저 확장 프로그램 오류 완전 차단 (MetaMask 등) */}
        <Script id="extension-error-blocker" strategy="beforeInteractive">
          {`
            (function() {
              // 모든 확장 프로그램 관련 오류를 완전히 차단
              const blockPatterns = [
                'MetaMask', 'metamask', 'ethereum', 'web3',
                'nkbihfbeogaeaoehlefnkodbefgpgknn',
                'Failed to connect', 'connect to MetaMask'
              ];
              
              const shouldBlock = (str) => {
                if (!str) return false;
                const lowerStr = str.toString().toLowerCase();
                return blockPatterns.some(pattern => lowerStr.includes(pattern.toLowerCase()));
              };

              // window.onerror 차단
              const originalError = window.onerror;
              window.onerror = function(message, source, lineno, colno, error) {
                if (shouldBlock(message) || shouldBlock(source)) {
                  return true; // 완전히 차단
                }
                if (originalError) {
                  return originalError.apply(this, arguments);
                }
                return false;
              };

              // Promise rejection 차단
              const blockRejection = (event) => {
                const reason = event.reason;
                if (reason && (
                  shouldBlock(reason.message) ||
                  shouldBlock(reason.toString()) ||
                  shouldBlock(reason.stack)
                )) {
                  event.preventDefault();
                  event.stopPropagation();
                  event.stopImmediatePropagation();
                  return false;
                }
              };
              window.addEventListener('unhandledrejection', blockRejection, true);
              window.addEventListener('unhandledrejection', blockRejection, false);

              // Error 이벤트 차단
              const blockError = (event) => {
                if (shouldBlock(event.message) || shouldBlock(event.filename)) {
                  event.preventDefault();
                  event.stopPropagation();
                  event.stopImmediatePropagation();
                  return false;
                }
              };
              window.addEventListener('error', blockError, true);
              window.addEventListener('error', blockError, false);
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
              <div className="min-h-screen pb-20">
                {children}
              </div>
              <Navigation />
            </Providers>
          </div>
        </div>
      </body>
    </html>
  )
}
