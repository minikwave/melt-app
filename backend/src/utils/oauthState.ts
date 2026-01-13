// OAuth State 검증을 위한 메모리 저장소
// 프로덕션에서는 Redis 사용 권장

interface StateEntry {
  state: string;
  expiresAt: number;
}

const stateStore = new Map<string, StateEntry>();

// State 만료 시간 (10분)
const STATE_EXPIRY_MS = 10 * 60 * 1000;

// 주기적으로 만료된 State 정리 (1분마다)
setInterval(() => {
  const now = Date.now();
  for (const [state, entry] of stateStore.entries()) {
    if (entry.expiresAt < now) {
      stateStore.delete(state);
    }
  }
}, 60 * 1000);

/**
 * State 저장
 */
export function saveState(state: string): void {
  stateStore.set(state, {
    state,
    expiresAt: Date.now() + STATE_EXPIRY_MS,
  });
}

/**
 * State 검증 및 삭제
 */
export function verifyAndDeleteState(state: string): boolean {
  const entry = stateStore.get(state);
  
  if (!entry) {
    return false; // State가 없음
  }
  
  if (entry.expiresAt < Date.now()) {
    stateStore.delete(state);
    return false; // 만료됨
  }
  
  // 검증 성공 시 삭제 (일회용)
  stateStore.delete(state);
  return true;
}

/**
 * 저장된 State 개수 (디버깅용)
 */
export function getStateCount(): number {
  return stateStore.size;
}
