/**
 * 더미 데이터 생성 스크립트
 * 로컬 개발 및 테스트용
 */

import { pool } from '../db/pool';
import crypto from 'crypto';

async function seed() {
  try {
    console.log('🌱 Starting seed...');

    // 1. 더미 유저 생성
    const users = [];
    
    // 크리에이터 3명
    for (let i = 1; i <= 3; i++) {
      const chzzkUserId = `creator_${i}_${crypto.randomBytes(8).toString('hex')}`;
      const userResult = await pool.query(
        `INSERT INTO users (chzzk_user_id, display_name, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (chzzk_user_id) DO UPDATE SET display_name = $2
         RETURNING id, chzzk_user_id`,
        [`creator_${i}`, `크리에이터${i}`, 'creator']
      );
      users.push({ ...userResult.rows[0], role: 'creator' });
      console.log(`✅ Created creator: ${userResult.rows[0].chzzk_user_id}`);
    }

    // 시청자 10명
    for (let i = 1; i <= 10; i++) {
      const chzzkUserId = `viewer_${i}_${crypto.randomBytes(8).toString('hex')}`;
      const userResult = await pool.query(
        `INSERT INTO users (chzzk_user_id, display_name, role)
         VALUES ($1, $2, $3)
         ON CONFLICT (chzzk_user_id) DO UPDATE SET display_name = $2
         RETURNING id, chzzk_user_id`,
        [`viewer_${i}`, `시청자${i}`, 'viewer']
      );
      users.push({ ...userResult.rows[0], role: 'viewer' });
    }
    console.log(`✅ Created ${users.length} users`);

    // 2. 크리에이터 채널 생성
    const channels = [];
    for (const creator of users.filter(u => u.role === 'creator')) {
      const chzzkChannelId = `channel_${creator.chzzk_user_id}`;
      const channelResult = await pool.query(
        `INSERT INTO channels (chzzk_channel_id, name, owner_user_id, channel_url, charge_url)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (chzzk_channel_id) DO UPDATE SET name = $2
         RETURNING id, chzzk_channel_id`,
        [
          chzzkChannelId,
          `${creator.display_name}의 채널`,
          creator.id,
          `https://chzzk.naver.com/live/${chzzkChannelId}`,
          'https://game.naver.com/profile#cash'
        ]
      );
      channels.push(channelResult.rows[0]);
      console.log(`✅ Created channel: ${chzzkChannelId}`);
    }

    // 3. 시청자가 크리에이터 팔로우
    const viewers = users.filter((u: any) => u.role === 'viewer');
    for (const channel of channels) {
      for (let i = 0; i < 5; i++) {
        const viewer = viewers[Math.floor(Math.random() * viewers.length)];
        await pool.query(
          `INSERT INTO user_follows (user_id, channel_id)
           VALUES ($1, $2)
           ON CONFLICT (user_id, channel_id) DO NOTHING`,
          [viewer.id, channel.id]
        );
      }
    }
    console.log('✅ Created follows');

    // 4. 더미 메시지 생성
    for (const channel of channels) {
      const channelOwner = users.find((u: any) => u.id === channel.owner_user_id);
      const channelViewers = viewers.slice(0, 5);

      // 크리에이터 공개 메시지
      await pool.query(
        `INSERT INTO messages (channel_id, author_user_id, type, visibility, content)
         VALUES ($1, $2, 'creator_post', 'public', $3)`,
        [channel.id, channelOwner.id, `안녕하세요! ${channelOwner.display_name}입니다. 방송 외 시간에도 응원해주셔서 감사합니다!`]
      );

      // 시청자 DM
      for (const viewer of channelViewers) {
        await pool.query(
          `INSERT INTO messages (channel_id, author_user_id, type, visibility, content)
           VALUES ($1, $2, 'dm', 'private', $3)`,
          [channel.id, viewer.id, `${viewer.display_name}의 비공개 메시지입니다.`]
        );
      }

      // 치즈 후원 메시지 (공개)
      for (let i = 0; i < 3; i++) {
        const viewer = channelViewers[i];
        const donationResult = await pool.query(
          `INSERT INTO donation_events (channel_id, viewer_user_id, amount, status, source)
           VALUES ($1, $2, $3, 'CONFIRMED', 'manual')
           RETURNING id`,
          [channel.id, viewer.id, (i + 1) * 10000]
        );

        await pool.query(
          `INSERT INTO messages (channel_id, author_user_id, type, visibility, content, related_donation_id)
           VALUES ($1, $2, 'donation', 'public', $3, $4)`,
          [
            channel.id,
            viewer.id,
            `치즈 ${(i + 1) * 10000}원과 함께 보내는 응원 메시지!`,
            donationResult.rows[0].id
          ]
        );
      }
    }
    console.log('✅ Created messages');

    // 5. RT 생성 (일부 DM을 공개로)
    for (const channel of channels) {
      const channelOwner = (users as any[]).find((u: any) => u.id === channel.owner_user_id);
      const dmResult = await pool.query(
        `SELECT id FROM messages 
         WHERE channel_id = $1 AND type = 'dm' 
         LIMIT 1`,
        [channel.id]
      );

      if (dmResult.rows.length > 0) {
        await pool.query(
          `INSERT INTO retweets (channel_id, message_id, creator_user_id)
           VALUES ($1, $2, $3)
           ON CONFLICT (message_id) DO NOTHING`,
          [channel.id, dmResult.rows[0].id, channelOwner.id]
        );
      }
    }
    console.log('✅ Created retweets');

    console.log('\n🎉 Seed completed!');
    console.log('\n📝 Test accounts (use in /dev/login):');
    console.log('\n  👑 Creators:');
    (users as any[]).filter((u: any) => u.role === 'creator').forEach((u: any) => {
      console.log(`    - ${u.chzzk_user_id} (${u.display_name})`);
    });
    console.log('\n  👥 Viewers:');
    (users as any[]).filter((u: any) => u.role === 'viewer').slice(0, 5).forEach((u: any) => {
      console.log(`    - ${u.chzzk_user_id} (${u.display_name})`);
    });
    console.log('\n💡 Tip: Visit http://localhost:3000/dev/login to test');
  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed();
