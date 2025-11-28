import './config.js';

// js/login.js
// ✅ 수정사항: OTP 검증 단계에서 버튼 비활성화 문제 해결

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const actionBtn = document.getElementById('action-btn');
    const otpSection = document.getElementById('otp-section');
    const errorMessage = document.getElementById('error-message');
    const phoneInput = document.getElementById('phone');
    const usernameInput = document.getElementById('username');
    const otpInput = document.getElementById('otp');

    // 로그인 상태: 'request-otp' (인증번호 요청) 또는 'verify-otp' (인증번호 검증)
    let loginMode = 'request-otp';

    /**
     * 전화번호 형식 검증
     * 예: 010-1234-5678 또는 01012345678
     */
    function validatePhone(phone) {
        const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/;
        return phoneRegex.test(phone.replace(/-/g, ''));
    }

    /**
     * 에러 메시지 표시
     */
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    }

    /**
     * 에러 메시지 숨기기
     */
    function hideError() {
        errorMessage.classList.add('hidden');
    }

    /**
     * 버튼 활성화
     */
    function enableButton() {
        actionBtn.disabled = false;
    }

    /**
     * 버튼 비활성화
     */
    function disableButton() {
        actionBtn.disabled = true;
    }

    /**
     * 로그인 폼 제출
     * ⚠️ 휴대폰 인증은 현재 비활성화됨 (추후 업데이트 예정)
     */
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        // 휴대폰 인증 비활성화 (추후 업데이트 예정)
        showError('휴대폰 인증은 추후 업데이트 예정입니다. 이메일 로그인을 이용해주세요.');
        return;
        
        disableButton();
        hideError();
        
        const username = usernameInput.value.trim();
        const phone = phoneInput.value.trim();

        try {
            // ========================================
            // 1단계: 입력값 검증
            // ========================================
            if (!username) {
                showError('사용자계정을 입력해주세요.');
                enableButton();
                return;
            }

            if (!validatePhone(phone)) {
                showError('올바른 휴대전화 번호를 입력해주세요. (010-XXXX-XXXX)');
                enableButton();
                return;
            }

            // 전화번호 형식 정규화
            const dbPhone = phone.replace(/-/g, '');        // 010XXXXXXXX (DB 조회용)
            const formattedPhone = '+82' + dbPhone.substring(1); // +8210XXXXXXXX (OTP 발송용)

            // ========================================
            // 2단계: 인증번호 요청 또는 검증
            // ========================================
            if (loginMode === 'request-otp') {
                console.log('🔄 Step 1: 사용자 정보 확인');
                actionBtn.textContent = '사용자 정보 확인 중...';

                // DB에 사용자 정보 존재 확인
                const { data: userExists, error: rpcError } = await window.supabaseClient
                    .rpc('check_user_credentials', {
                        in_username: username,
                        in_phone: dbPhone
                    });

                if (rpcError) {
                    console.error('❌ RPC 오류:', rpcError);
                    showError('사용자 정보 확인 중 오류가 발생했습니다. 관리자에게 문의해주세요.');
                    actionBtn.textContent = '휴대전화 인증하기';
                    enableButton();
                    return;
                }

                if (!userExists) {
                    showError('사용자 계정 또는 휴대전화 정보가 일치하지 않습니다.');
                    actionBtn.textContent = '휴대전화 인증하기';
                    enableButton();
                    return;
                }

                console.log('✅ 사용자 정보 확인 완료');
                console.log('🔄 Step 2: 인증번호 발송');
                actionBtn.textContent = '인증번호 발송 중...';

                // Supabase Auth를 통해 OTP 발송
                const { data: otpData, error: otpError } = await window.supabaseClient.auth.signInWithOtp({
                    phone: formattedPhone
                });

                if (otpError) {
                    console.error('❌ OTP 발송 오류:', otpError);
                    console.error('오류 코드:', otpError.status);
                    console.error('오류 메시지:', otpError.message);
                    
                    // "Database error saving new user" 오류인 경우
                    if (otpError.message?.includes('Database error') || 
                        otpError.message?.includes('saving new user') ||
                        otpError.status === 500) {
                        
                        // 사용자에게 안내 메시지 표시
                        showError(
                            '인증번호 발송 중 오류가 발생했습니다.\n\n' +
                            '가능한 원인:\n' +
                            '1. Supabase Dashboard에서 사용자 상태 확인 필요\n' +
                            '2. 관리자에게 문의하여 사용자 수동 생성 필요\n\n' +
                            '오류 코드: ' + (otpError.status || 'UNKNOWN') + '\n' +
                            '오류 메시지: ' + otpError.message
                        );
                        
                        // 개발자용 상세 로그
                        console.error('🔍 디버깅 정보:');
                        console.error('   - 전화번호:', formattedPhone);
                        console.error('   - DB 전화번호:', dbPhone);
                        console.error('   - 사용자명:', username);
                        console.error('   - 전체 오류:', JSON.stringify(otpError, null, 2));
                        
                        actionBtn.textContent = '휴대전화 인증하기';
                        enableButton();
                        return;
                    } else {
                        showError(`인증번호 발송 실패: ${otpError.message}`);
                        actionBtn.textContent = '휴대전화 인증하기';
                        enableButton();
                        return;
                    }
                }

                console.log('✅ 인증번호 발송 완료');

                // UI 전환: 인증번호 입력 화면으로 변경
                loginMode = 'verify-otp';
                otpSection.classList.remove('hidden');
                usernameInput.disabled = true;
                phoneInput.disabled = true;
                actionBtn.textContent = '로그인';
                otpInput.focus();
                enableButton();  // ← 중요: 버튼 다시 활성화

            } else if (loginMode === 'verify-otp') {
                // ========================================
                // 3단계: 인증번호 검증
                // ========================================
                console.log('🔄 Step 3: 인증번호 검증');
                actionBtn.textContent = '로그인 중...';

                const otp = otpInput.value.trim();

                // 인증번호 검증
                if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
                    showError('6자리 숫자로 된 인증번호를 입력해주세요.');
                    actionBtn.textContent = '로그인';
                    enableButton();
                    return;
                }

                console.log('📱 전화번호:', formattedPhone);
                console.log('🔐 인증번호:', otp);

                // Supabase Auth에서 OTP 검증
                const { data, error: verifyError } = await window.supabaseClient.auth.verifyOtp({
                    phone: formattedPhone,
                    token: otp,
                    type: 'sms'
                });

                if (verifyError) {
                    console.error('❌ OTP 검증 오류:', verifyError);
                    console.error('오류 코드:', verifyError.code);
                    console.error('오류 상태:', verifyError.status);
                    showError('인증번호가 올바르지 않습니다. 다시 시도해주세요.');
                    actionBtn.textContent = '로그인';
                    enableButton();
                    return;
                }

                if (!data.session) {
                    console.error('❌ 세션 생성 실패');
                    showError('로그인에 실패했습니다. 다시 시도해주세요.');
                    actionBtn.textContent = '로그인';
                    enableButton();
                    return;
                }

                // ✅ 로그인 성공!
                console.log('✅ 로그인 성공!');
                console.log('📊 세션:', data.session);
                
                // 로그인 시간 저장 (30분 세션 타이머 시작)
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('session_login_time', Date.now().toString());
                }
                
                // 세션 캐시 초기화하여 최신 세션 로드
                if (window.authSession) {
                    window.authSession._sessionCache = data.session;
                    window.authSession._lastFetchTime = Date.now();
                }
                
                // 로그인 성공 후 index.html로 리다이렉트 (스플래시 화면 표시됨)
                actionBtn.textContent = '로그인 성공!';
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 500);
            }

        } catch (error) {
            console.error('❌ 로그인 처리 오류:', error);
            console.error('오류 상세:', error.message);
            showError('예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            actionBtn.textContent = loginMode === 'request-otp' ? '휴대전화 인증하기' : '로그인';
            enableButton();
        }
    });

    // ============================================
    // OTP 입력 필드에서 엔터 키 처리
    // ============================================
    otpInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });

    // 연도 표시
    if (document.getElementById('year')) {
        document.getElementById('year').textContent = new Date().getFullYear();
    }

    // ============================================
    // 이메일 매직링크 로그인 기능
    // ============================================
    const emailLoginBtn = document.getElementById('email-login-btn');
    const emailModal = document.getElementById('email-modal');
    const emailLoginForm = document.getElementById('email-login-form');
    const closeEmailModal = document.getElementById('close-email-modal');
    const sendMagicLinkBtn = document.getElementById('send-magic-link-btn');
    const emailUsernameInput = document.getElementById('email-username');
    const emailInput = document.getElementById('email');
    const emailErrorMessage = document.getElementById('email-error-message');
    const emailSentModal = document.getElementById('email-sent-modal');
    const closeEmailSentModal = document.getElementById('close-email-sent-modal');

    /**
     * 이메일 형식 검증
     */
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * 이메일 에러 메시지 표시
     */
    function showEmailError(message) {
        emailErrorMessage.textContent = message;
        emailErrorMessage.classList.remove('hidden');
    }

    /**
     * 이메일 에러 메시지 숨기기
     */
    function hideEmailError() {
        emailErrorMessage.classList.add('hidden');
    }

    // 이메일 로그인 버튼 클릭
    if (emailLoginBtn) {
        emailLoginBtn.addEventListener('click', () => {
            emailModal.classList.remove('hidden');
            if (emailUsernameInput) emailUsernameInput.value = '';
            emailInput.value = '';
            hideEmailError();
            setTimeout(() => {
                if (emailUsernameInput) emailUsernameInput.focus();
            }, 100);
        });
    }

    // 이메일 모달 닫기
    if (closeEmailModal) {
        closeEmailModal.addEventListener('click', () => {
            emailModal.classList.add('hidden');
            if (emailUsernameInput) emailUsernameInput.value = '';
            emailInput.value = '';
            hideEmailError();
        });
    }

    // 이메일 발송 완료 모달 닫기
    if (closeEmailSentModal) {
        closeEmailSentModal.addEventListener('click', () => {
            emailSentModal.classList.add('hidden');
        });
    }

    // 모달 외부 클릭 시 닫기
    if (emailModal) {
        emailModal.addEventListener('click', (e) => {
            if (e.target === emailModal) {
                emailModal.classList.add('hidden');
                if (emailUsernameInput) emailUsernameInput.value = '';
                emailInput.value = '';
                hideEmailError();
            }
        });
    }

    if (emailSentModal) {
        emailSentModal.addEventListener('click', (e) => {
            if (e.target === emailSentModal) {
                emailSentModal.classList.add('hidden');
            }
        });
    }

    // 이메일 로그인 폼 제출
    if (emailLoginForm) {
        emailLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = emailUsernameInput ? emailUsernameInput.value.trim() : '';
            const email = emailInput.value.trim();
            
            // 입력값 검증
            if (!username) {
                showEmailError('사용자계정을 입력해주세요.');
                return;
            }

            if (!email) {
                showEmailError('이메일 주소를 입력해주세요.');
                return;
            }

            if (!validateEmail(email)) {
                showEmailError('올바른 이메일 주소를 입력해주세요.');
                return;
            }
            
            // 버튼 비활성화
            sendMagicLinkBtn.disabled = true;
            sendMagicLinkBtn.textContent = '확인 중...';
            hideEmailError();
            
            try {
                console.log('🔄 사용자 정보 확인 시작:', { username, email });
                
                // 1단계: public.users 테이블에서 이메일이 등록되어 있는지 확인
                // 이메일만으로 확인 (사용자명은 참고용)
                console.log('🔍 사용자 확인 시작:', { username, email });
                
                const { data: userExists, error: rpcError } = await window.supabaseClient
                    .rpc('check_user_email', {
                        in_username: username,
                        in_email: email.trim()
                    });
                
                console.log('📊 RPC 결과:', { userExists, rpcError });
                
                if (rpcError) {
                    console.error('❌ 사용자 확인 오류:', rpcError);
                    showEmailError(`사용자 정보 확인 중 오류가 발생했습니다: ${rpcError.message}`);
                    sendMagicLinkBtn.disabled = false;
                    sendMagicLinkBtn.textContent = '로그인 링크 발송';
                    return;
                }
                
                // 직접 테이블에서도 확인해보기 (디버깅용)
                const { data: directCheck, error: directError } = await window.supabaseClient
                    .from('users')
                    .select('email, name')
                    .eq('email', email.trim())
                    .limit(1);
                
                console.log('🔍 직접 테이블 조회 결과:', { directCheck, directError });
                
                if (!userExists) {
                    console.error('❌ 등록되지 않은 이메일:', { username, email, userExists, directCheck });
                    let errorMsg = '등록되지 않은 이메일 주소입니다. 이메일 주소를 확인해주세요.';
                    if (directCheck && directCheck.length > 0) {
                        errorMsg += ` (디버그: 테이블에는 존재하지만 함수가 false 반환)`;
                    }
                    showEmailError(errorMsg);
                    sendMagicLinkBtn.disabled = false;
                    sendMagicLinkBtn.textContent = '로그인 링크 발송';
                    return;
                }
                
                console.log('✅ 사용자 정보 확인 완료');
                sendMagicLinkBtn.textContent = '발송 중...';
                
                // 2단계: 매직링크 발송
                console.log('🔄 이메일 매직링크 발송 시작:', email);
                
                // 현재 페이지의 origin 가져오기
                const redirectUrl = `${window.location.origin}${window.location.pathname.replace('login.html', 'index.html')}`;
                
                // Supabase 매직링크 발송
                const { data, error } = await window.supabaseClient.auth.signInWithOtp({
                    email: email,
                    options: {
                        // 리다이렉트 URL 설정 (로그인 후 돌아올 페이지)
                        emailRedirectTo: redirectUrl
                    }
                });
                
                if (error) {
                    console.error('❌ 매직링크 발송 오류:', error);
                    
                    // 사용자에게 친화적인 에러 메시지
                    let errorMsg = '이메일 발송에 실패했습니다.';
                    if (error.message?.includes('rate limit')) {
                        errorMsg = '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
                    } else if (error.message?.includes('invalid')) {
                        errorMsg = '올바른 이메일 주소를 입력해주세요.';
                    } else {
                        errorMsg = `이메일 발송 실패: ${error.message}`;
                    }
                    
                    showEmailError(errorMsg);
                    sendMagicLinkBtn.disabled = false;
                    sendMagicLinkBtn.textContent = '로그인 링크 발송';
                    return;
                }
                
                console.log('✅ 매직링크 발송 완료');
                console.log('📧 발송된 이메일:', email);
                console.log('🔗 리다이렉트 URL:', redirectUrl);
                
                // 이메일 발송 완료 모달 표시
                const emailSentMessage = document.getElementById('email-sent-message');
                if (emailSentMessage) {
                    emailSentMessage.innerHTML = 
                        `<strong>${email}</strong>로 로그인 링크를 발송했습니다.<br><br>` +
                        `이메일의 링크를 클릭하여 로그인하세요.`;
                }
                
                emailModal.classList.add('hidden');
                emailSentModal.classList.remove('hidden');
                
                // 입력 필드 초기화
                emailInput.value = '';
                sendMagicLinkBtn.disabled = false;
                sendMagicLinkBtn.textContent = '로그인 링크 발송';
                
            } catch (error) {
                console.error('❌ 예상치 못한 오류:', error);
                showEmailError('예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
                sendMagicLinkBtn.disabled = false;
                sendMagicLinkBtn.textContent = '로그인 링크 발송';
            }
        });
    }

    // ============================================
    // 매직링크 콜백 처리 (페이지 로드 시)
    // ============================================
    async function handleMagicLinkCallback() {
        // URL hash에서 인증 정보 확인
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');
        
        // 에러가 있는 경우
        if (error) {
            console.error('❌ 매직링크 인증 오류:', error, errorDescription);
            showError(`로그인 실패: ${errorDescription || error}`);
            // URL에서 hash 제거
            window.history.replaceState(null, '', window.location.pathname);
            return;
        }
        
        // 매직링크로 로그인한 경우
        if (accessToken && (type === 'magiclink' || type === 'recovery')) {
            console.log('✅ 매직링크 인증 토큰 확인됨');
            console.log('📋 타입:', type);
            
            try {
                // 세션 확인
                const { data: { session }, error: sessionError } = await window.supabaseClient.auth.getSession();
                
                if (sessionError) {
                    console.error('❌ 세션 확인 오류:', sessionError);
                    showError('세션 확인 중 오류가 발생했습니다.');
                    window.history.replaceState(null, '', window.location.pathname);
                    return;
                }
                
                if (session) {
                    console.log('✅ 로그인 성공!');
                    console.log('📊 세션:', session);
                    
                    // 로그인 시간 저장 (30분 세션 타이머 시작)
                    if (typeof localStorage !== 'undefined') {
                        localStorage.setItem('session_login_time', Date.now().toString());
                    }
                    
                    // 세션 캐시 초기화하여 최신 세션 로드
                    if (window.authSession) {
                        window.authSession._sessionCache = session;
                        window.authSession._lastFetchTime = Date.now();
                    }
                    
                    // URL에서 hash 제거
                    window.history.replaceState(null, '', window.location.pathname);
                    
                    // index.html로 리다이렉트
                    window.location.href = 'index.html';
                } else {
                    console.warn('⚠️ 세션이 없습니다.');
                    window.history.replaceState(null, '', window.location.pathname);
                }
            } catch (error) {
                console.error('❌ 매직링크 처리 오류:', error);
                showError('로그인 처리 중 오류가 발생했습니다.');
                window.history.replaceState(null, '', window.location.pathname);
            }
        }
    }

    // 페이지 로드 시 매직링크 콜백 처리
    handleMagicLinkCallback();

    console.log('✅ Login 스크립트 로드 완료');
});
