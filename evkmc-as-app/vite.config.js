import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { resolve, dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  publicDir: 'public', // public 폴더의 내용을 dist 루트로 복사
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html')
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // 빌드 최적화 설정
    target: 'esnext',
    modulePreload: {
      polyfill: true
    },
    // CommonJS 변환 활성화 (Supabase 등 CommonJS 모듈 처리)
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  server: {
    port: 3000,
    open: true
  },
  // 명시적으로 resolve 설정 추가
  resolve: {
    alias: {
      '@': resolve(__dirname, 'js')
    },
    extensions: ['.js', '.mjs', '.json'],
    // 파일 시스템 명시
    preserveSymlinks: false
  },
  // 최적화 설정
  optimizeDeps: {
    include: ['@supabase/supabase-js'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  // CommonJS 플러그인 자동 변환
  esbuild: {
    target: 'esnext',
    format: 'esm'
  }
});

