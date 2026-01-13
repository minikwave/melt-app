'use client'

import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/app" className="text-neutral-400 hover:text-white">
            ← 뒤로
          </Link>
          <h1 className="text-xl font-bold">개인정보처리방침</h1>
          <div className="w-8" />
        </div>

        {/* 개인정보처리방침 내용 */}
        <div className="p-6 rounded-xl bg-neutral-800 border border-neutral-700 space-y-6">
          <div>
            <h2 className="text-lg font-bold mb-3">제1조 (개인정보의 처리 목적)</h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Melt는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의
              목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법
              제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1 ml-4 mt-2">
              <li>회원 가입 및 관리</li>
              <li>서비스 제공 및 운영</li>
              <li>후원 및 결제 처리</li>
              <li>고객 문의 및 불만 처리</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-3">제2조 (개인정보의 처리 및 보유기간)</h2>
            <p className="text-sm text-neutral-300 leading-relaxed mb-2">
              1. 서비스는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집할
              때 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
            </p>
            <p className="text-sm text-neutral-300 leading-relaxed">
              2. 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다:
            </p>
            <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1 ml-4 mt-2">
              <li>회원 정보: 회원 탈퇴 시까지</li>
              <li>후원 내역: 관련 법령에 따라 보관</li>
              <li>문의 내역: 문의 처리 완료 후 3년</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-3">제3조 (처리하는 개인정보의 항목)</h2>
            <p className="text-sm text-neutral-300 leading-relaxed mb-2">
              서비스는 다음의 개인정보 항목을 처리하고 있습니다:
            </p>
            <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1 ml-4">
              <li>필수항목: 치지직 사용자 ID, 닉네임</li>
              <li>선택항목: 프로필 이미지, 소개글</li>
              <li>자동 수집 항목: IP 주소, 쿠키, 접속 로그</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-3">제4조 (개인정보의 제3자 제공)</h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의
              경우에는 예외로 합니다:
            </p>
            <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1 ml-4 mt-2">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라
                수사기관의 요구가 있는 경우</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-3">제5조 (개인정보처리의 위탁)</h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              서비스는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고
              있습니다:
            </p>
            <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1 ml-4 mt-2">
              <li>치지직 API 연동: 네이버 주식회사</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-3">제6조 (정보주체의 권리·의무 및 행사방법)</h2>
            <p className="text-sm text-neutral-300 leading-relaxed mb-2">
              정보주체는 다음과 같은 권리를 행사할 수 있습니다:
            </p>
            <ul className="list-disc list-inside text-sm text-neutral-300 space-y-1 ml-4">
              <li>개인정보 열람 요구</li>
              <li>개인정보 정정·삭제 요구</li>
              <li>개인정보 처리정지 요구</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-3">제7조 (개인정보의 파기)</h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              서비스는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는
              지체 없이 해당 개인정보를 파기합니다.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-3">제8조 (개인정보 보호책임자)</h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              서비스는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한
              정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를
              지정하고 있습니다.
            </p>
            <div className="mt-3 p-3 rounded-lg bg-neutral-900">
              <p className="text-sm text-neutral-300">
                이메일: contact@melt.app
              </p>
            </div>
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
