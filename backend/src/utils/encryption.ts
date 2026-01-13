import crypto from 'crypto';

// 암호화 키는 환경 변수에서 가져오거나, 자동 생성 (개발용)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

// 키를 Buffer로 변환 (32바이트 = 256비트)
function getKey(): Buffer {
  const key = ENCRYPTION_KEY.length === 64 
    ? Buffer.from(ENCRYPTION_KEY, 'hex')
    : crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  return key;
}

/**
 * 텍스트를 암호화
 */
export function encrypt(text: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // IV + AuthTag + EncryptedData 형식으로 저장
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

/**
 * 암호화된 텍스트를 복호화
 */
export function decrypt(encryptedText: string): string {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format');
    }
    
    const key = getKey();
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * 환경 변수에서 암호화 키를 확인하고 경고
 */
export function checkEncryptionKey(): void {
  if (!process.env.ENCRYPTION_KEY) {
    console.warn('⚠️  ENCRYPTION_KEY not set. Using auto-generated key (NOT SECURE for production!)');
    console.warn('💡 Set ENCRYPTION_KEY in .env file (32 bytes hex string or any string)');
  } else {
    console.log('✅ Encryption key loaded from environment');
  }
}
