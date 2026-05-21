// js/securityAgreement.js
// 보안서약서 팝업 컴포넌트

window.securityAgreement = {
    _bodyScrollLockCount: 0,
    _scrollY: 0,

    lockBodyScroll() {
        if (this._bodyScrollLockCount === 0) {
            this._scrollY = window.scrollY || 0;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${this._scrollY}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';
        }
        this._bodyScrollLockCount += 1;
    },

    unlockBodyScroll() {
        this._bodyScrollLockCount = Math.max(0, this._bodyScrollLockCount - 1);
        if (this._bodyScrollLockCount !== 0) return;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, this._scrollY || 0);
    },

    removePopupElement() {
        document.getElementById('section-detail-overlay')?.remove();
        document.getElementById('security-agreement-popup')?.remove();
        this.unlockBodyScroll();
    },

    ensureAgreementStyles() {
        document.getElementById('security-agreement-styles')?.remove();
        const style = document.createElement('style');
        style.id = 'security-agreement-styles';
        style.textContent = `
            .security-agreement-popup-overlay {
                padding: 0;
                align-items: stretch;
                justify-content: stretch;
            }
            @media (min-width: 640px) {
                .security-agreement-popup-overlay {
                    padding: 1rem;
                    align-items: center;
                    justify-content: center;
                }
            }
            .security-agreement-container {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                height: 100dvh;
                max-height: 100dvh;
                border-radius: 0;
            }
            @media (min-width: 640px) {
                .security-agreement-container {
                    height: auto;
                    max-height: 90vh;
                    border-radius: 0.5rem;
                }
            }
            .security-agreement-content {
                flex: 1 1 auto;
                min-height: 0;
                overflow-y: auto;
                overflow-x: hidden;
                overscroll-behavior: contain;
                -webkit-overflow-scrolling: touch;
                touch-action: pan-y;
            }
            .security-agreement-footer {
                flex-shrink: 0;
                padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
            }
            .security-agreement-header {
                flex-shrink: 0;
                padding-top: max(1rem, env(safe-area-inset-top));
            }
            .security-section-overlay {
                padding: 0;
                align-items: stretch;
            }
            @media (min-width: 640px) {
                .security-section-overlay {
                    padding: 1rem;
                    align-items: center;
                }
            }
            .security-section-detail {
                height: 100dvh;
                max-height: 100dvh;
                border-radius: 0;
            }
            @media (min-width: 640px) {
                .security-section-detail {
                    height: auto;
                    max-height: 85vh;
                    border-radius: 0.75rem;
                }
            }
            .security-section-body {
                flex: 1 1 auto;
                min-height: 0;
                overflow-y: auto;
                overscroll-behavior: contain;
                -webkit-overflow-scrolling: touch;
                touch-action: pan-y;
            }
            .expandable-item {
                touch-action: manipulation;
                -webkit-tap-highlight-color: transparent;
                min-height: 3.25rem;
                user-select: none;
            }
            @media (min-width: 640px) {
                .expandable-item:hover {
                    background: #f1f5f9 !important;
                    transform: translateX(0.25rem);
                }
            }
            .expandable-item:active {
                background: #e2e8f0 !important;
            }
            .security-agreement-guide {
                background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
                border: 1px solid #bae6fd;
                border-radius: 0.5rem;
                padding: 0.75rem 1rem;
            }
            .security-agreement-guide-step {
                display: flex;
                gap: 0.5rem;
                align-items: flex-start;
                font-size: 0.8125rem;
                line-height: 1.45;
                color: #0c4a6e;
            }
            .security-agreement-guide-step + .security-agreement-guide-step {
                margin-top: 0.5rem;
            }
            .security-agreement-guide-num {
                flex-shrink: 0;
                width: 1.35rem;
                height: 1.35rem;
                border-radius: 9999px;
                background: #0284c7;
                color: #fff;
                font-size: 0.7rem;
                font-weight: 700;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            .security-footer-lock-banner {
                background: #fffbeb;
                border: 1px solid #fcd34d;
                border-radius: 0.5rem;
                padding: 0.75rem 1rem;
                font-size: 0.8125rem;
                line-height: 1.5;
                color: #92400e;
            }
            .security-footer-lock-banner.hidden {
                display: none;
            }
            .section-read-badge {
                flex-shrink: 0;
                font-size: 0.65rem;
                font-weight: 700;
                padding: 0.15rem 0.45rem;
                border-radius: 9999px;
                background: #0ea5e9;
                color: #fff;
                white-space: nowrap;
            }
            .section-read-badge.section-read-badge-done {
                background: #059669;
            }
            .expandable-item.security-tap-hint-pulse {
                animation: securityCardPulse 2s ease-in-out infinite;
                box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.45);
            }
            @keyframes securityCardPulse {
                0%, 100% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.35); }
                50% { box-shadow: 0 0 0 6px rgba(14, 165, 233, 0); }
            }
            @media (max-width: 639px) {
                .expandable-item .expand-icon::after {
                    content: ' 열기';
                    font-size: 0.65rem;
                    font-weight: 600;
                    color: #0369a1;
                }
                .expandable-item.expanded .expand-icon::after {
                    content: ' ✓';
                    color: #059669;
                }
            }
            .expandable-item.expanded {
                background: #e2e8f0 !important;
                border-left-color: #475569 !important;
            }
            .expandable-item.expanded .expand-icon {
                transform: rotate(180deg);
            }
            .expandable-content {
                display: none;
            }
            .security-agreement-content::-webkit-scrollbar,
            .security-section-body::-webkit-scrollbar {
                width: 8px;
            }
            .security-agreement-content::-webkit-scrollbar-thumb,
            .security-section-body::-webkit-scrollbar-thumb {
                background: #64748b;
                border-radius: 4px;
            }
            .security-overlay-close-btn {
                min-width: 2.75rem;
                min-height: 2.75rem;
                display: inline-flex;
                align-items: center;
                justify-content: center;
            }
            #inputStatus.correct, #companyStatus.correct, #nameStatus.correct {
                color: #10b981;
                display: block;
            }
            #inputStatus.incorrect, #companyStatus.incorrect, #nameStatus.incorrect {
                color: #ef4444;
                display: block;
            }
            .security-agreement-footer input,
            .security-agreement-footer button {
                touch-action: manipulation;
                font-size: 16px;
            }
            @supports (height: 100dvh) {
                .security-agreement-container { max-height: 100dvh; }
                .security-section-detail { max-height: 100dvh; }
            }
            .security-mobile-bottom-bar {
                display: none;
            }
            @media (max-width: 639px) {
                .security-agreement-header {
                    padding: 0.5rem 0.75rem;
                    padding-top: max(0.5rem, env(safe-area-inset-top));
                }
                .security-agreement-header .security-header-subtitle,
                .security-agreement-header .security-header-badge {
                    display: none;
                }
                .security-agreement-header h1 {
                    font-size: 1.05rem;
                    margin-bottom: 0;
                }
                #security-agreement-progress {
                    padding: 0.4rem 0.75rem 0.5rem;
                }
                #security-agreement-progress .progress-label-row {
                    font-size: 0.7rem;
                    margin-bottom: 0.25rem;
                }
                #security-agreement-progress .h-2 {
                    height: 0.35rem;
                }
                .security-agreement-guide {
                    padding: 0.45rem 0.6rem;
                    margin-top: 0.35rem;
                }
                .security-agreement-guide-step {
                    font-size: 0.7rem;
                    line-height: 1.35;
                }
                .security-agreement-guide-step + .security-agreement-guide-step {
                    margin-top: 0.3rem;
                }
                .security-agreement-guide-step:nth-child(2) {
                    display: none;
                }
                .security-agreement-guide-num {
                    width: 1.1rem;
                    height: 1.1rem;
                    font-size: 0.6rem;
                }
                .security-agreement-content {
                    padding: 0.35rem 0.65rem 0.5rem;
                }
                .security-agreement-sections > * + * {
                    margin-top: 0.35rem !important;
                }
                .security-agreement-sections .section h2 {
                    font-size: 0.7rem;
                    margin-bottom: 0.25rem;
                    padding-bottom: 0.2rem;
                }
                .security-agreement-sections .expandable-item {
                    min-height: 2.6rem;
                    padding: 0.5rem 0.6rem;
                }
                .security-agreement-sections .expandable-item .text-sm {
                    font-size: 0.75rem;
                    line-height: 1.3;
                }
                .security-warning-compact {
                    padding: 0.45rem 0.55rem;
                    margin: 0.35rem 0;
                    font-size: 0.68rem;
                    line-height: 1.35;
                }
                .security-agreement-footer {
                    padding: 0;
                    padding-bottom: max(0.35rem, env(safe-area-inset-bottom));
                }
                .security-mobile-bottom-bar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 0.5rem;
                    padding: 0.45rem 0.75rem;
                    background: #f1f5f9;
                    border-top: 1px solid #cbd5e1;
                    font-size: 0.75rem;
                    line-height: 1.35;
                    color: #334155;
                }
                .security-mobile-bottom-bar-count {
                    flex-shrink: 0;
                    font-weight: 700;
                    font-size: 0.8rem;
                    color: #0369a1;
                    background: #e0f2fe;
                    padding: 0.2rem 0.5rem;
                    border-radius: 9999px;
                }
                .security-agreement-footer-form {
                    display: none;
                    padding: 0.5rem 0.75rem 0;
                }
                .security-agreement-container.security-all-sections-read .security-agreement-footer-form {
                    display: block;
                }
                .security-agreement-container.security-all-sections-read .security-mobile-bottom-bar--phase1 {
                    display: none;
                }
                .security-agreement-container.security-all-sections-read .security-mobile-bottom-bar--phase2 {
                    display: flex;
                }
                .security-mobile-bottom-bar--phase2 {
                    display: none;
                    background: #ecfdf5;
                    border-top-color: #6ee7b7;
                    color: #065f46;
                }
                .security-footer-lock-banner {
                    display: none;
                }
                .security-footer-form-title {
                    font-size: 0.8rem;
                    margin-bottom: 0.25rem;
                }
                .security-footer-form-hint {
                    font-size: 0.65rem;
                    margin-bottom: 0.5rem;
                }
                .security-agreement-footer-form .space-y-4 {
                    gap: 0.5rem;
                }
                .security-agreement-footer-form label {
                    font-size: 0.65rem;
                    margin-bottom: 0.15rem;
                }
                .security-agreement-footer-form input {
                    padding: 0.45rem 0.55rem;
                }
                .security-agreement-footer-actions {
                    margin-top: 0.65rem;
                    gap: 0.5rem;
                }
                .security-agreement-footer-actions button {
                    min-height: 2.5rem;
                    padding-top: 0.5rem;
                    padding-bottom: 0.5rem;
                    font-size: 0.8rem;
                }
                .security-footer-disclaimer {
                    font-size: 0.6rem;
                    margin-top: 0.35rem;
                }
            }
            @media (min-width: 640px) {
                .security-agreement-footer-form {
                    display: block;
                }
            }
        `;
        document.head.appendChild(style);
    },

    /**
     * 보안서약서 동의 상태 확인
     * @returns {Promise<boolean>} 동의 여부
     */
    async checkAgreementStatus() {
        try {
            const session = await window.authSession?.getSession();
            if (!session || !session.user) {
                return false;
            }

            const userInfo = await window.authService?.getUserInfo();
            if (!userInfo) {
                return false;
            }

            // Supabase에서 보안서약서 동의 상태 확인 (auth_user_id → 이메일 fallback)
            let { data, error } = await window.supabaseClient
                .from('users')
                .select('security_agreement_accepted, security_agreement_date')
                .eq('auth_user_id', session.user.id)
                .single();

            if (error || !data) {
                console.warn('⚠️ auth_user_id로 조회 실패, 이메일로 재시도:', error?.message);
                const email = session.user.email;
                if (email) {
                    const { data: emailData, error: emailError } = await window.supabaseClient
                        .from('users')
                        .select('security_agreement_accepted, security_agreement_date')
                        .ilike('email', email.trim().toLowerCase())
                        .single();
                    if (!emailError && emailData) {
                        data = emailData;
                    } else {
                        console.warn('⚠️ 이메일로도 조회 실패:', emailError?.message);
                        return false;
                    }
                } else {
                    return false;
                }
            }

            return data?.security_agreement_accepted === true;
        } catch (error) {
            console.error('❌ 보안서약서 동의 상태 확인 오류:', error);
            return false;
        }
    },

    /**
     * 보안서약서 동의 저장
     * @param {string} company - 회사명
     * @param {string} name - 담당자 이름
     * @returns {Promise<boolean>} 저장 성공 여부
     */
    async saveAgreement(company, name) {
        try {
            const session = await window.authSession?.getSession();
            if (!session || !session.user) {
                console.error('❌ 세션이 없습니다');
                return false;
            }

            const userInfo = await window.authService?.getUserInfo();
            if (!userInfo) {
                console.error('❌ 사용자 정보가 없습니다');
                return false;
            }

            // Supabase에 보안서약서 동의 정보 저장
            const updateData = {
                security_agreement_accepted: true,
                security_agreement_date: new Date().toISOString(),
                security_agreement_company: company,
                security_agreement_name: name
            };

            console.log('💾 보안서약서 동의 저장 시도:', {
                auth_user_id: session.user.id,
                email: session.user.email,
                userInfo: {
                    profile_id: userInfo.profile_id,
                    auth_user_id: userInfo.auth_user_id,
                    email: userInfo.email
                },
                updateData
            });

            // 방법 1: auth_user_id로 업데이트 시도
            let { data: updateResult, error: updateError } = await window.supabaseClient
                .from('users')
                .update(updateData)
                .eq('auth_user_id', session.user.id)
                .select();

            console.log('📊 auth_user_id 업데이트 결과:', { 
                data: updateResult, 
                error: updateError,
                resultCount: updateResult?.length || 0
            });

            // 방법 2: auth_user_id로 업데이트 실패 시 이메일로 시도
            if (updateError || !updateResult || updateResult.length === 0) {
                console.log('🔄 auth_user_id로 업데이트 실패, 이메일로 재시도...');
                console.log('📧 이메일:', session.user.email);
                
                if (session.user.email) {
                    const normalizedEmail = session.user.email.trim().toLowerCase();
                    const { data: emailResult, error: emailError } = await window.supabaseClient
                        .from('users')
                        .update(updateData)
                        .ilike('email', normalizedEmail)
                        .select();

                    console.log('📊 이메일 업데이트 결과:', { 
                        data: emailResult, 
                        error: emailError,
                        resultCount: emailResult?.length || 0
                    });

                    if (emailError) {
                        console.error('❌ 이메일로 업데이트 실패:', emailError);
                        console.error('❌ 에러 상세:', JSON.stringify(emailError, null, 2));
                        
                        // 방법 3: profile_id가 있으면 profile_id로 시도
                        if (userInfo.profile_id) {
                            console.log('🔄 profile_id로 재시도...', userInfo.profile_id);
                            const { data: profileResult, error: profileError } = await window.supabaseClient
                                .from('users')
                                .update(updateData)
                                .eq('profile_id', userInfo.profile_id)
                                .select();
                            
                            console.log('📊 profile_id 업데이트 결과:', { 
                                data: profileResult, 
                                error: profileError,
                                resultCount: profileResult?.length || 0
                            });
                            
                            if (profileError) {
                                console.error('❌ profile_id로 업데이트 실패:', profileError);
                                console.error('❌ 에러 상세:', JSON.stringify(profileError, null, 2));
                                
                                // RLS 정책 문제일 가능성 높음
                                if (profileError.code === '42501' || profileError.message?.includes('permission denied')) {
                                    console.error('💡 RLS 정책 문제로 보입니다. 다음을 확인하세요:');
                                    console.error('   1. Supabase Dashboard > SQL Editor에서 다음 파일 실행:');
                                    console.error('      supabase/fix_security_agreement_rls_final.sql');
                                    console.error('   2. 정책이 제대로 추가되었는지 확인');
                                }
                                return false;
                            } else if (!profileResult || profileResult.length === 0) {
                                console.error('❌ profile_id로 업데이트했지만 레코드가 없습니다');
                                console.error('💡 가능한 원인:');
                                console.error('   1. profile_id가 잘못되었거나 레코드가 없음');
                                console.error('   2. RLS 정책이 업데이트를 차단함');
                                return false;
                            }
                            // profile_id로 성공한 경우 updateResult 업데이트
                            updateResult = profileResult;
                        } else {
                            console.error('❌ profile_id도 없어 업데이트할 수 없습니다');
                            console.error('💡 해결 방법:');
                            console.error('   1. Supabase Dashboard에서 auth_user_id 동기화 SQL 실행');
                            console.error('   2. 또는 관리자에게 사용자 정보 확인 요청');
                            return false;
                        }
                    } else if (!emailResult || emailResult.length === 0) {
                        console.error('❌ 이메일로 업데이트했지만 레코드가 없습니다');
                        console.error('💡 가능한 원인:');
                        console.error('   1. 이메일이 users 테이블에 없음');
                        console.error('   2. RLS 정책이 업데이트를 차단함');
                        console.error('   3. auth_user_id가 users 테이블과 연결되지 않음');
                        return false;
                    } else {
                        // 이메일로 성공한 경우 updateResult 업데이트
                        updateResult = emailResult;
                    }
                } else {
                    console.error('❌ 이메일 정보가 없어 업데이트할 수 없습니다');
                    return false;
                }
            }

            // 최종 성공 확인
            if (!updateResult || updateResult.length === 0) {
                console.error('❌ 모든 방법으로 업데이트 시도했지만 실패했습니다');
                return false;
            }

            console.log('✅ 보안서약서 동의 저장 성공:', updateResult[0]);

            // 사용자 정보 캐시 갱신
            if (window.authService?.refreshUserInfo) {
                await window.authService.refreshUserInfo();
            }

            console.log('✅ 보안서약서 동의 저장 완료');
            return true;
        } catch (error) {
            console.error('❌ 보안서약서 동의 저장 오류:', error);
            return false;
        }
    },

    /**
     * 보안서약서 팝업 표시
     */
    showPopup() {
        // 이미 팝업이 표시되어 있으면 중복 생성 방지
        if (document.getElementById('security-agreement-popup')) {
            return;
        }

        this.lockBodyScroll();
        this.ensureAgreementStyles();

        const popup = document.createElement('div');
        popup.id = 'security-agreement-popup';
        popup.className = 'security-agreement-popup-overlay fixed inset-0 bg-black bg-opacity-50 z-[10000] flex';
        popup.style.backdropFilter = 'blur(4px)';

        popup.innerHTML = `
            <div class="security-agreement-container bg-white shadow-2xl max-w-4xl w-full mx-auto overflow-hidden flex flex-col" role="dialog" aria-modal="true" aria-labelledby="security-agreement-title">
                <div class="security-agreement-header bg-gradient-to-r from-slate-700 to-slate-800 text-white p-4 sm:p-6">
                    <h1 id="security-agreement-title" class="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">EVKMC 보안서약서</h1>
                    <p class="security-header-subtitle text-sm opacity-90">기술 문서 포털 사용자 동의서</p>
                    <div class="security-header-badge mt-2 sm:mt-3 inline-block bg-black bg-opacity-20 px-3 py-1 rounded text-xs">
                        정비 기술 문서 및 서비스 정보 보호 약관
                    </div>
                </div>
                <div id="security-agreement-progress" class="flex-shrink-0 px-4 py-3 bg-slate-100 border-b border-slate-200">
                    <div class="progress-label-row flex justify-between items-center text-xs text-slate-600 mb-1.5">
                        <span class="font-medium">필수 항목 확인</span>
                        <span id="security-read-progress-text">0 / 8</span>
                    </div>
                    <div class="h-2 bg-slate-200 rounded-full overflow-hidden" aria-hidden="true">
                        <div id="security-read-progress-bar" class="h-full bg-sky-600 transition-all duration-300" style="width: 0%"></div>
                    </div>
                    <div id="security-agreement-guide" class="security-agreement-guide mt-3">
                        <div class="security-agreement-guide-step">
                            <span class="security-agreement-guide-num">1</span>
                            <span><strong>먼저</strong> 아래 파란색 <strong>항목 카드 8개</strong>를 각각 <strong>탭(눌러)</strong> 전문을 확인하세요. (스크롤만으로는 진행되지 않습니다)</span>
                        </div>
                        <div class="security-agreement-guide-step">
                            <span class="security-agreement-guide-num">2</span>
                            <span>8개 모두 확인되면 <strong>맨 아래 입력칸</strong>이 열립니다. 그다음 동의 문구를 입력하고 「동의 및 포털 이용」을 누르세요.</span>
                        </div>
                    </div>
                </div>
                
                <div class="security-agreement-content p-4 sm:p-6 text-slate-700">
                    <div class="security-agreement-sections space-y-6">
                        <div class="section">
                            <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">1. 서비스 개요 및 목적</h2>
                            <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all" role="button" tabindex="0" aria-expanded="false">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm font-medium">본 포털의 운영 목적과 자료 보호에 대해 알아보기</span>
                                    <span class="expand-icon text-slate-600">▼</span>
                                </div>
                                <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                                    <p class="mb-3">본 포털(evkmc-as-app.vercel.app)은 EVKMC에서 제공하는 자동차 정비 관련 기술 문서를 공유하는 정비 포털입니다. 협력점 및 인증 사용자에게 최신의 기술 정보와 서비스 자료를 제공하여 고품질의 정비 서비스를 지원하고자 합니다.</p>
                                    <p class="mb-3">본 포털은 정비 산업의 기술 수준 향상과 정비 서비스 품질 관리를 위한 전문적인 플랫폼으로, 다양한 협력점의 정비 업무 효율성을 극대화하기 위해 설계되었습니다. 제공되는 모든 자료는 EVKMC의 독자적인 연구와 개발을 통해 축적된 기술 자산으로, 저작권법 및 영업비밀보호법으로 보호받습니다.</p>
                                    <p>본 포털의 자료는 협력점 직원들의 정비 기술 향상 및 고객 서비스 개선을 목적으로 제한적으로 공유되는 것이며, 무단 배포나 외부 공개는 EVKMC의 기술 자산 보호를 침해하는 심각한 행위입니다. 이러한 행위는 관련 법령에 따라 형사적, 민사적 책임을 초래합니다.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="section">
                            <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">2. 허용되는 사용 범위</h2>
                            <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all" role="button" tabindex="0" aria-expanded="false">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm font-medium">자료 이용이 명시적으로 허용되는 범위 확인하기</span>
                                    <span class="expand-icon text-slate-600">▼</span>
                                </div>
                                <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                                    <p class="mb-3"><strong>본 포털에 저장되어 있는 모든 자료에 대해 다음의 행위는 명시적으로 허용됩니다:</strong></p>
                                    <ul class="list-disc list-inside ml-4 mb-3 space-y-1">
                                        <li>자료의 열람 및 조회</li>
                                        <li>개인적 학습 목적의 자료 저장 및 보관</li>
                                        <li>사용자 본인의 정비 업무에 필요한 범위 내에서의 활용</li>
                                        <li>협력점 내 필요한 직원과의 공유 (원본 훼손 없이, 폐쇄된 네트워크 내에서만)</li>
                                        <li>정비 서비스 향상을 위한 내부 교육 및 훈련</li>
                                    </ul>
                                    <p class="mb-2"><strong>사용자의 책임:</strong></p>
                                    <p>사용자는 위의 범위 내에서 자료를 활용할 때, 항상 EVKMC의 저작권 표시를 유지하고 자료의 출처를 명시해야 합니다. 자료를 수정하거나 2차 창작물을 만들 경우에도 원본의 저작권 표시는 반드시 유지되어야 하며, EVKMC의 허가 없이는 수정된 내용을 배포할 수 없습니다.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="section">
                            <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">3. 금지되는 행위</h2>
                            <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all" role="button" tabindex="0" aria-expanded="false">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm font-medium">엄격히 금지되는 행위와 그 이유 알아보기</span>
                                    <span class="expand-icon text-slate-600">▼</span>
                                </div>
                                <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                                    <p class="mb-3"><strong>다음의 행위는 엄격히 금지되며, 위반 시 형사적 처벌 및 민사적 손해배상 청구를 받을 수 있습니다:</strong></p>
                                    <ul class="list-disc list-inside ml-4 mb-3 space-y-1">
                                        <li>자료의 불특정 다수에 대한 무단 배포</li>
                                        <li>인터넷(SNS, 웹사이트, 클라우드, 메신저, 이메일 등)을 통한 무단 업로드 및 공개</li>
                                        <li>상업적 이용 목적의 2차 가공, 편집 및 판매</li>
                                        <li>저작권 표시 제거 또는 출처 은폐</li>
                                        <li>자료의 무단 전재 및 배포용 링크 생성</li>
                                        <li>타인으로 하여금 자료를 배포하도록 권유 또는 강요</li>
                                        <li>자료의 부분 또는 전체 복제본 작성 및 배포</li>
                                        <li>자료 내용을 기반으로 한 경쟁사 자료 개발</li>
                                    </ul>
                                    <p><strong>특히 주의:</strong> 인터넷 플랫폼을 통한 무단 배포는 자동으로 불특정 다수에게 확산되는 특성상 더욱 심각한 위반으로 간주되며, 적발 시 더욱 무거운 처벌을 받을 수 있습니다.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="security-warning-compact bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded my-4">
                            <p class="text-sm leading-relaxed"><strong>⚠️ 중요 안내</strong><br>
                            본 자료는 EVKMC의 기술 자산으로 저작권법 및 영업비밀보호법으로 보호받습니다. 무단 배포 및 업로드는 형사적 처벌(징역, 벌금)과 민사적 손해배상(최대 수억원대)을 초래할 수 있습니다.</p>
                        </div>
                        
                        <div class="section">
                            <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">4. 적용 법령 및 형사적 책임</h2>
                            <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all" role="button" tabindex="0" aria-expanded="false">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm font-medium">무단 배포 시 적용되는 법령과 처벌 상세 알아보기</span>
                                    <span class="expand-icon text-slate-600">▼</span>
                                </div>
                                <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                                    <p class="mb-3"><strong>본 포털의 자료를 불특정 다수에게 무단 배포하거나 인터넷에 업로드한 경우, 다음의 법령에 따른 형사 처벌을 받을 수 있습니다:</strong></p>
                                    <p class="mb-2"><strong>1) 저작권법 제136조 (저작권 침해)</strong></p>
                                    <p class="ml-4 mb-3">5년 이하의 징역 또는 5천만원 이하의 벌금에 처해질 수 있습니다.</p>
                                    <p class="mb-2"><strong>2) 정보통신망이용촉진및정보보호등에관한법률(정보통신망법) 제74조</strong></p>
                                    <p class="ml-4 mb-3">인터넷을 통해 저작권이 침해된 자료를 유포한 경우, 7년 이하의 징역 또는 5천만원 이하의 벌금에 처해질 수 있습니다.</p>
                                    <p class="mb-2"><strong>3) 영업비밀보호법 제2조, 제10조</strong></p>
                                    <p class="ml-4 mb-3">EVKMC의 기술 자료가 경영상 가치 있는 비공개 정보로 인정될 경우, 이를 무단 공개한 자는 10년 이하의 징역 또는 1억원 이하의 벌금에 처해질 수 있습니다.</p>
                                    <p class="mb-2"><strong>4) 부정경쟁방지및영업비밀보호에관한법률(부정경쟁방지법)</strong></p>
                                    <p class="ml-4 mb-3">EVKMC의 영업비밀을 훔치거나 부정한 수단으로 취득하여 이용하거나 배포한 경우, 3년 이하의 징역 또는 3천만원 이하의 벌금에 처해질 수 있습니다.</p>
                                    <p class="mb-2"><strong>5) 자동차관리법 및 자동차안전기준에관한규칙</strong></p>
                                    <p class="ml-4">자동차 정비 관련 기술 정보는 자동차관리법에 따른 정비 기준을 준수하기 위한 중요한 정보입니다. 이러한 정보를 부정하게 이용하거나 무단으로 배포하여 정비 품질 저하 또는 안전 사고를 초래한 경우, 별도의 행정처벌과 형사 책임이 추가될 수 있습니다.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="section">
                            <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">5. 민사적 책임 및 손해배상</h2>
                            <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all" role="button" tabindex="0" aria-expanded="false">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm font-medium">민사상 손해배상 청구 규모 및 방식 상세 알아보기</span>
                                    <span class="expand-icon text-slate-600">▼</span>
                                </div>
                                <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                                    <p class="mb-3"><strong>무단 배포 및 업로드로 인한 민사상 손해배상 청구를 받을 수 있으며, 그 규모는 다음과 같습니다:</strong></p>
                                    <p class="mb-2"><strong>1) 실제 손해액</strong></p>
                                    <p class="ml-4 mb-3">저작권 침해로 인한 EVKMC의 실제 손실액 전부를 배상해야 합니다.</p>
                                    <p class="mb-2"><strong>2) 예정된 손해배상액 (저작권법 제109조)</strong></p>
                                    <p class="ml-4 mb-3">1회 침해 시 5백만원~5천만원의 손해배상액을 청구할 수 있습니다. 중복 침해, 광범위한 확산, 상업적 이용, 고의적 침해 등의 경우 배상액이 상향 조정되어 1회당 수천만원~수억원대까지 청구될 수 있습니다.</p>
                                    <p class="mb-2"><strong>3) 부대비용 및 재판비용</strong></p>
                                    <p class="ml-4 mb-3">저작권 침해 소송을 담당하는 전문 변호사의 정기적 비용, 법원 소송비용, 기술 감정료, 온라인 게시물 삭제 및 모니터링 비용 등 모든 부대비용을 피고인이 부담하게 됩니다.</p>
                                    <p class="mb-2"><strong>4) 영구적 배포금지 가처분</strong></p>
                                    <p class="ml-4 mb-3">법원은 EVKMC의 요청에 따라 피고인의 자료 배포를 영구적으로 금지하는 가처분 명령을 내릴 수 있습니다.</p>
                                    <p class="mb-2"><strong>5) 이자 및 지연배상금</strong></p>
                                    <p class="ml-4">손해배상금에 대해 법원이 정한 이자율(연 5%)이 가산되며, 판결 확정 이후 지연배상금도 발생합니다.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="section">
                            <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">6. 책임의 범위 및 공동 불법행위</h2>
                            <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all" role="button" tabindex="0" aria-expanded="false">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm font-medium">직·간접적 책임이 발생하는 다양한 경우 확인하기</span>
                                    <span class="expand-icon text-slate-600">▼</span>
                                </div>
                                <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                                    <p class="mb-3"><strong>다음의 경우, 배포자 뿐만 아니라 적극적으로 확산에 동조하거나 도운 자도 법적 책임을 질 수 있습니다:</strong></p>
                                    <ul class="list-disc list-inside ml-4 mb-3 space-y-1">
                                        <li>불법 게시물의 재공유, 리트윗, 공감/좋아요 표시</li>
                                        <li>다운로드 링크의 배포 또는 소개</li>
                                        <li>적극적인 재전송 및 확산 (개인 채팅, 그룹 채팅, SNS, 메일 등)</li>
                                        <li>삭제된 게시물의 스크린샷 저장 및 공유</li>
                                        <li>수정·편집된 자료의 2차 배포</li>
                                        <li>자료를 링크한 타 커뮤니티 게시물 작성</li>
                                        <li>자료 배포자에게 제보, 정보 제공, 협력</li>
                                    </ul>
                                    <p><strong>공동 불법행위의 법적 책임:</strong></p>
                                    <p class="ml-4">법원은 이러한 행위를 민법 제760조의 공동 불법행위로 인정하여 모든 관여자에게 연대 책임을 물을 수 있습니다. 즉, 실제 배포자가 아니더라도 확산을 도운 모든 사람이 손해배상을 해야 하며, EVKMC는 배포자뿐만 아니라 모든 참여자를 상대로 소송을 제기할 수 있습니다.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="section">
                            <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">7. 모니터링, 적발 및 대응 절차</h2>
                            <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all" role="button" tabindex="0" aria-expanded="false">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm font-medium">EVKMC의 모니터링 방식 및 적발 시 대응 조치 알아보기</span>
                                    <span class="expand-icon text-slate-600">▼</span>
                                </div>
                                <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                                    <p class="mb-3"><strong>EVKMC는 본 포털 자료의 무단 배포를 지속적이고 광범위하게 모니터링하며, 적발 시 다음의 조치를 취합니다:</strong></p>
                                    <p class="mb-2"><strong>1) 온라인 모니터링 및 삭제 요청</strong></p>
                                    <p class="ml-4 mb-3">EVKMC는 Google, Naver, Kakao 등 주요 검색 엔진 및 SNS를 대상으로 무단 배포 자료를 정기적으로 모니터링합니다.</p>
                                    <p class="mb-2"><strong>2) 배포자 신원 파악</strong></p>
                                    <p class="ml-4 mb-3">EVKMC는 필요시 변호사와 협력하여 법원에 인터넷 이용자 정보 공개 청구를 제출, IP 주소를 통해 배포자의 실명을 파악할 수 있습니다.</p>
                                    <p class="mb-2"><strong>3) 경찰청/검찰청 고소·고발</strong></p>
                                    <p class="ml-4 mb-3">적발된 무단 배포 행위에 대해 저작권법, 정보통신망법, 영업비밀보호법 등 관련 법령을 근거로 경찰청 사이버수사대 또는 검찰청에 고소/고발을 제기합니다.</p>
                                    <p class="mb-2"><strong>4) 포털 서비스 이용 중단</strong></p>
                                    <p class="ml-4 mb-3">무단 배포 행위가 확인되면 해당 사용자의 포털 접근권을 즉시 차단합니다.</p>
                                    <p class="mb-2"><strong>5) 협력점 인증 취소 및 거래 중단</strong></p>
                                    <p class="ml-4 mb-3">배포자가 협력점 직원인 경우, 해당 협력점의 포털 인증을 취소하고 EVKMC와의 거래 관계를 중단할 수 있습니다.</p>
                                    <p class="mb-2"><strong>6) 손해배상 청구 소송</strong></p>
                                    <p class="ml-4">형사 고소/고발과 별도로 민사 손해배상 청구 소송을 제기합니다.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="section">
                            <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">8. 사용자의 권리와 의무</h2>
                            <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all" role="button" tabindex="0" aria-expanded="false">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm font-medium">포털 이용 시 사용자가 가져야 할 책임감 확인하기</span>
                                    <span class="expand-icon text-slate-600">▼</span>
                                </div>
                                <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                                    <p class="mb-2"><strong>사용자의 권리:</strong></p>
                                    <ul class="list-disc list-inside ml-4 mb-3 space-y-1">
                                        <li>승인된 범위 내에서 포털의 기술 자료에 무제한 접근 권리</li>
                                        <li>자료에 대한 질문 및 기술 지원 요청 권리</li>
                                        <li>자료 업데이트 및 신규 자료에 대한 우선 접근 권리</li>
                                        <li>EVKMC에 자료 개선 의견 제시 권리</li>
                                    </ul>
                                    <p class="mb-2"><strong>사용자의 의무:</strong></p>
                                    <ul class="list-disc list-inside ml-4 space-y-1">
                                        <li>포털에 접근하는 자신의 계정에 대한 보안 유지 (비밀번호 공개 금지)</li>
                                        <li>자료 무단 배포 금지 및 저작권 표시 유지</li>
                                        <li>자료 열람 및 사용 목적을 승인된 범위로 제한</li>
                                        <li>자료 내용의 정확성 검증 책임</li>
                                        <li>자료 사용으로 인한 손해에 대해 EVKMC에 책임을 묻지 않을 것</li>
                                        <li>무단 배포를 발견한 경우 EVKMC에 즉시 신고할 의무</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="security-agreement-footer bg-slate-50 p-4 sm:p-6 border-t border-slate-200">
                    <div id="security-mobile-bottom-bar-phase1" class="security-mobile-bottom-bar security-mobile-bottom-bar--phase1">
                        <span id="security-mobile-bar-text">항목 카드를 탭해 내용을 확인하세요</span>
                        <span id="security-mobile-bar-count" class="security-mobile-bottom-bar-count">0/8</span>
                    </div>
                    <div id="security-mobile-bottom-bar-phase2" class="security-mobile-bottom-bar security-mobile-bottom-bar--phase2">
                        <span>8개 확인 완료 · 아래에 동의 문구를 입력하세요</span>
                    </div>
                    <div id="security-agreement-footer-lock" class="security-footer-lock-banner mb-4">
                        <strong>아직 동의 단계가 아닙니다.</strong><br>
                        맨 위로 올라가 <strong>항목 카드 8개를 탭</strong>해 내용을 확인해 주세요. 「동의 및 포털 이용」 버튼은 <strong>8개 확인 후</strong>에만 활성화됩니다. (버튼이 비활성화된 것은 오류가 아닙니다)
                    </div>
                    <div class="security-agreement-footer-form">
                    <div class="mb-4">
                        <div class="flex items-center mb-2 security-footer-form-title">
                            <span class="text-sm font-semibold text-slate-700">보안서약서 동의 확인</span>
                            <span class="text-red-500 font-bold ml-1">*</span>
                        </div>
                        <p class="text-xs text-slate-600 mb-4"><strong>2단계:</strong> 8개 항목을 모두 탭해 확인한 뒤, 아래 문구를 정확히 입력하세요.</p>
                    </div>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-xs text-slate-600 mb-1 font-medium">입력 문구: "EVKMC 보안서약서에 동의합니다"를 정확히 입력하세요</label>
                            <input type="text" id="agreementInput" placeholder="여기에 입력하세요..." disabled class="w-full px-3 py-2 border-2 border-slate-200 rounded focus:outline-none focus:border-blue-500 transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed">
                            <div id="inputStatus" class="text-xs mt-1 hidden"></div>
                            <div id="agreementNotice" class="text-xs text-red-500 mt-1">① 위로 올라가 항목 카드 8개를 탭해 확인하세요. (동의 버튼만 눌러도 진행되지 않습니다)</div>
                        </div>
                        
                        <div>
                            <label class="block text-xs text-slate-600 mb-1 font-medium">소속 회사명 또는 협력점명을 입력하세요</label>
                            <input type="text" id="companyInput" placeholder="예: OO 정비소" disabled class="w-full px-3 py-2 border-2 border-slate-200 rounded focus:outline-none focus:border-blue-500 transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed">
                            <div id="companyStatus" class="text-xs mt-1 hidden"></div>
                        </div>
                        
                        <div>
                            <label class="block text-xs text-slate-600 mb-1 font-medium">담당자 이름을 입력하세요</label>
                            <input type="text" id="nameInput" placeholder="예: 홍길동" disabled class="w-full px-3 py-2 border-2 border-slate-200 rounded focus:outline-none focus:border-blue-500 transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed">
                            <div id="nameStatus" class="text-xs mt-1 hidden"></div>
                        </div>
                    </div>
                    
                    <div class="security-agreement-footer-actions flex gap-3 mt-6">
                        <button type="button" id="security-agreement-cancel-btn" class="flex-1 min-h-[2.75rem] px-4 py-3 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors font-semibold touch-manipulation">취소</button>
                        <button type="button" id="security-agreement-agree-btn" disabled class="flex-1 min-h-[2.75rem] px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold disabled:bg-slate-400 disabled:cursor-not-allowed touch-manipulation text-sm leading-tight">항목 8개 확인 후 이용 가능</button>
                    </div>
                    <p class="security-footer-disclaimer text-xs text-slate-500 text-center mt-3">본 약관에 동의하지 않으실 경우 포털 서비스를 이용할 수 없습니다.</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(popup);

        // 이벤트 리스너 설정
        this.initPopupEvents();
    },

    /**
     * 팝업 이벤트 리스너 초기화
     */
    initPopupEvents() {
        const agreementInput = document.getElementById('agreementInput');
        const companyInput = document.getElementById('companyInput');
        const nameInput = document.getElementById('nameInput');
        const agreeBtn = document.getElementById('security-agreement-agree-btn');
        const cancelBtn = document.getElementById('security-agreement-cancel-btn');
        const inputStatus = document.getElementById('inputStatus');
        const companyStatus = document.getElementById('companyStatus');
        const nameStatus = document.getElementById('nameStatus');
        const agreementNotice = document.getElementById('agreementNotice');

        const expandableItems = document.querySelectorAll('#security-agreement-popup .expandable-item');
        const requiredSections = expandableItems.length || 8;
        const readSections = new Set();

        const agreementContainer = document.querySelector('#security-agreement-popup .security-agreement-container');
        const mobileBarCount = document.getElementById('security-mobile-bar-count');
        const mobileBarText = document.getElementById('security-mobile-bar-text');
        const footerForm = document.querySelector('.security-agreement-footer-form');

        const updateReadProgress = () => {
            const count = readSections.size;
            const textEl = document.getElementById('security-read-progress-text');
            const barEl = document.getElementById('security-read-progress-bar');
            if (textEl) textEl.textContent = `${count} / ${requiredSections}`;
            if (barEl) barEl.style.width = `${Math.min(100, (count / requiredSections) * 100)}%`;
            if (mobileBarCount) mobileBarCount.textContent = `${count}/${requiredSections}`;
            if (mobileBarText) {
                mobileBarText.textContent = count >= requiredSections
                    ? '확인 완료 · 아래에서 동의 입력'
                    : `항목 카드 ${requiredSections - count}개 더 탭하세요`;
            }
        };

        const footerLockBanner = document.getElementById('security-agreement-footer-lock');
        const AGREE_LABEL_READY = '동의 및 포털 이용';
        const AGREE_LABEL_NEED_SECTIONS = (done, total) => `항목 ${done}/${total} 확인 후 이용`;

        const markFirstUnreadPulse = () => {
            expandableItems.forEach((item) => item.classList.remove('security-tap-hint-pulse'));
            const firstUnread = Array.from(expandableItems).find((item) => item.classList.contains('not-expanded'));
            if (firstUnread) firstUnread.classList.add('security-tap-hint-pulse');
        };

        const refreshAgreementNotice = () => {
            const allRead = readSections.size >= requiredSections;
            if (allRead) {
                agreementContainer?.classList.add('security-all-sections-read');
                agreementInput.disabled = false;
                companyInput.disabled = false;
                nameInput.disabled = false;
                agreementNotice.textContent = '✅ 8개 항목 확인 완료. 아래 동의 문구를 입력한 뒤 「동의 및 포털 이용」을 누르세요.';
                agreementNotice.style.color = '#10b981';
                footerLockBanner?.classList.add('hidden');
                if (window.matchMedia('(max-width: 639px)').matches && footerForm) {
                    requestAnimationFrame(() => {
                        footerForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    });
                }
            } else {
                agreementContainer?.classList.remove('security-all-sections-read');
                const remain = requiredSections - readSections.size;
                agreementNotice.textContent = `① 위 항목 카드 ${remain}개를 더 탭해 확인하세요. (동의 버튼은 아직 사용할 수 없습니다)`;
                agreementNotice.style.color = '#ef4444';
                footerLockBanner?.classList.remove('hidden');
            }
            updateReadProgress();
            markFirstUnreadPulse();
            updateButtonState();
        };

        const openSectionDetail = (element) => {
            document.getElementById('section-detail-overlay')?.remove();

            const title = element.closest('.section')?.querySelector('h2')?.textContent || '';
            const content = element.querySelector('.expandable-content');
            if (!content) return;

            const sectionIndex = Array.from(expandableItems).indexOf(element);
            readSections.add(sectionIndex);
            element.classList.add('expanded');
            element.classList.remove('not-expanded');
            element.setAttribute('aria-expanded', 'true');
            const badge = element.querySelector('.section-read-badge');
            if (badge) {
                badge.textContent = '확인 완료';
                badge.classList.add('section-read-badge-done');
            }
            refreshAgreementNotice();

            const overlay = document.createElement('div');
            overlay.id = 'section-detail-overlay';
            overlay.className = 'security-section-overlay fixed inset-0 bg-black bg-opacity-70 z-[10001] flex';
            overlay.style.backdropFilter = 'blur(4px)';

            const detailBox = document.createElement('div');
            detailBox.className = 'security-section-detail bg-white shadow-2xl w-full max-w-3xl mx-auto flex flex-col';

            const header = document.createElement('div');
            header.className = 'bg-slate-700 text-white p-4 sm:p-5 flex justify-between items-start gap-3 flex-shrink-0';
            header.innerHTML = '<h2 class="text-base sm:text-lg font-bold pr-2 flex-1"></h2><button type="button" id="close-section-overlay" class="security-overlay-close-btn text-white hover:text-gray-300 text-3xl leading-none flex-shrink-0" aria-label="닫기">&times;</button>';
            header.querySelector('h2').textContent = title;

            const body = document.createElement('div');
            body.className = 'security-section-body p-4 sm:p-6 text-sm text-slate-700 leading-relaxed';
            body.innerHTML = content.innerHTML;

            const footer = document.createElement('div');
            footer.className = 'bg-slate-50 p-4 border-t flex-shrink-0 flex flex-col gap-2';
            footer.style.paddingBottom = 'max(1rem, env(safe-area-inset-bottom))';

            const progressP = document.createElement('p');
            progressP.className = 'text-xs text-slate-500 text-center leading-relaxed';
            progressP.innerHTML = `읽은 항목: <strong>${readSections.size} / ${requiredSections}</strong><br><span class="text-sky-700">내용 확인 후 하단 「확인」을 눌러 주세요</span>`;

            const btnRow = document.createElement('div');
            btnRow.className = 'flex gap-2';

            const closeBtn = document.createElement('button');
            closeBtn.type = 'button';
            closeBtn.id = 'close-section-btn';
            closeBtn.className = 'flex-1 min-h-[2.75rem] px-4 py-2.5 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium touch-manipulation';
            closeBtn.textContent = '확인';

            btnRow.appendChild(closeBtn);

            const hasNext = sectionIndex < expandableItems.length - 1;
            if (hasNext) {
                const nextBtn = document.createElement('button');
                nextBtn.type = 'button';
                nextBtn.id = 'next-section-btn';
                nextBtn.className = 'flex-1 min-h-[2.75rem] px-4 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-medium touch-manipulation';
                nextBtn.textContent = '다음 항목';
                btnRow.insertBefore(nextBtn, closeBtn);
            }

            footer.appendChild(progressP);
            footer.appendChild(btnRow);

            detailBox.appendChild(header);
            detailBox.appendChild(body);
            detailBox.appendChild(footer);
            overlay.appendChild(detailBox);
            document.body.appendChild(overlay);

            const closeOverlay = (openNext) => {
                overlay.remove();
                refreshAgreementNotice();
                if (openNext && hasNext) {
                    setTimeout(() => openSectionDetail(expandableItems[sectionIndex + 1]), 150);
                }
            };

            document.getElementById('close-section-overlay')?.addEventListener('click', () => closeOverlay(false));
            closeBtn.addEventListener('click', () => closeOverlay(false));
            document.getElementById('next-section-btn')?.addEventListener('click', () => closeOverlay(true));
            overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(false); });
        };

        expandableItems.forEach((item) => {
            const row = item.querySelector('.flex');
            if (row && !row.querySelector('.section-read-badge')) {
                const badge = document.createElement('span');
                badge.className = 'section-read-badge';
                badge.textContent = '탭하여 확인';
                row.appendChild(badge);
            }
            const open = () => openSectionDetail(item);
            item.addEventListener('click', open);
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    open();
                }
            });
        });

        window.toggleSecuritySection = openSectionDetail;
        refreshAgreementNotice();

        if (window.matchMedia('(max-width: 639px)').matches && expandableItems[0]) {
            setTimeout(() => {
                expandableItems[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 450);
        }

        // 동의 문구 검증
        function checkAgreementText() {
            const inputValue = agreementInput.value.trim();
            const targetText = 'EVKMC 보안서약서에 동의합니다';
            
            if (inputValue === '') {
                inputStatus.textContent = '';
                inputStatus.className = 'hidden';
            } else if (inputValue === targetText) {
                inputStatus.textContent = '✓ 정확히 입력되었습니다.';
                inputStatus.className = 'correct';
            } else {
                inputStatus.textContent = '✗ 입력이 정확하지 않습니다. 정확히 입력해주세요.';
                inputStatus.className = 'incorrect';
            }
            
            updateButtonState();
        }

        // 회사명 검증
        function checkCompanyInput() {
            const inputValue = companyInput.value.trim();
            
            if (inputValue === '') {
                companyStatus.textContent = '';
                companyStatus.className = 'hidden';
            } else if (inputValue.length >= 2) {
                companyStatus.textContent = '✓ 회사명이 입력되었습니다.';
                companyStatus.className = 'correct';
            } else {
                companyStatus.textContent = '✗ 2글자 이상 입력해주세요.';
                companyStatus.className = 'incorrect';
            }
            
            updateButtonState();
        }

        // 이름 검증
        function checkNameInput() {
            const inputValue = nameInput.value.trim();
            
            if (inputValue === '') {
                nameStatus.textContent = '';
                nameStatus.className = 'hidden';
            } else if (inputValue.length >= 2) {
                nameStatus.textContent = '✓ 이름이 입력되었습니다.';
                nameStatus.className = 'correct';
            } else {
                nameStatus.textContent = '✗ 2글자 이상 입력해주세요.';
                nameStatus.className = 'incorrect';
            }
            
            updateButtonState();
        }

        // 버튼 상태 업데이트
        function updateButtonState() {
            const allRead = readSections.size >= requiredSections;
            const agreementComplete = agreementInput.value.trim() === 'EVKMC 보안서약서에 동의합니다';
            const companyFilled = companyInput.value.trim().length >= 2;
            const nameFilled = nameInput.value.trim().length >= 2;
            const formReady = agreementComplete && companyFilled && nameFilled;

            if (!allRead) {
                agreeBtn.disabled = true;
                agreeBtn.textContent = AGREE_LABEL_NEED_SECTIONS(readSections.size, requiredSections);
            } else if (!formReady) {
                agreeBtn.disabled = true;
                agreeBtn.textContent = '동의 문구 입력 후 이용';
            } else {
                agreeBtn.disabled = false;
                agreeBtn.textContent = AGREE_LABEL_READY;
            }
        }

        // 이벤트 리스너 등록
        agreementInput.addEventListener('input', checkAgreementText);
        companyInput.addEventListener('input', checkCompanyInput);
        nameInput.addEventListener('input', checkNameInput);

        // 동의 버튼 클릭
        agreeBtn.addEventListener('click', async () => {
            const company = companyInput.value.trim();
            const name = nameInput.value.trim();
            
            // 입력값 재검증
            const agreementComplete = agreementInput.value.trim() === 'EVKMC 보안서약서에 동의합니다';
            const companyFilled = company.length >= 2;
            const nameFilled = name.length >= 2;
            
            if (!agreementComplete || !companyFilled || !nameFilled) {
                if (window.showToast) {
                    window.showToast('모든 항목을 정확히 입력해주세요.', 'error');
                } else {
                    alert('모든 항목을 정확히 입력해주세요.');
                }
                return;
            }
            
            agreeBtn.disabled = true;
            agreeBtn.textContent = '처리 중...';
            
            try {
                const success = await this.saveAgreement(company, name);
                
                if (success) {
                    this.removePopupElement();
                    
                    // 사용자 정보 캐시 갱신
                    if (window.authService?.refreshUserInfo) {
                        await window.authService.refreshUserInfo();
                    }

                    window.scheduleOnboardingAfterSecurity?.();
                    
                    // 토스트 메시지 표시
                    if (window.showToast) {
                        window.showToast('보안서약서에 동의하셨습니다. 포털 서비스를 이용하실 수 있습니다.', 'success');
                    } else {
                        alert('보안서약서에 동의하셨습니다. 포털 서비스를 이용하실 수 있습니다.');
                    }
                } else {
                    agreeBtn.disabled = false;
                    agreeBtn.textContent = '동의 및 포털 이용';
                    
                    if (window.showToast) {
                        window.showToast('보안서약서 동의 저장에 실패했습니다. 다시 시도해주세요.', 'error');
                    } else {
                        alert('보안서약서 동의 저장에 실패했습니다. 다시 시도해주세요.');
                    }
                }
            } catch (error) {
                console.error('❌ 보안서약서 동의 처리 오류:', error);
                agreeBtn.disabled = false;
                agreeBtn.textContent = '동의 및 포털 이용';
                
                if (window.showToast) {
                    window.showToast('오류가 발생했습니다. 다시 시도해주세요.', 'error');
                } else {
                    alert('오류가 발생했습니다. 다시 시도해주세요.');
                }
            }
        });

        // 취소 버튼 클릭
        cancelBtn.addEventListener('click', () => {
            if (confirm('보안서약서에 동의하지 않으시겠습니까?\n포털 서비스 이용이 제한됩니다.')) {
                this.removePopupElement();
                // 로그아웃 처리
                window.location.href = 'login.html';
            }
        });

        // 팝업 외부 클릭 시 닫기 방지 (필수 동의이므로)
        const popup = document.getElementById('security-agreement-popup');
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                // 외부 클릭 시 아무 동작도 하지 않음 (동의 필수)
            }
        });
    },

    /**
     * 보안서약서 팝업 표시 여부 확인 및 표시
     */
    async checkAndShow() {
        try {
            const isAgreed = await this.checkAgreementStatus();
            
            if (!isAgreed) {
                // 동의하지 않은 경우 팝업 표시
                this.showPopup();
            }
        } catch (error) {
            console.error('❌ 보안서약서 확인 오류:', error);
            // 오류 발생 시에도 팝업 표시 (안전을 위해)
            this.showPopup();
        }
    },

    /**
     * 보안서약서 전문 보기 (읽기 전용 모드)
     */
    showViewOnlyPopup() {
        // 이미 팝업이 표시되어 있으면 중복 생성 방지
        if (document.getElementById('security-agreement-popup')) {
            return;
        }

        this.lockBodyScroll();
        this.ensureAgreementStyles();

        const popup = document.createElement('div');
        popup.id = 'security-agreement-popup';
        popup.className = 'security-agreement-popup-overlay fixed inset-0 bg-black bg-opacity-50 z-[10000] flex';
        popup.style.backdropFilter = 'blur(4px)';

        popup.innerHTML = `
            <div class="security-agreement-container bg-white shadow-2xl max-w-4xl w-full mx-auto overflow-hidden flex flex-col">
                <div class="security-agreement-header bg-gradient-to-r from-slate-700 to-slate-800 text-white p-6">
                    <h1 class="text-2xl font-bold mb-2">EVKMC 보안서약서</h1>
                    <p class="text-sm opacity-90">기술 문서 포털 사용자 동의서</p>
                    <div class="mt-3 inline-block bg-black bg-opacity-20 px-3 py-1 rounded text-xs">
                        정비 기술 문서 및 서비스 정보 보호 약관
                    </div>
                </div>
                
                <div class="security-agreement-content p-4 sm:p-6 text-slate-700">
                    ${this.getAgreementContentHTML()}
                </div>
                
                <div class="security-agreement-footer bg-slate-50 p-4 sm:p-6 border-t border-slate-200">
                    <button 
                        id="security-agreement-close-btn" 
                        class="w-full px-4 py-3 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors font-semibold"
                    >
                        닫기
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(popup);

        const closeViewPopup = () => this.removePopupElement();

        // 닫기 버튼 이벤트
        const closeBtn = document.getElementById('security-agreement-close-btn');
        closeBtn.addEventListener('click', closeViewPopup);

        // 팝업 외부 클릭 시 닫기
        popup.addEventListener('click', (e) => {
            if (e.target === popup) closeViewPopup();
        });

        // 모든 섹션 자동 확장 (읽기 전용 모드)
        setTimeout(() => {
            const expandableItems = popup.querySelectorAll('.expandable-item');
            expandableItems.forEach(item => {
                if (!item.classList.contains('expanded')) {
                    item.classList.add('expanded');
                    item.classList.remove('not-expanded');
                    const content = item.querySelector('.expandable-content');
                    if (content) {
                        content.classList.remove('hidden');
                    }
                }
            });
        }, 100);
    },

    /**
     * 보안서약서 내용 HTML 반환 (재사용 가능)
     */
    getAgreementContentHTML() {
        return `
            <div class="space-y-6">
                <div class="section">
                    <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">1. 서비스 개요 및 목적</h2>
                    <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all" role="button" tabindex="0" aria-expanded="false">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-medium">본 포털의 운영 목적과 자료 보호에 대해 알아보기</span>
                            <span class="expand-icon text-slate-600">▼</span>
                        </div>
                        <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                            <p class="mb-3">본 포털(evkmc-as-app.vercel.app)은 EVKMC에서 제공하는 자동차 정비 관련 기술 문서를 공유하는 정비 포털입니다. 협력점 및 인증 사용자에게 최신의 기술 정보와 서비스 자료를 제공하여 고품질의 정비 서비스를 지원하고자 합니다.</p>
                            <p class="mb-3">본 포털은 정비 산업의 기술 수준 향상과 정비 서비스 품질 관리를 위한 전문적인 플랫폼으로, 다양한 협력점의 정비 업무 효율성을 극대화하기 위해 설계되었습니다. 제공되는 모든 자료는 EVKMC의 독자적인 연구와 개발을 통해 축적된 기술 자산으로, 저작권법 및 영업비밀보호법으로 보호받습니다.</p>
                            <p>본 포털의 자료는 협력점 직원들의 정비 기술 향상 및 고객 서비스 개선을 목적으로 제한적으로 공유되는 것이며, 무단 배포나 외부 공개는 EVKMC의 기술 자산 보호를 침해하는 심각한 행위입니다. 이러한 행위는 관련 법령에 따라 형사적, 민사적 책임을 초래합니다.</p>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">2. 허용되는 사용 범위</h2>
                    <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all" role="button" tabindex="0" aria-expanded="false">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-medium">자료 이용이 명시적으로 허용되는 범위 확인하기</span>
                            <span class="expand-icon text-slate-600">▼</span>
                        </div>
                        <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                            <p class="mb-3"><strong>본 포털에 저장되어 있는 모든 자료에 대해 다음의 행위는 명시적으로 허용됩니다:</strong></p>
                            <ul class="list-disc list-inside ml-4 mb-3 space-y-1">
                                <li>자료의 열람 및 조회</li>
                                <li>개인적 학습 목적의 자료 저장 및 보관</li>
                                <li>사용자 본인의 정비 업무에 필요한 범위 내에서의 활용</li>
                                <li>협력점 내 필요한 직원과의 공유 (원본 훼손 없이, 폐쇄된 네트워크 내에서만)</li>
                                <li>정비 서비스 향상을 위한 내부 교육 및 훈련</li>
                            </ul>
                            <p class="mb-2"><strong>사용자의 책임:</strong></p>
                            <p>사용자는 위의 범위 내에서 자료를 활용할 때, 항상 EVKMC의 저작권 표시를 유지하고 자료의 출처를 명시해야 합니다. 자료를 수정하거나 2차 창작물을 만들 경우에도 원본의 저작권 표시는 반드시 유지되어야 하며, EVKMC의 허가 없이는 수정된 내용을 배포할 수 없습니다.</p>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">3. 금지되는 행위</h2>
                    <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all" role="button" tabindex="0" aria-expanded="false">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-medium">엄격히 금지되는 행위와 그 이유 알아보기</span>
                            <span class="expand-icon text-slate-600">▼</span>
                        </div>
                        <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                            <p class="mb-3"><strong>다음의 행위는 엄격히 금지되며, 위반 시 형사적 처벌 및 민사적 손해배상 청구를 받을 수 있습니다:</strong></p>
                            <ul class="list-disc list-inside ml-4 mb-3 space-y-1">
                                <li>자료의 불특정 다수에 대한 무단 배포</li>
                                <li>인터넷(SNS, 웹사이트, 클라우드, 메신저, 이메일 등)을 통한 무단 업로드 및 공개</li>
                                <li>상업적 이용 목적의 2차 가공, 편집 및 판매</li>
                                <li>저작권 표시 제거 또는 출처 은폐</li>
                                <li>자료의 무단 전재 및 배포용 링크 생성</li>
                                <li>타인으로 하여금 자료를 배포하도록 권유 또는 강요</li>
                                <li>자료의 부분 또는 전체 복제본 작성 및 배포</li>
                                <li>자료 내용을 기반으로 한 경쟁사 자료 개발</li>
                            </ul>
                            <p><strong>특히 주의:</strong> 인터넷 플랫폼을 통한 무단 배포는 자동으로 불특정 다수에게 확산되는 특성상 더욱 심각한 위반으로 간주되며, 적발 시 더욱 무거운 처벌을 받을 수 있습니다.</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded my-4">
                    <p class="text-sm leading-relaxed"><strong>⚠️ 중요 안내</strong><br>
                    본 자료는 EVKMC의 기술 자산으로 저작권법 및 영업비밀보호법으로 보호받습니다. 무단 배포 및 업로드는 형사적 처벌(징역, 벌금)과 민사적 손해배상(최대 수억원대)을 초래할 수 있습니다.</p>
                </div>
                
                <div class="section">
                    <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">4. 적용 법령 및 형사적 책임</h2>
                    <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all" role="button" tabindex="0" aria-expanded="false">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-medium">무단 배포 시 적용되는 법령과 처벌 상세 알아보기</span>
                            <span class="expand-icon text-slate-600">▼</span>
                        </div>
                        <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                            <p class="mb-3"><strong>본 포털의 자료를 불특정 다수에게 무단 배포하거나 인터넷에 업로드한 경우, 다음의 법령에 따른 형사 처벌을 받을 수 있습니다:</strong></p>
                            <p class="mb-2"><strong>1) 저작권법 제136조 (저작권 침해)</strong></p>
                            <p class="ml-4 mb-3">5년 이하의 징역 또는 5천만원 이하의 벌금에 처해질 수 있습니다.</p>
                            <p class="mb-2"><strong>2) 정보통신망이용촉진및정보보호등에관한법률(정보통신망법) 제74조</strong></p>
                            <p class="ml-4 mb-3">인터넷을 통해 저작권이 침해된 자료를 유포한 경우, 7년 이하의 징역 또는 5천만원 이하의 벌금에 처해질 수 있습니다.</p>
                            <p class="mb-2"><strong>3) 영업비밀보호법 제2조, 제10조</strong></p>
                            <p class="ml-4 mb-3">EVKMC의 기술 자료가 경영상 가치 있는 비공개 정보로 인정될 경우, 이를 무단 공개한 자는 10년 이하의 징역 또는 1억원 이하의 벌금에 처해질 수 있습니다.</p>
                            <p class="mb-2"><strong>4) 부정경쟁방지및영업비밀보호에관한법률(부정경쟁방지법)</strong></p>
                            <p class="ml-4 mb-3">EVKMC의 영업비밀을 훔치거나 부정한 수단으로 취득하여 이용하거나 배포한 경우, 3년 이하의 징역 또는 3천만원 이하의 벌금에 처해질 수 있습니다.</p>
                            <p class="mb-2"><strong>5) 자동차관리법 및 자동차안전기준에관한규칙</strong></p>
                            <p class="ml-4">자동차 정비 관련 기술 정보는 자동차관리법에 따른 정비 기준을 준수하기 위한 중요한 정보입니다. 이러한 정보를 부정하게 이용하거나 무단으로 배포하여 정비 품질 저하 또는 안전 사고를 초래한 경우, 별도의 행정처벌과 형사 책임이 추가될 수 있습니다.</p>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">5. 민사적 책임 및 손해배상</h2>
                    <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all" role="button" tabindex="0" aria-expanded="false">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-medium">민사상 손해배상 청구 규모 및 방식 상세 알아보기</span>
                            <span class="expand-icon text-slate-600">▼</span>
                        </div>
                        <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                            <p class="mb-3"><strong>무단 배포 및 업로드로 인한 민사상 손해배상 청구를 받을 수 있으며, 그 규모는 다음과 같습니다:</strong></p>
                            <p class="mb-2"><strong>1) 실제 손해액</strong></p>
                            <p class="ml-4 mb-3">저작권 침해로 인한 EVKMC의 실제 손실액 전부를 배상해야 합니다.</p>
                            <p class="mb-2"><strong>2) 예정된 손해배상액 (저작권법 제109조)</strong></p>
                            <p class="ml-4 mb-3">1회 침해 시 5백만원~5천만원의 손해배상액을 청구할 수 있습니다. 중복 침해, 광범위한 확산, 상업적 이용, 고의적 침해 등의 경우 배상액이 상향 조정되어 1회당 수천만원~수억원대까지 청구될 수 있습니다.</p>
                            <p class="mb-2"><strong>3) 부대비용 및 재판비용</strong></p>
                            <p class="ml-4 mb-3">저작권 침해 소송을 담당하는 전문 변호사의 정기적 비용, 법원 소송비용, 기술 감정료, 온라인 게시물 삭제 및 모니터링 비용 등 모든 부대비용을 피고인이 부담하게 됩니다.</p>
                            <p class="mb-2"><strong>4) 영구적 배포금지 가처분</strong></p>
                            <p class="ml-4 mb-3">법원은 EVKMC의 요청에 따라 피고인의 자료 배포를 영구적으로 금지하는 가처분 명령을 내릴 수 있습니다.</p>
                            <p class="mb-2"><strong>5) 이자 및 지연배상금</strong></p>
                            <p class="ml-4">손해배상금에 대해 법원이 정한 이자율(연 5%)이 가산되며, 판결 확정 이후 지연배상금도 발생합니다.</p>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">6. 책임의 범위 및 공동 불법행위</h2>
                    <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all" role="button" tabindex="0" aria-expanded="false">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-medium">직·간접적 책임이 발생하는 다양한 경우 확인하기</span>
                            <span class="expand-icon text-slate-600">▼</span>
                        </div>
                        <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                            <p class="mb-3"><strong>다음의 경우, 배포자 뿐만 아니라 적극적으로 확산에 동조하거나 도운 자도 법적 책임을 질 수 있습니다:</strong></p>
                            <ul class="list-disc list-inside ml-4 mb-3 space-y-1">
                                <li>불법 게시물의 재공유, 리트윗, 공감/좋아요 표시</li>
                                <li>다운로드 링크의 배포 또는 소개</li>
                                <li>적극적인 재전송 및 확산 (개인 채팅, 그룹 채팅, SNS, 메일 등)</li>
                                <li>삭제된 게시물의 스크린샷 저장 및 공유</li>
                                <li>수정·편집된 자료의 2차 배포</li>
                                <li>자료를 링크한 타 커뮤니티 게시물 작성</li>
                                <li>자료 배포자에게 제보, 정보 제공, 협력</li>
                            </ul>
                            <p><strong>공동 불법행위의 법적 책임:</strong></p>
                            <p class="ml-4">법원은 이러한 행위를 민법 제760조의 공동 불법행위로 인정하여 모든 관여자에게 연대 책임을 물을 수 있습니다. 즉, 실제 배포자가 아니더라도 확산을 도운 모든 사람이 손해배상을 해야 하며, EVKMC는 배포자뿐만 아니라 모든 참여자를 상대로 소송을 제기할 수 있습니다.</p>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">7. 모니터링, 적발 및 대응 절차</h2>
                    <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all" role="button" tabindex="0" aria-expanded="false">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-medium">EVKMC의 모니터링 방식 및 적발 시 대응 조치 알아보기</span>
                            <span class="expand-icon text-slate-600">▼</span>
                        </div>
                        <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                            <p class="mb-3"><strong>EVKMC는 본 포털 자료의 무단 배포를 지속적이고 광범위하게 모니터링하며, 적발 시 다음의 조치를 취합니다:</strong></p>
                            <p class="mb-2"><strong>1) 온라인 모니터링 및 삭제 요청</strong></p>
                            <p class="ml-4 mb-3">EVKMC는 Google, Naver, Kakao 등 주요 검색 엔진 및 SNS를 대상으로 무단 배포 자료를 정기적으로 모니터링합니다.</p>
                            <p class="mb-2"><strong>2) 배포자 신원 파악</strong></p>
                            <p class="ml-4 mb-3">EVKMC는 필요시 변호사와 협력하여 법원에 인터넷 이용자 정보 공개 청구를 제출, IP 주소를 통해 배포자의 실명을 파악할 수 있습니다.</p>
                            <p class="mb-2"><strong>3) 경찰청/검찰청 고소·고발</strong></p>
                            <p class="ml-4 mb-3">적발된 무단 배포 행위에 대해 저작권법, 정보통신망법, 영업비밀보호법 등 관련 법령을 근거로 경찰청 사이버수사대 또는 검찰청에 고소/고발을 제기합니다.</p>
                            <p class="mb-2"><strong>4) 포털 서비스 이용 중단</strong></p>
                            <p class="ml-4 mb-3">무단 배포 행위가 확인되면 해당 사용자의 포털 접근권을 즉시 차단합니다.</p>
                            <p class="mb-2"><strong>5) 협력점 인증 취소 및 거래 중단</strong></p>
                            <p class="ml-4 mb-3">배포자가 협력점 직원인 경우, 해당 협력점의 포털 인증을 취소하고 EVKMC와의 거래 관계를 중단할 수 있습니다.</p>
                            <p class="mb-2"><strong>6) 손해배상 청구 소송</strong></p>
                            <p class="ml-4">형사 고소/고발과 별도로 민사 손해배상 청구 소송을 제기합니다.</p>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">8. 사용자의 권리와 의무</h2>
                    <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all" role="button" tabindex="0" aria-expanded="false">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-medium">포털 이용 시 사용자가 가져야 할 책임감 확인하기</span>
                            <span class="expand-icon text-slate-600">▼</span>
                        </div>
                        <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                            <p class="mb-2"><strong>사용자의 권리:</strong></p>
                            <ul class="list-disc list-inside ml-4 mb-3 space-y-1">
                                <li>승인된 범위 내에서 포털의 기술 자료에 무제한 접근 권리</li>
                                <li>자료에 대한 질문 및 기술 지원 요청 권리</li>
                                <li>자료 업데이트 및 신규 자료에 대한 우선 접근 권리</li>
                                <li>EVKMC에 자료 개선 의견 제시 권리</li>
                            </ul>
                            <p class="mb-2"><strong>사용자의 의무:</strong></p>
                            <ul class="list-disc list-inside ml-4 space-y-1">
                                <li>포털에 접근하는 자신의 계정에 대한 보안 유지 (비밀번호 공개 금지)</li>
                                <li>자료 무단 배포 금지 및 저작권 표시 유지</li>
                                <li>자료 열람 및 사용 목적을 승인된 범위로 제한</li>
                                <li>자료 내용의 정확성 검증 책임</li>
                                <li>자료 사용으로 인한 손해에 대해 EVKMC에 책임을 묻지 않을 것</li>
                                <li>무단 배포를 발견한 경우 EVKMC에 즉시 신고할 의무</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

// 전역 함수로 등록 (내 정보 페이지에서 사용)
window.showSecurityAgreementView = function() {
    window.securityAgreement?.showViewOnlyPopup();
};

console.log('✅ securityAgreement 모듈 로드 완료');

