/** 수퍼바이저 고위험 작업 전 본인 이메일 OTP 재인증 (로그인과 동일 절차) */

const STEP_UP_STORAGE_KEY = 'supervisor_step_up_verified_at';
const PENDING_STEP_UP_EMAIL_KEY = 'supervisor_step_up_pending_email';
const PENDING_STEP_UP_USERNAME_KEY = 'supervisor_step_up_pending_username';
const EMAIL_OTP_COOLDOWN_MS = 60 * 1000;
const COOLDOWN_STORAGE_KEY = 'supervisor_step_up_otp_cooldown_until';

export const SUPERVISOR_STEP_UP_TTL_MS = 10 * 60 * 1000;

export function isSupervisorStepUpVerified() {
    const ts = parseInt(sessionStorage.getItem(STEP_UP_STORAGE_KEY) || '0', 10);
    return ts > 0 && Date.now() - ts < SUPERVISOR_STEP_UP_TTL_MS;
}

export function markSupervisorStepUpVerified() {
    sessionStorage.setItem(STEP_UP_STORAGE_KEY, String(Date.now()));
}

export function clearSupervisorStepUp() {
    sessionStorage.removeItem(STEP_UP_STORAGE_KEY);
}

function getCooldownUntil() {
    const v = sessionStorage.getItem(COOLDOWN_STORAGE_KEY);
    return v ? parseInt(v, 10) : 0;
}

function setCooldownUntil(ts) {
    sessionStorage.setItem(COOLDOWN_STORAGE_KEY, String(ts));
}

async function sendSupervisorStepUpOtp(username, email) {
    const { data: userExists, error: checkError } = await window.supabaseClient.rpc('check_user_email', {
        in_username: username,
        in_email: email,
    });
    if (checkError) {
        throw new Error('사용자 정보 확인 중 오류가 발생했습니다.');
    }
    if (!userExists) {
        throw new Error('등록된 수퍼바이저 계정 정보와 일치하지 않습니다.');
    }

    const { error } = await window.supabaseClient.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
    });
    if (error) {
        if (error.message?.includes('rate limit')) {
            throw new Error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
        }
        throw new Error(error.message || '인증 코드 발송에 실패했습니다.');
    }

    sessionStorage.setItem(PENDING_STEP_UP_EMAIL_KEY, email);
    sessionStorage.setItem(PENDING_STEP_UP_USERNAME_KEY, username);
    setCooldownUntil(Date.now() + EMAIL_OTP_COOLDOWN_MS);
}

/**
 * @param {{ username: string, email: string, purposeLabel?: string }} opts
 * @returns {Promise<boolean>}
 */
export function requireSupervisorEmailStepUp(opts) {
    const { username, email, purposeLabel = '이 작업' } = opts;
    if (isSupervisorStepUpVerified()) {
        return Promise.resolve(true);
    }

    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className =
            'fixed inset-0 bg-black bg-opacity-60 z-[10000] flex items-center justify-center p-4';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');

        const panel = document.createElement('div');
        panel.className = 'bg-white rounded-xl shadow-2xl w-full max-w-md p-6';
        panel.innerHTML = `
            <h2 class="text-lg font-bold text-gray-900 mb-2">본인 이메일 인증</h2>
            <p class="text-sm text-gray-600 mb-4">${purposeLabel}을(를) 진행하려면 로그인과 동일하게 <strong>6자리 인증 코드</strong>를 입력해 주세요.</p>
            <p class="text-xs text-gray-500 mb-4 font-mono">${username} · ${email}</p>
            <div id="step-up-error" class="hidden text-sm text-red-600 mb-3"></div>
            <div id="step-up-send-panel">
                <button type="button" id="step-up-send-btn" class="w-full px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 text-sm font-medium">
                    인증 코드 발송
                </button>
            </div>
            <div id="step-up-verify-panel" class="hidden">
                <label class="block text-sm text-gray-700 mb-1">인증 코드 (6자리)</label>
                <input type="text" id="step-up-otp" inputmode="numeric" maxlength="6" autocomplete="one-time-code"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg text-center tracking-widest font-mono text-lg mb-3" placeholder="000000">
                <button type="button" id="step-up-verify-btn" class="w-full px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium mb-2">
                    확인
                </button>
                <button type="button" id="step-up-resend-btn" class="w-full text-sm text-gray-600 hover:text-gray-900">
                    코드 다시 받기
                </button>
            </div>
            <button type="button" id="step-up-cancel-btn" class="mt-4 w-full text-sm text-gray-500 hover:text-gray-800">
                취소
            </button>
        `;

        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        const errEl = panel.querySelector('#step-up-error');
        const sendPanel = panel.querySelector('#step-up-send-panel');
        const verifyPanel = panel.querySelector('#step-up-verify-panel');
        const sendBtn = panel.querySelector('#step-up-send-btn');
        const verifyBtn = panel.querySelector('#step-up-verify-btn');
        const resendBtn = panel.querySelector('#step-up-resend-btn');
        const cancelBtn = panel.querySelector('#step-up-cancel-btn');
        const otpInput = panel.querySelector('#step-up-otp');

        const showErr = (msg) => {
            if (!errEl) return;
            errEl.textContent = msg;
            errEl.classList.remove('hidden');
        };
        const hideErr = () => errEl?.classList.add('hidden');

        const cleanup = (ok) => {
            overlay.remove();
            resolve(ok);
        };

        const bindOtpInput = () => {
            if (!otpInput) return;
            otpInput.addEventListener('input', () => {
                otpInput.value = (otpInput.value || '').replace(/\D/g, '').slice(0, 6);
            });
        };
        bindOtpInput();

        sendBtn?.addEventListener('click', async () => {
            hideErr();
            const now = Date.now();
            const until = getCooldownUntil();
            if (now < until) {
                showErr(`잠시 후 다시 시도해 주세요. (${Math.ceil((until - now) / 1000)}초)`);
                return;
            }
            sendBtn.disabled = true;
            sendBtn.textContent = '발송 중…';
            try {
                await sendSupervisorStepUpOtp(username, email);
                sendPanel?.classList.add('hidden');
                verifyPanel?.classList.remove('hidden');
                setTimeout(() => otpInput?.focus(), 100);
            } catch (e) {
                showErr(e.message || '발송 실패');
            } finally {
                sendBtn.disabled = false;
                sendBtn.textContent = '인증 코드 발송';
            }
        });

        const doVerify = async () => {
            hideErr();
            const pendingEmail = sessionStorage.getItem(PENDING_STEP_UP_EMAIL_KEY);
            const token = (otpInput?.value || '').replace(/\D/g, '');
            if (!pendingEmail) {
                showErr('이메일 정보가 없습니다. 코드를 다시 받아 주세요.');
                return;
            }
            if (token.length < 6) {
                showErr('6자리 인증 코드를 입력해 주세요.');
                return;
            }
            verifyBtn.disabled = true;
            verifyBtn.textContent = '확인 중…';
            try {
                const { data, error } = await window.supabaseClient.auth.verifyOtp({
                    email: pendingEmail,
                    token,
                    type: 'email',
                });
                if (error || !data.session) {
                    showErr('인증 코드가 올바르지 않거나 만료되었습니다.');
                    return;
                }
                await window.supabaseClient.auth.setSession({
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                });
                if (window.authService) {
                    window.authService._userInfoCache = null;
                    window.authService._userInfoCacheTime = 0;
                }
                markSupervisorStepUpVerified();
                cleanup(true);
            } catch (e) {
                showErr(e.message || '인증 처리 오류');
            } finally {
                verifyBtn.disabled = false;
                verifyBtn.textContent = '확인';
            }
        };

        verifyBtn?.addEventListener('click', doVerify);
        otpInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') doVerify();
        });

        resendBtn?.addEventListener('click', async () => {
            hideErr();
            sendPanel?.classList.remove('hidden');
            verifyPanel?.classList.add('hidden');
            if (otpInput) otpInput.value = '';
        });

        cancelBtn?.addEventListener('click', () => cleanup(false));
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) cleanup(false);
        });
    });
}
