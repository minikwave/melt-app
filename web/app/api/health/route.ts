import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Vercel 서버리스 함수 배포 검증용 헬스체크.
 * /api/health 호출 시 200이면 App Router API(route.ts)가 정상 배포된 것.
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    type: 'vercel-serverless',
    timestamp: new Date().toISOString(),
  });
}
