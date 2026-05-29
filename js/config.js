import { createClient } from '@supabase/supabase-js';
import { LMS_BRIDGE_URL_PRODUCTION, resolveLmsBridgeUrl } from './lmsBridgeUrl.js';

// js/config.js
// ✅ 수정사항: 환경변수에서 API 키를 안전하게 로드합니다

window.APP_CONFIG = {
  // 'development' 또는 'production' - 로컬 개발 시 development, 배포 시 production
  ENV: 'production',
  
  // Supabase URL과 API 키를 환경변수에서 가져옵니다
  // .env.local 파일에서 읽음
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'https://sesedcotooihnpjklqzs.supabase.co',
  SUPABASE_ANON_KEY:
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlc2VkY290b29paG5wamtscXpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjA5ODAsImV4cCI6MjA3NDgzNjk4MH0.AcbNoC19S_shBKXXs6-2LOo0KSnZ_Mk1ZejZtUX1EmI',

  /** LMS GSW 브릿지 수신 URL (쿼리 token=JWT) — 프로덕션에서 localhost 오설정 시 자동 보정 */
  GSW_LMS_BRIDGE_URL: resolveLmsBridgeUrl(
    import.meta.env.VITE_GSW_LMS_BRIDGE_URL || LMS_BRIDGE_URL_PRODUCTION
  ),
  GSW_BRIDGE_ALLOW_DEV: import.meta.env.VITE_GSW_BRIDGE_ALLOW_DEV === 'true',
  GSW_BRIDGE_ONLY: import.meta.env.VITE_GSW_BRIDGE_ONLY === 'true',
};

// 브랜드 정보
window.__BRAND__ = {
  name: "EVKMC A/S",
  primary: "#374151",      // 회색-700
  accent: "#9CA3AF",       // 회색-400
  dark: "#111827",         // 회색-900
  light: "#F3F4F6",        // 회색-100
  logoUrl: "assets/evkmc-logo.png",
  splashUrl: "assets/splash.jpg",
  splashByLine: {
    van: "assets/splash.jpg",
    qq: "assets/qq/splash.jpg",
  },
};

// ⚠️ 중요: 환경변수 확인
if (!window.APP_CONFIG.SUPABASE_URL || !window.APP_CONFIG.SUPABASE_ANON_KEY) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다!');
  console.error('VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 .env.local에 추가하세요.');
}

// Supabase 클라이언트 생성
window.supabaseClient = createClient(
  window.APP_CONFIG.SUPABASE_URL,
  window.APP_CONFIG.SUPABASE_ANON_KEY
);

console.log('✅ Supabase 클라이언트 초기화 완료');