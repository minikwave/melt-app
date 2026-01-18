import express from 'express';
import { AuthRequest, authRequired } from '../middleware/auth';

const router = express.Router();

// 알림 목록 (스텁: 실제 알림 테이블/로직 연동 전)
router.get('/', authRequired, async (_req: AuthRequest, res) => {
  res.json({ notifications: [] });
});

// 읽지 않은 알림 수 (스텁)
router.get('/unread-count', authRequired, async (_req: AuthRequest, res) => {
  res.json({ unreadCount: 0 });
});

// 알림 읽음 처리 (스텁)
router.post('/:id/read', authRequired, async (req: AuthRequest, res) => {
  res.json({ ok: true });
});

export default router;
