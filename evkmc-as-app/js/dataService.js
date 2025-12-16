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
                            ...noticeData
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

            // updated_at 필드 제거 (테이블에 컬럼이 없으면)
            const { updated_at, ...updateData } = noticeData;

            const { data, error } = await window.supabaseClient
                .from('notices')
                .update(updateData)
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
    },

    /**
     * 커뮤니티 게시글 목록 조회
     * @param {string} category - 카테고리 필터 (선택사항)
     * @param {number} limit - 조회 개수
     * @param {number} offset - 오프셋
     * @returns {Promise<Array>} 게시글 목록
     */
    async getCommunityPosts(category = null, limit = 20, offset = 0) {
        try {
            if (window.APP_CONFIG?.ENV === 'development') {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve([]);
                    }, 300);
                });
            }

            if (!window.supabaseClient) {
                console.warn('⚠️ Supabase 클라이언트가 초기화되지 않았습니다');
                return [];
            }

            let query = window.supabaseClient
                .from('community_posts')
                .select('*')
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (category) {
                query = query.eq('category', category);
            }

            const { data, error } = await query;

            // 테이블이 없거나 권한 오류인 경우 빈 배열 반환
            if (error) {
                // PGRST106: relation does not exist (테이블이 없음)
                if (error.code === 'PGRST106' || error.message?.includes('does not exist')) {
                    console.warn('⚠️ community_posts 테이블이 존재하지 않습니다. SQL 마이그레이션을 실행해주세요.');
                    return [];
                }
                console.error('❌ getCommunityPosts 오류:', error);
                // 다른 오류도 빈 배열 반환 (사용자 경험 개선)
                return [];
            }

            console.log('✅ 커뮤니티 게시글 목록 조회 성공:', data?.length || 0, '개');
            return data || [];

        } catch (error) {
            console.error('❌ getCommunityPosts 오류:', error.message);
            // 에러 발생 시에도 빈 배열 반환 (UI가 깨지지 않도록)
            return [];
        }
    },

    /**
     * 커뮤니티 게시글 상세 조회
     * @param {number} id - 게시글 ID
     * @returns {Promise<Object>} 게시글 정보
     */
    async getCommunityPostById(id) {
        try {
            if (window.APP_CONFIG?.ENV === 'development') {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(null);
                    }, 300);
                });
            }

            if (!window.supabaseClient) {
                console.warn('⚠️ Supabase 클라이언트가 초기화되지 않았습니다');
                return null;
            }

            // 게시글 조회
            const { data: existingPost, error: fetchError } = await window.supabaseClient
                .from('community_posts')
                .select('*')
                .eq('id', id)
                .single();

            // 테이블이 없는 경우 처리
            if (fetchError) {
                if (fetchError.code === 'PGRST106' || fetchError.message?.includes('does not exist')) {
                    console.warn('⚠️ community_posts 테이블이 존재하지 않습니다.');
                    return null;
                }
                if (fetchError.code === 'PGRST116') {
                    // 행이 없음
                    return null;
                }
                console.error('❌ 게시글 조회 오류:', fetchError);
                return null;
            }

            if (!existingPost) {
                return null;
            }

            // 조회수 증가
            try {
                await window.supabaseClient
                    .from('community_posts')
                    .update({ views: (existingPost.views || 0) + 1 })
                    .eq('id', id);
                existingPost.views = (existingPost.views || 0) + 1;
            } catch (updateError) {
                console.warn('조회수 증가 실패 (무시됨):', updateError);
            }

            console.log('✅ 커뮤니티 게시글 상세 조회 성공');
            return existingPost;

        } catch (error) {
            console.error('❌ getCommunityPostById 오류:', error.message);
            // 에러 발생 시 null 반환 (UI가 깨지지 않도록)
            return null;
        }
    },

    /**
     * 커뮤니티 게시글 작성
     * @param {object} postData - { title, content, category, tags, attachments }
     * @returns {Promise<Object>} 생성된 게시글
     */
    async createCommunityPost(postData) {
        try {
            if (!window.supabaseClient) {
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다');
            }

            const userInfo = await window.authService?.getUserInfo();
            if (!userInfo) {
                throw new Error('사용자 인증 정보가 없습니다');
            }

            const session = await window.authSession?.getSession();
            if (!session?.user?.id) {
                throw new Error('세션 정보가 없습니다');
            }

            const insertData = {
                ...postData,
                author_id: session.user.id,
                author_name: userInfo.name || '사용자',
                author_affiliation: userInfo.affiliation || '',
                attachments: postData.attachments || [],
                tags: postData.tags || []
            };

            const { data, error } = await window.supabaseClient
                .from('community_posts')
                .insert([insertData])
                .select()
                .single();

            if (error) {
                throw error;
            }

            console.log('✅ 커뮤니티 게시글 작성 성공');
            return data;

        } catch (error) {
            console.error('❌ createCommunityPost 오류:', error.message);
            throw error;
        }
    },

    /**
     * 커뮤니티 게시글 수정
     * @param {number} id - 게시글 ID
     * @param {object} postData - 수정할 데이터
     * @returns {Promise<Object>} 수정된 게시글
     */
    async updateCommunityPost(id, postData) {
        try {
            if (!window.supabaseClient) {
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다');
            }

            const session = await window.authSession?.getSession();
            if (!session?.user?.id) {
                throw new Error('세션 정보가 없습니다');
            }

            // 작성자 확인
            const { data: existingPost } = await window.supabaseClient
                .from('community_posts')
                .select('author_id')
                .eq('id', id)
                .single();

            if (existingPost?.author_id !== session.user.id) {
                throw new Error('수정 권한이 없습니다');
            }

            const { data, error } = await window.supabaseClient
                .from('community_posts')
                .update({
                    ...postData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .select()
                .single();

            if (error) {
                throw error;
            }

            console.log('✅ 커뮤니티 게시글 수정 성공');
            return data;

        } catch (error) {
            console.error('❌ updateCommunityPost 오류:', error.message);
            throw error;
        }
    },

    /**
     * 커뮤니티 게시글 삭제
     * @param {number} id - 게시글 ID
     * @returns {Promise<Object>} 성공 여부
     */
    async deleteCommunityPost(id) {
        try {
            if (!window.supabaseClient) {
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다');
            }

            const session = await window.authSession?.getSession();
            if (!session?.user?.id) {
                throw new Error('세션 정보가 없습니다');
            }

            // 작성자 또는 관리자 확인
            const { data: existingPost } = await window.supabaseClient
                .from('community_posts')
                .select('author_id')
                .eq('id', id)
                .single();

            const isAuthor = existingPost?.author_id === session.user.id;
            const userInfo = await window.authService?.getUserInfo();
            const isAdmin = userInfo?.role === 'admin';

            if (!isAuthor && !isAdmin) {
                throw new Error('삭제 권한이 없습니다');
            }

            const { error } = await window.supabaseClient
                .from('community_posts')
                .delete()
                .eq('id', id);

            if (error) {
                throw error;
            }

            console.log('✅ 커뮤니티 게시글 삭제 성공');
            return { success: true };

        } catch (error) {
            console.error('❌ deleteCommunityPost 오류:', error.message);
            throw error;
        }
    },

    /**
     * 댓글 목록 조회
     * @param {number} postId - 게시글 ID
     * @returns {Promise<Array>} 댓글 목록
     */
    async getComments(postId) {
        try {
            if (!window.supabaseClient) {
                console.warn('⚠️ Supabase 클라이언트가 초기화되지 않았습니다');
                return [];
            }

            const { data, error } = await window.supabaseClient
                .from('community_comments')
                .select('*')
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

            // 테이블이 없거나 오류 발생 시 빈 배열 반환
            if (error) {
                if (error.code === 'PGRST106' || error.message?.includes('does not exist')) {
                    console.warn('⚠️ community_comments 테이블이 존재하지 않습니다.');
                    return [];
                }
                console.error('❌ getComments 오류:', error);
                return [];
            }

            return data || [];

        } catch (error) {
            console.error('❌ getComments 오류:', error.message);
            return [];
        }
    },

    /**
     * 댓글 작성
     * @param {number} postId - 게시글 ID
     * @param {string} content - 댓글 내용
     * @returns {Promise<Object>} 생성된 댓글
     */
    async addComment(postId, content) {
        try {
            if (!window.supabaseClient) {
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다');
            }

            const userInfo = await window.authService?.getUserInfo();
            if (!userInfo) {
                throw new Error('사용자 인증 정보가 없습니다');
            }

            const session = await window.authSession?.getSession();
            if (!session?.user?.id) {
                throw new Error('세션 정보가 없습니다');
            }

            const { data, error } = await window.supabaseClient
                .from('community_comments')
                .insert([{
                    post_id: postId,
                    author_id: session.user.id,
                    author_name: userInfo.name || '사용자',
                    content: content
                }])
                .select()
                .single();

            if (error) {
                throw error;
            }

            console.log('✅ 댓글 작성 성공');
            return data;

        } catch (error) {
            console.error('❌ addComment 오류:', error.message);
            throw error;
        }
    },

    /**
     * 댓글 삭제
     * @param {number} commentId - 댓글 ID
     * @returns {Promise<Object>} 성공 여부
     */
    async deleteComment(commentId) {
        try {
            if (!window.supabaseClient) {
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다');
            }

            const session = await window.authSession?.getSession();
            if (!session?.user?.id) {
                throw new Error('세션 정보가 없습니다');
            }

            // 작성자 또는 관리자 확인
            const { data: existingComment } = await window.supabaseClient
                .from('community_comments')
                .select('author_id')
                .eq('id', commentId)
                .single();

            const isAuthor = existingComment?.author_id === session.user.id;
            const userInfo = await window.authService?.getUserInfo();
            const isAdmin = userInfo?.role === 'admin';

            if (!isAuthor && !isAdmin) {
                throw new Error('삭제 권한이 없습니다');
            }

            const { error } = await window.supabaseClient
                .from('community_comments')
                .delete()
                .eq('id', commentId);

            if (error) {
                throw error;
            }

            console.log('✅ 댓글 삭제 성공');
            return { success: true };

        } catch (error) {
            console.error('❌ deleteComment 오류:', error.message);
            throw error;
        }
    },

    /**
     * 게시글 좋아요 토글
     * @param {number} postId - 게시글 ID
     * @returns {Promise<Object>} { liked: boolean, likes_count: number }
     */
    async togglePostLike(postId) {
        try {
            if (!window.supabaseClient) {
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다');
            }

            const userInfo = await window.authService?.getUserInfo();
            if (!userInfo) {
                throw new Error('사용자 인증 정보가 없습니다');
            }

            const session = await window.authSession?.getSession();
            if (!session?.user?.id) {
                throw new Error('세션 정보가 없습니다');
            }

            // 기존 좋아요 확인
            const { data: existingLike } = await window.supabaseClient
                .from('post_likes')
                .select('id')
                .eq('post_id', postId)
                .eq('user_id', session.user.id)
                .single();

            if (existingLike) {
                // 좋아요 취소
                const { error } = await window.supabaseClient
                    .from('post_likes')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', session.user.id);

                if (error) throw error;

                // 좋아요 수 조회
                const { data: post } = await window.supabaseClient
                    .from('community_posts')
                    .select('likes_count')
                    .eq('id', postId)
                    .single();

                return { liked: false, likes_count: post?.likes_count || 0 };
            } else {
                // 좋아요 추가
                const { error } = await window.supabaseClient
                    .from('post_likes')
                    .insert([{
                        post_id: postId,
                        user_id: session.user.id,
                        user_name: userInfo.name || '사용자',
                        user_affiliation: userInfo.affiliation || ''
                    }]);

                if (error) throw error;

                // 좋아요 수 조회
                const { data: post } = await window.supabaseClient
                    .from('community_posts')
                    .select('likes_count')
                    .eq('id', postId)
                    .single();

                return { liked: true, likes_count: post?.likes_count || 0 };
            }

        } catch (error) {
            console.error('❌ togglePostLike 오류:', error.message);
            throw error;
        }
    },

    /**
     * 게시글 좋아요한 사용자 목록 조회 (사용자 추천 목록)
     * @param {number} postId - 게시글 ID
     * @returns {Promise<Array>} 좋아요한 사용자 목록
     */
    async getPostLikes(postId) {
        try {
            if (!window.supabaseClient) {
                console.warn('⚠️ Supabase 클라이언트가 초기화되지 않았습니다');
                return [];
            }

            const { data, error } = await window.supabaseClient
                .from('post_likes')
                .select('user_id, user_name, user_affiliation, created_at')
                .eq('post_id', postId)
                .order('created_at', { ascending: false });

            // 테이블이 없거나 오류 발생 시 빈 배열 반환
            if (error) {
                if (error.code === 'PGRST106' || error.message?.includes('does not exist')) {
                    console.warn('⚠️ post_likes 테이블이 존재하지 않습니다.');
                    return [];
                }
                console.error('❌ getPostLikes 오류:', error);
                return [];
            }

            return data || [];

        } catch (error) {
            console.error('❌ getPostLikes 오류:', error.message);
            return [];
        }
    },

    /**
     * 현재 사용자가 게시글을 좋아요했는지 확인
     * @param {number} postId - 게시글 ID
     * @returns {Promise<boolean>} 좋아요 여부
     */
    async hasUserLikedPost(postId) {
        try {
            const session = await window.authSession?.getSession();
            if (!session?.user?.id) {
                return false;
            }

            if (!window.supabaseClient) {
                return false;
            }

            const { data } = await window.supabaseClient
                .from('post_likes')
                .select('id')
                .eq('post_id', postId)
                .eq('user_id', session.user.id)
                .single();

            return !!data;

        } catch (error) {
            return false;
        }
    }
};