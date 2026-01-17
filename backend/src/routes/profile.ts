import express from 'express';
import { pool } from '../db/pool';
import { AuthRequest, authRequired } from '../middleware/auth';

const router = express.Router();

// 프로필 조회
router.get('/', authRequired, async (req: AuthRequest, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, chzzk_user_id, display_name, role, created_at, updated_at FROM users WHERE chzzk_user_id = $1',
      [req.user?.sub]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: userResult.rows[0] });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// 프로필 업데이트
router.put('/', authRequired, async (req: AuthRequest, res) => {
  try {
    const { display_name, bio } = req.body;

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (display_name !== undefined) {
      if (typeof display_name !== 'string' || display_name.trim().length === 0) {
        return res.status(400).json({ error: 'display_name must be a non-empty string' });
      }
      if (display_name.length > 50) {
        return res.status(400).json({ error: 'display_name must be 50 characters or less' });
      }
      updates.push(`display_name = $${paramIndex}`);
      values.push(display_name.trim());
      paramIndex++;
    }

    if (bio !== undefined) {
      if (typeof bio !== 'string') {
        return res.status(400).json({ error: 'bio must be a string' });
      }
      if (bio.length > 500) {
        return res.status(400).json({ error: 'bio must be 500 characters or less' });
      }
      updates.push(`bio = $${paramIndex}`);
      values.push(bio.trim() || null);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = now()`);
    values.push(req.user?.sub);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE chzzk_user_id = $${paramIndex}
      RETURNING id, chzzk_user_id, display_name, role, bio, created_at, updated_at
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// 프로필 이미지 업로드 (임시 - 실제로는 S3 등에 업로드 필요)
router.post('/upload-image', authRequired, async (req: AuthRequest, res) => {
  try {
    // 실제 구현 시 multer 등을 사용하여 파일 업로드 처리
    // 현재는 Mock 응답 반환
    const imageUrl = `https://via.placeholder.com/200?text=Profile`;
    
    // 프로필 이미지 URL 업데이트
    await pool.query(
      `UPDATE users 
       SET profile_image = $1, updated_at = now()
       WHERE chzzk_user_id = $2`,
      [imageUrl, req.user?.sub]
    );

    res.json({ imageUrl });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

export default router;
