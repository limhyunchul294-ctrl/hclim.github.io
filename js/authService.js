// js/authService.js
// ✅ 수정사항: 캐싱 추가, 세션 오류 처리 개선

window.authService = {
  /**
   * 사용자 정보 캐시 (메모리)
   */
  _userInfoCache: null,
  _userInfoCacheTime: 0,
  _cacheExpiry: 5 * 60 * 1000, // 5분

  /**
   * 사용자 역할 조회 (admin, user 등)
   */
  async getUserRole() {
    try {
      // 개발 환경에서는 목업 데이터 반환
      if (window.APP_CONFIG?.ENV === 'development') {
        console.log('📦 개발 환경: 목업 역할 반환 (admin)');
        return 'admin';
      }

      // 1. 세션 확인
      const session = await window.authSession?.getSession();
      if (!session || !session.user) {
        console.warn('⚠️ 세션이 없습니다');
        return null;
      }

      // 2. 사용자 ID로 DB 조회
      const userId = session.user.id;
      const userPhone = session.user.phone?.replace(/^\+82/, '0') || session.user.phone;
      console.log('🔍 사용자 역할 조회:', userId);

      // 방법 1: auth_user_id로 조회 시도
      let { data: userInfo, error } = await window.supabaseClient
        .from('users')
        .select('role')
        .eq('auth_user_id', userId)
        .single();

      // 방법 2: auth_user_id로 조회 실패 시 전화번호로 조회 시도
      if (error && error.code === 'PGRST116' && userPhone) {
        console.log('🔄 auth_user_id로 조회 실패, 전화번호로 재시도:', userPhone);
        const phoneNormalized = userPhone.replace(/-/g, '');
        
        const result = await window.supabaseClient
          .from('users')
          .select('role')
          .eq('phone', phoneNormalized)
          .maybeSingle();
        
        if (result.data) {
          userInfo = result.data;
          error = null;
        } else {
          error = result.error || { code: 'PGRST116' };
        }
      }

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn('⚠️ DB에 사용자 정보가 없습니다');
          return 'user';
        }
        console.error('❌ 사용자 역할 조회 오류:', error.message);
        return 'user';
      }

      const role = userInfo?.role || 'user';
      console.log('✅ 사용자 역할 조회 성공:', role);
      return role;

    } catch (error) {
      console.error('❌ getUserRole 오류:', error);
      return 'user';
    }
  },

  /**
   * 사용자 정보 조회 (캐싱 적용)
   * 반환값: { name, phone, affiliation, role, username }
   */
  async getUserInfo() {
    try {
      // 개발 환경에서는 목업 데이터 반환
      if (window.APP_CONFIG?.ENV === 'development') {
        console.log('📦 개발 환경: 목업 사용자 정보 반환');
        return {
          name: '김정비',
          phone: '010-1234-5678',
          affiliation: 'EVKMC A/S',
          role: 'admin',
          username: 'kimjungbi'
        };
      }

      // 1. 캐시 확인 (5분 이내)
      const now = Date.now();
      if (this._userInfoCache && (now - this._userInfoCacheTime) < this._cacheExpiry) {
        console.log('📦 캐시된 사용자 정보 반환');
        return this._userInfoCache;
      }

      // 2. 세션 확인
      const session = await window.authSession?.getSession();
      if (!session || !session.user) {
        console.warn('⚠️ 세션이 없습니다');
        return null;
      }

      // 3. 사용자 정보 DB 조회
      const userId = session.user.id;
      const userPhone = session.user.phone?.replace(/^\+82/, '0') || session.user.phone; // +8210... -> 010...
      
      console.log('🔍 사용자 정보 조회:', userId);
      console.log('📱 전화번호:', userPhone);

      // 방법 1: auth_user_id로 조회 시도
      let { data: userInfo, error } = await window.supabaseClient
        .from('users')
        .select('username, phone, name, affiliation, role, auth_user_id')
        .eq('auth_user_id', userId)
        .single();

      // 방법 2: auth_user_id로 조회 실패 시 전화번호로 조회 시도
      if (error && error.code === 'PGRST116' && userPhone) {
        console.log('🔄 auth_user_id로 조회 실패, 전화번호로 재시도:', userPhone);
        const phoneNormalized = userPhone.replace(/-/g, ''); // 하이픈 제거
        
        const result = await window.supabaseClient
          .from('users')
          .select('username, phone, name, affiliation, role, auth_user_id')
          .eq('phone', phoneNormalized)
          .maybeSingle(); // single() 대신 maybeSingle() 사용
        
        if (result.data) {
          userInfo = result.data;
          error = null;
          console.log('✅ 전화번호로 사용자 정보 조회 성공:', userInfo.username);
          
          // auth_user_id가 없으면 업데이트 시도
          if (!userInfo.auth_user_id) {
            console.log('🔄 auth_user_id 업데이트 시도...');
            const { error: updateError } = await window.supabaseClient
              .from('users')
              .update({ auth_user_id: userId })
              .eq('phone', phoneNormalized);
            
            if (updateError) {
              console.warn('⚠️ auth_user_id 업데이트 실패:', updateError.message);
            } else {
              console.log('✅ auth_user_id 업데이트 성공');
              userInfo.auth_user_id = userId;
            }
          }
        } else {
          error = result.error || { code: 'PGRST116', message: '사용자 정보를 찾을 수 없습니다' };
        }
      }

      if (error) {
        if (error.code === 'PGRST116') {
          console.warn('⚠️ DB에 사용자 정보가 없습니다');
          console.warn('   - auth_user_id:', userId);
          console.warn('   - 전화번호:', userPhone);
          return null;
        }
        console.error('❌ 사용자 정보 조회 오류:', error.message);
        console.error('   RLS 정책 또는 DB 연결 확인 필요');
        return null;
      }

      console.log('✅ 사용자 정보 조회 성공:', userInfo.name || userInfo.username);

      // 4. 캐시에 저장
      this._userInfoCache = userInfo;
      this._userInfoCacheTime = now;

      return userInfo;

    } catch (error) {
      console.error('❌ getUserInfo 오류:', error);
      return null;
    }
  },

  /**
   * 사용자가 관리자인지 확인
   */
  async isAdmin() {
    try {
      const role = await this.getUserRole();
      return role === 'admin';
    } catch (error) {
      console.error('❌ isAdmin 오류:', error);
      return false;
    }
  },

  /**
   * 사용자 이름 조회 (짧은 정보)
   */
  async getUserName() {
    try {
      const userInfo = await this.getUserInfo();
      return userInfo?.name || '사용자';
    } catch (error) {
      console.error('❌ getUserName 오류:', error);
      return '사용자';
    }
  },

  /**
   * 사용자 소속 조회 (짧은 정보)
   */
  async getUserAffiliation() {
    try {
      const userInfo = await this.getUserInfo();
      return userInfo?.affiliation || '소속 없음';
    } catch (error) {
      console.error('❌ getUserAffiliation 오류:', error);
      return '소속 없음';
    }
  },

  /**
   * 캐시 초기화 (로그아웃 시 호출)
   */
  clearCache() {
    console.log('🗑️ 사용자 정보 캐시 초기화');
    this._userInfoCache = null;
    this._userInfoCacheTime = 0;
  },

  /**
   * 사용자 정보 강제 새로고침
   */
  async refreshUserInfo() {
    try {
      console.log('🔄 사용자 정보 강제 새로고침');
      this._userInfoCache = null;
      this._userInfoCacheTime = 0;
      
      const userInfo = await this.getUserInfo();
      console.log('✅ 사용자 정보 새로고침 완료');
      return userInfo;
    } catch (error) {
      console.error('❌ refreshUserInfo 오류:', error);
      return null;
    }
  }
};

console.log('✅ authService 로드 완료');