'use client'

import Link from 'next/link'

export default function TermsPage() {
  return (
    <main className="min-h-screen p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/app" className="text-neutral-400 hover:text-white">
            ← 뒤로
          </Link>
          <h1 className="text-xl font-bold">이용약관</h1>
          <div className="w-8" />
        </div>

        {/* 약관 내용 */}
        <div className="p-6 rounded-xl bg-neutral-800 border border-neutral-700 space-y-6">
          <div>
            <h2 className="text-lg font-bold mb-3">제1조 (목적)</h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              본 약관은 Melt(이하 "서비스")가 제공하는 온라인 서비스의 이용과 관련하여 서비스와
              이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-3">제2조 (정의)</h2>
            <p className="text-sm text-neutral-300 leading-relaxed mb-2">
              1. "서비스"란 Melt가 제공하는 모든 온라인 서비스를 의미합니다.
            </p>
            <p className="text-sm text-neutral-300 leading-relaxed mb-2">
              2. "이용자"란 본 약관에 따라 서비스를 이용하는 회원 및 비회원을 의미합니다.
            </p>
            <p className="text-sm text-neutral-300 leading-relaxed">
              3. "회원"이란 서비스에 회원등록을 하고 서비스를 이용하는 자를 의미합니다.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-3">제3조 (약관의 게시와 개정)</h2>
            <p className="text-sm text-neutral-300 leading-relaxed mb-2">
              1. 서비스는 본 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
            </p>
            <p className="text-sm text-neutral-300 leading-relaxed">
              2. 서비스는 필요한 경우 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수
              있습니다.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-3">제4조 (서비스의 제공)</h2>
            <p className="text-sm text-neutral-300 leading-relaxed mb-2">
              1. 서비스는 다음과 같은 서비스를 제공합니다:
            </p>
            <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1 ml-4">
              <li>크리에이터와 시청자 간의 메시지 교환</li>
              <li>후원 기능</li>
              <li>채널 관리 및 통계</li>
              <li>기타 서비스가 추가로 제공하는 서비스</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-3">제5조 (이용자의 의무)</h2>
            <p className="text-sm text-neutral-300 leading-relaxed mb-2">
              이용자는 다음 행위를 하여서는 안 됩니다:
            </p>
            <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1 ml-4">
              <li>타인의 정보 도용</li>
              <li>서비스의 안정적 운영을 방해하는 행위</li>
              <li>불법적이거나 부적절한 콘텐츠 게시</li>
              <li>기타 관련 법령에 위배되는 행위</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-3">제6조 (서비스의 중단)</h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              서비스는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가
              발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-3">제7조 (면책조항)</h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              서비스는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는
              경우에는 서비스 제공에 관한 책임이 면제됩니다.
            </p>
          </div>

          <div className="pt-4 border-t border-neutral-700">
            <p className="text-xs text-neutral-500">
              최종 수정일: {new Date().toLocaleDateString('ko-KR')}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
