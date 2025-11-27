// js/dataService.js
// ✅ 수정사항: 에러 핸들링 강화, 개발/프로덕션 환경 분리

// ---- 목업 데이터 (개발용) ----

const MOCK_NOTICES = [
    {
        id: 1,
        category: '중요',
        title: '[공지] 시스템 정기 점검 안내',
        content: '정기 점검으로 인한 서비스 일시 중단 안내',
        created_at: '2024-01-15T09:00:00Z'
    },
    {
        id: 2,
        category: '일반',
        title: '[공지] 새로운 기능 업데이트',
        content: '정비 매뉴얼 검색 기능이 개선되었습니다.',
        created_at: '2024-01-10T14:30:00Z'
    },
    {
        id: 3,
        category: '업데이트',
        title: '[공지] 정비 매뉴얼 업데이트',
        content: '최신 정비 절차가 반영되었습니다.',
        created_at: '2024-01-05T11:15:00Z'
    }
];

const MOCK_PARTS = [
    { id: 1, name: '모터 컨트롤러', model: 'masada-2van', category: '전장', price: 1500000 },
    { id: 2, name: '고전압 배터리', model: 'masada-2van', category: '전장', price: 8000000 },
    { id: 3, name: '충전 인렛', model: 'masada-4van', category: '전장', price: 200000 }
];

const MOCK_VIN_INFO = {
    vin: 'SAMPLE-VIN-12345',
    model: 'MASADA 2VAN',
    year: 2024,
    color: '화이트',
    engineType: '전기',
    batteryCapacity: '58.4kWh'
};

// ---- 데이터 서비스 ----

window.dataService = {
    /**
     * 공지사항 목록 조회
     * @param {number} limit - 조회할 공지사항 개수
     */
    async getNotices(limit = 5) {
        try {
            // 개발 환경
            if (window.APP_CONFIG?.ENV === 'development') {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(MOCK_NOTICES.slice(0, limit));
                    }, 500);
                });
            }

            // 프로덕션 환경
            if (!window.supabaseClient) {
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다');
            }

            const { data, error } = await window.supabaseClient
                .from('notices')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) {
                throw error;
            }

            console.log('✅ 공지사항 조회 성공');
            return data || [];

        } catch (error) {
            console.error('❌ getNotices 오류:', error.message);
            throw error;
        }
    },

    /**
     * 공지사항 상세 조회
     * @param {number} id - 공지사항 ID
     */
    async getNoticeById(id) {
        try {
            // 개발 환경
            if (window.APP_CONFIG?.ENV === 'development') {
                return new Promise(resolve => {
                    setTimeout(() => {
                        const notice = MOCK_NOTICES.find(n => n.id === parseInt(id));
                        resolve(notice || null);
                    }, 300);
                });
            }

            // 프로덕션 환경
            if (!window.supabaseClient) {
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다');
            }

            const { data, error } = await window.supabaseClient
                .from('notices')
                .select('*')
                .eq('id', id)
                .single();

            // PGRST116: 해당 행이 없음 (정상 상황)
            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            console.log('✅ 공지사항 상세 조회 성공');
            return data || null;

        } catch (error) {
            console.error('❌ getNoticeById 오류:', error.message);
            throw error;
        }
    },

    /**
     * 부품 목록 조회
     * @param {string} model - 차량 모델 (선택사항)
     * @param {string} category - 부품 카테고리 (선택사항)
     */
    async getParts(model = null, category = null) {
        try {
            // 개발 환경
            if (window.APP_CONFIG?.ENV === 'development') {
                return new Promise(resolve => {
                    setTimeout(() => {
                        let parts = MOCK_PARTS;
                        if (model) parts = parts.filter(p => p.model === model);
                        if (category) parts = parts.filter(p => p.category === category);
                        resolve(parts);
                    }, 500);
                });
            }

            // 프로덕션 환경
            if (!window.supabaseClient) {
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다');
            }

            let query = window.supabaseClient.from('parts').select('*');
            if (model) query = query.eq('model', model);
            if (category) query = query.eq('category', category);

            const { data, error } = await query;

            if (error) {
                throw error;
            }

            console.log('✅ 부품 목록 조회 성공');
            return data || [];

        } catch (error) {
            console.error('❌ getParts 오류:', error.message);
            throw error;
        }
    },

    /**
     * VIN 정보 조회
     * @param {string} vin - 차량 식별번호
     */
    async getVinInfo(vin) {
        try {
            // 입력값 검증
            if (!vin || vin.trim() === '') {
                throw new Error('VIN이 입력되지 않았습니다');
            }

            // 개발 환경
            if (window.APP_CONFIG?.ENV === 'development') {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve({
                            ...MOCK_VIN_INFO,
                            vin: vin
                        });
                    }, 300);
                });
            }

            // 프로덕션 환경
            if (!window.supabaseClient) {
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다');
            }

            const { data, error } = await window.supabaseClient
                .from('vin_data')
                .select('*')
                .eq('vin', vin)
                .single();

            // PGRST116: 해당 행이 없음 (정상 상황)
            if (error) {
                if (error.code === 'PGRST116') {
                    return null; // VIN not found
                }
                throw error;
            }

            console.log('✅ VIN 정보 조회 성공');
            return data;

        } catch (error) {
            console.error('❌ getVinInfo 오류:', error.message);
            throw error;
        }
    },

    /**
     * 문서 검색
     * @param {string} query - 검색어
     * @param {string} category - 카테고리 (선택사항)
     */
    async searchDocuments(query, category = null) {
        try {
            // 입력값 검증
            if (!query || query.trim() === '') {
                throw new Error('검색어를 입력해주세요');
            }

            // 개발 환경
            if (window.APP_CONFIG?.ENV === 'development') {
                return new Promise(resolve => {
                    setTimeout(() => {
                        const mockResults = [
                            { id: 1, title: '모터 컨트롤러 정비 매뉴얼', category: '정비지침서', type: 'pdf' },
                            { id: 2, title: '전장회로도 - BMS', category: '전장회로도', type: 'pdf' },
                            { id: 3, title: 'DTC E-0420', category: 'DTC 매뉴얼', type: 'file' }
                        ];
                        
                        // 검색어 필터링
                        let results = mockResults.filter(r => 
                            r.title.toLowerCase().includes(query.toLowerCase())
                        );
                        
                        // 카테고리 필터링
                        if (category) {
                            results = results.filter(r => r.category === category);
                        }
                        
                        resolve(results);
                    }, 400);
                });
            }

            // 프로덕션 환경
            if (!window.supabaseClient) {
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다');
            }

            let searchQuery = window.supabaseClient
                .from('documents')
                .select('*')
                .ilike('title', `%${query}%`);
            
            if (category) {
                searchQuery = searchQuery.eq('category', category);
            }

            const { data, error } = await searchQuery;

            if (error) {
                throw error;
            }

            console.log('✅ 문서 검색 성공');
            return data || [];

        } catch (error) {
            console.error('❌ searchDocuments 오류:', error.message);
            throw error;
        }
    },

    /**
     * 사용자 역할로 문서 접근 권한 확인
     * @param {string} documentId - 문서 ID
     * @param {string} requiredRole - 필요 권한 (admin, user 등)
     */
    async checkDocumentAccess(documentId, requiredRole = 'user') {
        try {
            const userRole = await window.authService?.getUserRole();
            
            // admin은 모든 문서 접근 가능
            if (userRole === 'admin') {
                return true;
            }

            // user는 public 문서만 접근 가능
            if (userRole === 'user' && requiredRole === 'user') {
                return true;
            }

            return false;

        } catch (error) {
            console.error('❌ checkDocumentAccess 오류:', error.message);
            return false;
        }
    },

    /**
     * 공지사항 작성 권한 확인 (관리자 또는 본사 소속)
     */
    async canManageNotices() {
        try {
            const userInfo = await window.authService?.getUserInfo();
            if (!userInfo) return false;

            // 관리자이거나 본사 소속이면 권한 있음
            const isAdmin = userInfo.role === 'admin';
            const isHeadquarters = userInfo.affiliation === '본사';
            
            return isAdmin || isHeadquarters;
        } catch (error) {
            console.error('❌ canManageNotices 오류:', error.message);
            return false;
        }
    },

    /**
     * 공지사항 작성
     * @param {object} noticeData - { title, content, category }
     */
    async createNotice(noticeData) {
        try {
            if (window.APP_CONFIG?.ENV === 'development') {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve({
                            id: Date.now(),
                            ...noticeData,
                            created_at: new Date().toISOString()
                        });
                    }, 300);
                });
            }

            if (!window.supabaseClient) {
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다');
            }

            // 권한 확인
            const canManage = await this.canManageNotices();
            if (!canManage) {
                throw new Error('공지사항 작성 권한이 없습니다');
            }

            const { data, error } = await window.supabaseClient
                .from('notices')
                .insert([noticeData])
                .select()
                .single();

            if (error) {
                throw error;
            }

            console.log('✅ 공지사항 작성 성공');
            return data;

        } catch (error) {
            console.error('❌ createNotice 오류:', error.message);
            throw error;
        }
    },

    /**
     * 공지사항 수정
     * @param {number} id - 공지사항 ID
     * @param {object} noticeData - { title, content, category }
     */
    async updateNotice(id, noticeData) {
        try {
            if (window.APP_CONFIG?.ENV === 'development') {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve({
                            id: id,
                            ...noticeData,
                            updated_at: new Date().toISOString()
                        });
                    }, 300);
                });
            }

            if (!window.supabaseClient) {
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다');
            }

            // 권한 확인
            const canManage = await this.canManageNotices();
            if (!canManage) {
                throw new Error('공지사항 수정 권한이 없습니다');
            }

            const { data, error } = await window.supabaseClient
                .from('notices')
                .update(noticeData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw error;
            }

            console.log('✅ 공지사항 수정 성공');
            return data;

        } catch (error) {
            console.error('❌ updateNotice 오류:', error.message);
            throw error;
        }
    },

    /**
     * 공지사항 삭제
     * @param {number} id - 공지사항 ID
     */
    async deleteNotice(id) {
        try {
            if (window.APP_CONFIG?.ENV === 'development') {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve({ success: true });
                    }, 300);
                });
            }

            if (!window.supabaseClient) {
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다');
            }

            // 권한 확인
            const canManage = await this.canManageNotices();
            if (!canManage) {
                throw new Error('공지사항 삭제 권한이 없습니다');
            }

            const { error } = await window.supabaseClient
                .from('notices')
                .delete()
                .eq('id', id);

            if (error) {
                throw error;
            }

            console.log('✅ 공지사항 삭제 성공');
            return { success: true };

        } catch (error) {
            console.error('❌ deleteNotice 오류:', error.message);
            throw error;
        }
    }
};