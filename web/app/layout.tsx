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
            window.addEventListener('error', (event) => {
              if (event.message && event.message.includes('MetaMask')) {
                event.preventDefault();
                event.stopPropagation();
                return false;
              }
            }, true);
            
            window.addEventListener('unhandledrejection', (event) => {
              if (event.reason && (event.reason.message && event.reason.message.includes('MetaMask') || 
                  event.reason.toString().includes('MetaMask'))) {
                event.preventDefault();
                return false;
              }
            });
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
