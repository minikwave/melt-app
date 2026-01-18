/**
 * 치지직 세션 매니저
 * 
 * kimcore/chzzk 라이브러리를 사용하여 크리에이터별 채팅 세션을 관리하고
 * 실시간으로 도네이션 이벤트를 수신합니다.
 * 
 * 핵심 원칙: 사용자 입력 금액을 절대 신뢰하지 않습니다.
 * 치지직에서 직접 받은 금액/메시지만 DB에 저장합니다.
 */

import { ChzzkClient, ChzzkChat } from 'chzzk';
import { pool } from '../db/pool';

// chzzk 라이브러리의 DonationEvent 타입이 버전에 따라 다를 수 있으므로
// 필요한 필드만 인터페이스로 정의하고 실제 핸들러에서는 any로 처리
interface DonationData {
  profile?: {
    nickname?: string;
    userIdHash?: string;
  };
  message?: string;
  extras?: {
    payAmount?: number;
    donationType?: string;
    donatorChannelId?: string;
    osType?: string;
    isAnonymous?: boolean;
    payType?: string;
    weeklyRankList?: any;
    donationUserWeeklyRank?: number;
  };
}

interface SessionInfo {
  client: ChzzkClient;
  chat: ChzzkChat;
  channelId: string;
  createdAt: Date;
}

export class ChzzkSessionManager {
  private static instance: ChzzkSessionManager;
  private sessions: Map<string, SessionInfo> = new Map();

  private constructor() {}

  static getInstance(): ChzzkSessionManager {
    if (!ChzzkSessionManager.instance) {
      ChzzkSessionManager.instance = new ChzzkSessionManager();
    }
    return ChzzkSessionManager.instance;
  }

  /**
   * 채널에 대한 세션 시작
   */
  async startSession(chzzkChannelId: string, nidAuth: string, nidSession: string): Promise<void> {
    // 기존 세션이 있으면 종료
    if (this.sessions.has(chzzkChannelId)) {
      await this.stopSession(chzzkChannelId);
    }

    console.log(`[ChzzkSession] Starting session for channel: ${chzzkChannelId}`);

    // ChzzkClient 생성
    const client = new ChzzkClient({
      nidAuth,
      nidSession
    });

    // 채팅 인스턴스 생성
    const chat = client.chat({
      channelId: chzzkChannelId,
      pollInterval: 30 * 1000 // 30초마다 채널 변화 감지
    });

    // 이벤트 핸들러 등록
    this.setupEventHandlers(chat, chzzkChannelId);

    // 연결 시작
    await chat.connect();

    // 세션 저장
    this.sessions.set(chzzkChannelId, {
      client,
      chat,
      channelId: chzzkChannelId,
      createdAt: new Date()
    });

    console.log(`[ChzzkSession] Session started for channel: ${chzzkChannelId}`);
  }

  /**
   * 이벤트 핸들러 설정
   */
  private setupEventHandlers(chat: ChzzkChat, chzzkChannelId: string): void {
    // 연결 완료
    chat.on('connect', () => {
      console.log(`[ChzzkSession] Connected to channel: ${chzzkChannelId}`);
      // 최근 채팅/후원 요청
      chat.requestRecentChat(50);
    });

    // 재연결
    chat.on('reconnect', (newChatChannelId) => {
      console.log(`[ChzzkSession] Reconnected to channel: ${chzzkChannelId} (new chat channel: ${newChatChannelId})`);
    });

    // 후원 이벤트 (핵심!)
    // 타입은 any로 받고 내부에서 안전하게 추출
    chat.on('donation', async (donation: any) => {
      const donationData: DonationData = {
        profile: donation?.profile,
        message: donation?.message,
        extras: donation?.extras
      };
      
      console.log(`[ChzzkSession] Donation received on channel ${chzzkChannelId}:`, {
        nickname: donationData.profile?.nickname || '익명',
        amount: donationData.extras?.payAmount,
        message: donationData.message,
        type: donationData.extras?.donationType
      });

      await this.handleDonation(chzzkChannelId, donationData);
    });

    // 구독 이벤트 (선택적)
    chat.on('subscription', (subscription: any) => {
      console.log(`[ChzzkSession] Subscription on channel ${chzzkChannelId}:`, {
        nickname: subscription.profile?.nickname,
        month: subscription.extras?.month,
        tier: subscription.extras?.tierName
      });
    });

    // 시스템 메시지
    chat.on('systemMessage', (sys: any) => {
      console.log(`[ChzzkSession] System message on channel ${chzzkChannelId}:`, sys.extras?.description);
    });
  }

  /**
   * 도네이션 이벤트 처리 (핵심 로직)
   * 
   * 치지직에서 직접 받은 데이터만 신뢰합니다.
   */
  private async handleDonation(chzzkChannelId: string, donation: DonationData): Promise<void> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. 채널 조회
      const channelResult = await client.query(
        'SELECT id FROM channels WHERE chzzk_channel_id = $1',
        [chzzkChannelId]
      );

      if (channelResult.rows.length === 0) {
        console.error(`[ChzzkSession] Channel not found: ${chzzkChannelId}`);
        await client.query('ROLLBACK');
        return;
      }

      const channelId = channelResult.rows[0].id;

      // 2. 후원자 조회/생성 (치지직 채널 ID로)
      const donatorChzzkId = donation.extras?.donatorChannelId || donation.profile?.userIdHash;
      let viewerUserId: string | null = null;

      if (donatorChzzkId && !donation.extras?.isAnonymous) {
        // 기존 유저 조회
        const userResult = await client.query(
          'SELECT id FROM users WHERE chzzk_user_id = $1',
          [donatorChzzkId]
        );

        if (userResult.rows.length > 0) {
          viewerUserId = userResult.rows[0].id;
        } else {
          // 새 유저 생성 (뷰어로)
          const newUserResult = await client.query(
            `INSERT INTO users (chzzk_user_id, display_name, role)
             VALUES ($1, $2, 'viewer')
             RETURNING id`,
            [donatorChzzkId, donation.profile?.nickname || '익명']
          );
          viewerUserId = newUserResult.rows[0].id;
        }
      }

      // 3. 고유 도네이션 ID 생성 (중복 방지)
      // 치지직에서 제공하는 고유 ID가 없으므로 타임스탬프 + 채널 + 금액 + 메시지 해시로 생성
      const donationTimestamp = new Date().toISOString();
      const payAmount = donation.extras?.payAmount || 0;
      const chzzkDonationId = `${chzzkChannelId}_${donationTimestamp}_${payAmount}_${Buffer.from(donation.message || '').toString('base64').slice(0, 20)}`;

      // 4. 중복 체크
      const existingDonation = await client.query(
        'SELECT id FROM donation_events WHERE chzzk_donation_id = $1',
        [chzzkDonationId]
      );

      if (existingDonation.rows.length > 0) {
        console.log(`[ChzzkSession] Duplicate donation ignored: ${chzzkDonationId}`);
        await client.query('ROLLBACK');
        return;
      }

      // 5. donation_events 저장 (치지직 데이터 기준!)
      const donationResult = await client.query(
        `INSERT INTO donation_events (
          channel_id, viewer_user_id, amount, status, source,
          chzzk_donation_id, chzzk_donator_channel_id, chzzk_donator_nickname,
          chzzk_donation_text, chzzk_raw_data, occurred_at
        ) VALUES ($1, $2, $3, 'OCCURRED', 'session', $4, $5, $6, $7, $8, now())
        RETURNING id`,
        [
          channelId,
          viewerUserId,
          payAmount,  // 치지직에서 받은 실제 금액
          chzzkDonationId,
          donatorChzzkId,
          donation.profile?.nickname || '익명',
          donation.message || '',     // 치지직에서 받은 실제 메시지
          JSON.stringify(donation)    // 원본 데이터 저장
        ]
      );

      const donationEventId = donationResult.rows[0].id;

      // 6. messages 테이블에도 저장 (피드에 표시하기 위해)
      if (donation.message && donation.message.trim()) {
        await client.query(
          `INSERT INTO messages (
            channel_id, author_user_id, type, visibility, content, related_donation_id
          ) VALUES ($1, $2, 'donation', 'public', $3, $4)`,
          [
            channelId,
            viewerUserId,
            donation.message.trim(),  // 치지직에서 받은 실제 메시지
            donationEventId
          ]
        );
      }

      // 7. 뱃지 자동 부여 (누적 금액 계산)
      if (viewerUserId) {
        await this.updateBadge(client, viewerUserId, channelId);
      }

      await client.query('COMMIT');

      console.log(`[ChzzkSession] Donation saved: ${payAmount}원 from ${donation.profile?.nickname || '익명'}`);

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('[ChzzkSession] Failed to handle donation:', error);
    } finally {
      client.release();
    }
  }

  /**
   * 뱃지 자동 부여
   */
  private async updateBadge(client: any, userId: string, channelId: string): Promise<void> {
    try {
      // 누적 후원액 계산
      const totalResult = await client.query(
        `SELECT COALESCE(SUM(amount), 0) as total
         FROM donation_events
         WHERE viewer_user_id = $1 AND channel_id = $2 AND status IN ('OCCURRED', 'CONFIRMED')`,
        [userId, channelId]
      );

      const totalAmount = parseInt(totalResult.rows[0].total) || 0;

      // 달성 가능한 최고 티어 뱃지 찾기
      const badgeResult = await client.query(
        `SELECT id, tier, threshold_amount
         FROM badges
         WHERE channel_id = $1 AND threshold_amount <= $2
         ORDER BY threshold_amount DESC
         LIMIT 1`,
        [channelId, totalAmount]
      );

      if (badgeResult.rows.length > 0) {
        const badge = badgeResult.rows[0];

        // 뱃지 부여 (중복 시 무시)
        await client.query(
          `INSERT INTO user_badges (user_id, channel_id, badge_id)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, channel_id, badge_id) DO NOTHING`,
          [userId, channelId, badge.id]
        );

        console.log(`[ChzzkSession] Badge awarded: ${badge.tier} to user ${userId}`);
      }
    } catch (error) {
      console.error('[ChzzkSession] Failed to update badge:', error);
    }
  }

  /**
   * 세션 종료
   */
  async stopSession(chzzkChannelId: string): Promise<void> {
    const session = this.sessions.get(chzzkChannelId);
    if (!session) {
      return;
    }

    console.log(`[ChzzkSession] Stopping session for channel: ${chzzkChannelId}`);

    try {
      session.chat.disconnect();
    } catch (error) {
      console.error(`[ChzzkSession] Error disconnecting chat:`, error);
    }

    this.sessions.delete(chzzkChannelId);

    // DB 상태 업데이트
    await pool.query(
      `UPDATE channels SET chzzk_session_active = false WHERE chzzk_channel_id = $1`,
      [chzzkChannelId]
    );

    console.log(`[ChzzkSession] Session stopped for channel: ${chzzkChannelId}`);
  }

  /**
   * 세션 활성 상태 확인
   */
  isSessionActive(chzzkChannelId: string): boolean {
    return this.sessions.has(chzzkChannelId);
  }

  /**
   * 모든 세션 종료
   */
  async stopAllSessions(): Promise<void> {
    console.log(`[ChzzkSession] Stopping all sessions...`);
    
    for (const channelId of this.sessions.keys()) {
      await this.stopSession(channelId);
    }
  }

  /**
   * 서버 시작 시 기존 세션 복구
   */
  async restoreActiveSessions(): Promise<void> {
    console.log(`[ChzzkSession] Restoring active sessions...`);

    try {
      const result = await pool.query(
        `SELECT chzzk_channel_id, chzzk_client_id, chzzk_client_secret
         FROM channels
         WHERE chzzk_client_id IS NOT NULL 
           AND chzzk_client_secret IS NOT NULL
           AND chzzk_session_active = true`
      );

      for (const row of result.rows) {
        try {
          await this.startSession(
            row.chzzk_channel_id,
            row.chzzk_client_id,
            row.chzzk_client_secret
          );
        } catch (error) {
          console.error(`[ChzzkSession] Failed to restore session for ${row.chzzk_channel_id}:`, error);
        }
      }

      console.log(`[ChzzkSession] Restored ${result.rows.length} sessions`);
    } catch (error) {
      console.error('[ChzzkSession] Failed to restore sessions:', error);
    }
  }
}

// 서버 종료 시 세션 정리
process.on('SIGTERM', async () => {
  console.log('[ChzzkSession] SIGTERM received, cleaning up sessions...');
  await ChzzkSessionManager.getInstance().stopAllSessions();
});

process.on('SIGINT', async () => {
  console.log('[ChzzkSession] SIGINT received, cleaning up sessions...');
  await ChzzkSessionManager.getInstance().stopAllSessions();
});
