import axios from 'axios';
import { pool } from '../db/pool';
import { encrypt, decrypt } from './encryption';

/**
 * Access Token이 만료되었는지 확인
 */
export async function isTokenExpired(userId: string): Promise<boolean> {
  try {
    const result = await pool.query(
      `SELECT expires_at FROM oauth_tokens WHERE user_id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return true; // 토큰이 없으면 만료로 간주
    }
    
    const expiresAt = new Date(result.rows[0].expires_at);
    const now = new Date();
    
    // 만료 5분 전에 갱신
    const bufferTime = 5 * 60 * 1000; // 5분
    return expiresAt.getTime() - now.getTime() < bufferTime;
  } catch (error) {
    console.error('Token expiry check error:', error);
    return true; // 에러 시 만료로 간주
  }
}

/**
 * Refresh Token으로 Access Token 갱신
 */
export async function refreshAccessToken(userId: string): Promise<string | null> {
  try {
    // 암호화된 토큰 조회
    const tokenResult = await pool.query(
      `SELECT refresh_token, access_token FROM oauth_tokens WHERE user_id = $1`,
      [userId]
    );
    
    if (tokenResult.rows.length === 0) {
      console.error('No OAuth tokens found for user:', userId);
      return null;
    }
    
    // Refresh Token 복호화
    let refreshToken: string;
    try {
      refreshToken = decrypt(tokenResult.rows[0].refresh_token);
    } catch (error) {
      console.error('Failed to decrypt refresh token:', error);
      return null;
    }
    
    // 치지직 API로 토큰 갱신
    const tokenResp = await axios.post(
      'https://api.chzzk.naver.com/auth/v1/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: process.env.CHZZK_CLIENT_ID!,
        client_secret: process.env.CHZZK_CLIENT_SECRET!,
        refresh_token: refreshToken,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    
    const { access_token, refresh_token: new_refresh_token, expires_in } = tokenResp.data;
    
    // 새 토큰 암호화하여 저장
    const encryptedAccessToken = encrypt(access_token);
    const encryptedRefreshToken = new_refresh_token ? encrypt(new_refresh_token) : tokenResult.rows[0].refresh_token;
    
    await pool.query(
      `UPDATE oauth_tokens 
       SET access_token = $1, 
           refresh_token = $2, 
           expires_at = $3,
           updated_at = now()
       WHERE user_id = $4`,
      [
        encryptedAccessToken,
        encryptedRefreshToken,
        new Date(Date.now() + expires_in * 1000),
        userId,
      ]
    );
    
    return access_token;
  } catch (error: any) {
    console.error('Token refresh error:', error?.response?.data || error);
    
    // Refresh Token이 만료되었거나 유효하지 않은 경우
    if (error?.response?.status === 401 || error?.response?.status === 400) {
      // 토큰 삭제 (재인증 필요)
      await pool.query(
        `DELETE FROM oauth_tokens WHERE user_id = $1`,
        [userId]
      );
    }
    
    return null;
  }
}

/**
 * Access Token 조회 (필요 시 자동 갱신)
 */
export async function getAccessToken(userId: string): Promise<string | null> {
  try {
    // 만료 확인
    if (await isTokenExpired(userId)) {
      console.log('Token expired, refreshing...');
      const newToken = await refreshAccessToken(userId);
      if (newToken) {
        return newToken;
      }
      // 갱신 실패 시 기존 토큰 시도
    }
    
    // 암호화된 토큰 조회
    const result = await pool.query(
      `SELECT access_token FROM oauth_tokens WHERE user_id = $1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    // 복호화
    try {
      return decrypt(result.rows[0].access_token);
    } catch (error) {
      console.error('Failed to decrypt access token:', error);
      return null;
    }
  } catch (error) {
    console.error('Get access token error:', error);
    return null;
  }
}
