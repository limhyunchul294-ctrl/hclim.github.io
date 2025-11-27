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
     */
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
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

    console.log('✅ Login 스크립트 로드 완료');
});