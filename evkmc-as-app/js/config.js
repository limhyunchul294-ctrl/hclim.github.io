import { createClient } from '@supabase/supabase-js';

// js/config.js
// ✅ 수정사항: 환경변수에서 API 키를 안전하게 로드합니다

// 환경 변수에서 API 키를 안전하게 로드 (Vite 사용 시)
// import.meta.env는 Vite에서 제공하는 환경 변수 접근 방법
const getEnvVar = (key, fallback = '') => {
  // Vite 환경 변수 (빌드 시점에 주입됨)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key] || fallback;
  }
  // 개발 환경에서 직접 접근 (window 객체 사용)
  // 주의: 이 방법은 프로덕션에서는 작동하지 않으므로 Vite 빌드 사용 권장
  return fallback;
};

window.APP_CONFIG = {
  // 'development' 또는 'production' - 로컬 개발 시 development, 배포 시 production
  ENV: getEnvVar('MODE', 'production'),
  
  // Supabase URL과 API 키를 환경변수에서 가져옵니다
  // .env.local 파일에서 읽음 (VITE_ 접두사 필요)
  SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL', 'https://sesedcotooihnpjklqzs.supabase.co'),
  SUPABASE_ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY', '')
};

// 브랜드 정보
window.__BRAND__ = {
  name: "EVKMC A/S",
  primary: "#374151",      // 회색-700
  accent: "#9CA3AF",       // 회색-400
  dark: "#111827",         // 회색-900
  light: "#F3F4F6",        // 회색-100
  logoUrl: "assets/evkmc-logo.png",
  splashUrl: "assets/splash.jpg"
};

// ⚠️ 중요: 환경변수 확인
if (!window.APP_CONFIG.SUPABASE_URL || !window.APP_CONFIG.SUPABASE_ANON_KEY) {
  const errorMsg = '❌ Supabase 환경 변수가 설정되지 않았습니다!\n' +
    '해결 방법:\n' +
    '1. evkmc-as-app/.env.local.example 파일을 .env.local로 복사\n' +
    '2. .env.local 파일에 실제 Supabase URL과 ANON_KEY 값을 입력\n' +
    '3. Vite 개발 서버 재시작 (npm run dev)';
  console.error(errorMsg);
  
  // 프로덕션 환경에서는 애플리케이션 실행 중단
  if (window.APP_CONFIG.ENV === 'production') {
    throw new Error('Supabase 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.');
  }
}

// Supabase 클라이언트 생성
window.supabaseClient = createClient(
  window.APP_CONFIG.SUPABASE_URL,
  window.APP_CONFIG.SUPABASE_ANON_KEY
);

console.log('✅ Supabase 클라이언트 초기화 완료');