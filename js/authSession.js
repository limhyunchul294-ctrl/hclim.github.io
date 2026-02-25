// js/authSession.js
// ✅ 수정사항: 세션 캐싱 + 자동 갱신 + 만료 시간 체크 + 로그인 시간 추적

window.authSession = {
  /**
   * 세션 캐시 (메모리)
   */
  _sessionCache: null,
  _lastFetchTime: null,
  _sessionCheckInProgress: false,
  
  // 캐시 유효 시간 (5분)
  CACHE_DURATION: 5 * 60 * 1000,

  /**
   * 세션 캐시가 유효한지 확인
   */
  _isCacheValid() {
    if (!this._sessionCache || !this._lastFetchTime) {
      return false;
    }

    const now = Date.now();
    const cacheAge = now - this._lastFetchTime;
    
    // 캐시가 5분 이상 오래됨
    if (cacheAge > this.CACHE_DURATION) {
      console.log('⏰ 캐시가 오래되었습니다 (' + Math.floor(cacheAge / 1000) + '초)');
      return false;
    }

    // 세션 만료 시간 확인
    if (this._sessionCache.expires_at) {
      const expiresAt = this._sessionCache.expires_at * 1000;
      const timeUntilExpiry = expiresAt - now;
      
      // 세션이 만료되었으면 캐시 무효화
      if (timeUntilExpiry <= 0) {
        console.log('⏰ 세션이 만료되었습니다');
        return false;
      }
    }

    return true;
  },

  /**
   * 현재 로그인된 세션 조회
   */
  async getSession() {
    try {
      if (!window.supabaseClient) {
        console.error('❌ Supabase 클라이언트가 초기화되지 않았습니다');
        return null;
      }

      // 1. 캐시가 유효하면 반환
      if (this._isCacheValid()) {
        console.log('📦 캐시된 세션 반환');
        return this._sessionCache;
      }

      // 2. 캐시가 만료되었거나 없으면 새로 조회
      console.log('🔍 Supabase에서 세션 조회 중...');
      const { data: { session }, error } = await window.supabaseClient.auth.getSession();
      
      if (error) {
        console.error('❌ 세션 조회 오류:', error.message);
        this._sessionCache = null;
        this._lastFetchTime = null;
        return null;
      }

      // 3. 세션 캐시 업데이트
      if (session) {
        console.log('✅ 새로운 세션 획득:', session.user.id);
        this._sessionCache = session;
        this._lastFetchTime = Date.now();
      } else {
        console.log('⚠️ 세션이 없습니다');
        this._sessionCache = null;
        this._lastFetchTime = null;
      }

      return session;

    } catch (e) {
      console.error('❌ getSession 오류:', e);
      this._sessionCache = null;
      this._lastFetchTime = null;
      return null;
    }
  },

  /**
   * 사용자가 로그인했는지 확인
   */
  async isAuthenticated() {
    try {
      const session = await this.getSession();
      const isAuth = session !== null && session.access_token !== null;
      
      if (isAuth) {
        console.log('✅ 사용자 인증됨:', session.user.id);
      } else {
        console.log('⚠️ 사용자 미인증');
      }
      
      return isAuth;
    } catch (error) {
      console.error('❌ isAuthenticated 오류:', error);
      return false;
    }
  },

  /**
   * 세션 갱신 (토큰 만료 전 갱신)
   */
  async refreshSession() {
    try {
      if (!window.supabaseClient) {
        console.error('❌ Supabase 클라이언트가 초기화되지 않았습니다');
        return null;
      }

      console.log('🔄 세션 갱신 시작...');

      // 캐시 초기화
      this._sessionCache = null;
      this._lastFetchTime = null;

      const { data: { session }, error } = await window.supabaseClient.auth.refreshSession();
      
      if (error) {
        console.error('❌ 세션 갱신 오류:', error.message);
        return null;
      }

      if (session) {
        console.log('✅ 세션 갱신 완료:', session.user.id);
        this._sessionCache = session;
        this._lastFetchTime = Date.now();
      } else {
        console.log('⚠️ 갱신된 세션이 없습니다');
      }

      return session;
    } catch (e) {
      console.error('❌ refreshSession 오류:', e);
      this._sessionCache = null;
      this._lastFetchTime = null;
      return null;
    }
  },

  /**
   * 로그아웃
   */
  async logout() {
    try {
      if (!window.supabaseClient) {
        console.error('❌ Supabase 클라이언트가 초기화되지 않았습니다');
        return;
      }

      console.log('🔄 로그아웃 시작...');

      // 1. Supabase에서 로그아웃
      await window.supabaseClient.auth.signOut();

      // 2. 캐시 초기화
      this._sessionCache = null;
      this._lastFetchTime = null;

      console.log('✅ 로그아웃 완료');
      
      // 3. 리다이렉트
      window.location.href = 'login.html';
    } catch (e) {
      console.error('❌ logout 오류:', e);
      this._sessionCache = null;
      this._lastFetchTime = null;
      window.location.href = 'login.html';
    }
  },

  /**
   * 현재 사용자 ID 조회
   */
  async getUserId() {
    try {
      const session = await this.getSession();
      if (!session || !session.user) {
        return null;
      }
      return session.user.id;
    } catch (error) {
      console.error('❌ getUserId 오류:', error);
      return null;
    }
  },

  /**
   * 현재 사용자 이메일 조회
   */
  async getUserEmail() {
    try {
      const session = await this.getSession();
      if (!session || !session.user) {
        return null;
      }
      return session.user.email;
    } catch (error) {
      console.error('❌ getUserEmail 오류:', error);
      return null;
    }
  },

  /**
   * 접근 토큰 조회 (API 호출 시 필요)
   */
  async getAccessToken() {
    try {
      const session = await this.getSession();
      if (!session) {
        console.warn('⚠️ 세션이 없어서 토큰을 가져올 수 없습니다');
        return null;
      }

      // 토큰 만료 여부 확인 (자동 갱신 비활성화)
      // 세션이 만료되면 자동으로 로그아웃 처리
      if (session.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        const expiresIn = session.expires_at - now;

        // 세션이 만료되었으면 로그아웃
        if (expiresIn <= 0) {
          console.log('⚠️ 세션이 만료되었습니다. 로그아웃합니다...');
          await this.logout();
          return null;
        }
        
      // 5분 미만 남으면 경고 로그
      if (expiresIn < 300 && expiresIn > 0) {
        console.warn('⚠️ 세션 만료 임박:', Math.floor(expiresIn / 60), '분', expiresIn % 60, '초 남음');
      }
    }

    return session.access_token;
    } catch (error) {
      console.error('❌ getAccessToken 오류:', error);
      return null;
    }
  },

  /**
   * 세션 초기화 (강제 새로고침)
   */
  async resetSession() {
    try {
      console.log('🔄 세션 초기화 중...');
      
      this._sessionCache = null;
      this._lastFetchTime = null;
      
      // Supabase에서 새로 조회
      const { data: { session }, error } = await window.supabaseClient.auth.getSession();
      
      if (error) {
        console.error('❌ 세션 초기화 오류:', error.message);
        return null;
      }

      if (session) {
        this._sessionCache = session;
        this._lastFetchTime = Date.now();
        console.log('✅ 세션 초기화 완료 (새로운 세션 획득)');
      } else {
        console.log('⚠️ 세션이 없습니다');
      }

      return session;
    } catch (error) {
      console.error('❌ resetSession 오류:', error);
      return null;
    }
  },

  /**
   * 마지막 로그인 시간 조회 (users 테이블에서)
   */
  async getLastLoginTime() {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        console.warn('⚠️ 사용자 ID가 없습니다');
        return null;
      }

      const { data, error } = await window.supabaseClient
        .from('users')
        .select('last_login_at')
        .eq('auth_user_id', userId)
        .single();

      if (error) {
        console.error('❌ 마지막 로그인 시간 조회 실패:', error);
        return null;
      }

      return data?.last_login_at;
    } catch (error) {
      console.error('❌ getLastLoginTime 오류:', error);
      return null;
    }
  },

  /**
   * 로그인 시간 수동 업데이트 (폴백용)
   * 트리거가 작동하지 않을 경우를 대비
   */
  async updateLastLoginTime() {
    try {
      const userId = await this.getUserId();
      if (!userId) {
        console.warn('⚠️ 사용자 ID가 없습니다');
        return false;
      }

      const { error } = await window.supabaseClient
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('auth_user_id', userId);

      if (error) {
        console.error('❌ 로그인 시간 업데이트 실패:', error);
        return false;
      }

      console.log('✅ 마지막 로그인 시간 업데이트 완료');
      return true;
    } catch (error) {
      console.error('❌ updateLastLoginTime 오류:', error);
      return false;
    }
  },

  /**
   * 세션 상태 출력 (디버깅용)
   */
  async printSessionInfo() {
    const session = await this.getSession();
    
    if (!session) {
      console.log('❌ 세션이 없습니다');
      return;
    }

    const now = Date.now();
    const expiresAt = new Date(session.expires_at * 1000);
    const timeUntilExpiry = expiresAt - now;
    const cacheAge = this._lastFetchTime ? now - this._lastFetchTime : 0;
    
    // 세션 시작 시간 계산 (만료 시간 - 세션 유효 기간)
    // 세션 유효 기간: 30분 (사용자 요청)
    const sessionDuration = 30 * 60 * 1000; // 30분
    const sessionStartTime = new Date(expiresAt - sessionDuration);

    // users 테이블에서 마지막 로그인 시간 조회
    const lastLoginTime = await this.getLastLoginTime();

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 세션 정보');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 User UUID (계정 생성 기록):', session.user.id);
    console.log('🔑 로그인 시간:', sessionStartTime.toLocaleString('ko-KR'));
    console.log('🚪 마지막 로그인 기록:', lastLoginTime ? new Date(lastLoginTime).toLocaleString('ko-KR') : '(정보 없음)');
    console.log('📅 계정 생성일:', new Date(session.user.created_at).toLocaleString('ko-KR'));
    console.log('⏰ 세션 만료 시간:', expiresAt.toLocaleString('ko-KR'));
    console.log('⏳ 남은 시간:', Math.floor(timeUntilExpiry / 1000 / 60), '분', Math.floor((timeUntilExpiry / 1000) % 60), '초');
    console.log('💾 캐시 경과 시간:', Math.floor(cacheAge / 1000), '초');
    console.log('🔐 Access Token:', session.access_token.substring(0, 30) + '...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  },

  /**
   * 인증 상태 변경 리스너 설정
   * 페이지 로드 시 한 번만 호출
   */
  setupAuthListener() {
    if (!window.supabaseClient) {
      console.error('❌ Supabase 클라이언트가 초기화되지 않았습니다');
      return;
    }

    window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 인증 상태 변경:', event);
      
      // 자동 토큰 갱신 비활성화 - 사용자가 수동으로 갱신해야 함
      // if (event === 'TOKEN_REFRESHED') {
      //   console.log('✅ 토큰 자동 갱신됨');
      //   this._sessionCache = session;
      //   this._lastFetchTime = Date.now();
      // } else 
      if (event === 'SIGNED_IN') {
        console.log('✅ 로그인됨');
        this._sessionCache = session;
        this._lastFetchTime = Date.now();
        
        // 30분 세션 타이머 시작 (localStorage에 로그인 시간 저장)
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('session_login_time', Date.now().toString());
          console.log('✅ 30분 세션 타이머 시작');
        }
        
        // 로그인 시간 업데이트 (폴백)
        // 트리거가 작동하지 않을 경우를 대비
        setTimeout(() => {
          this.updateLastLoginTime();
        }, 1000);
      } else if (event === 'SIGNED_OUT') {
        console.log('⚠️ 로그아웃됨');
        this._sessionCache = null;
        this._lastFetchTime = null;
      }
    });

    console.log('✅ 인증 리스너 설정 완료');
  }
};

// 페이지 로드 시 리스너 자동 설정
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.authSession.setupAuthListener();
  });
} else {
  window.authSession.setupAuthListener();
}

console.log('✅ authSession 로드 완료');