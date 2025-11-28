import { existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');
const distDir = resolve(rootDir, 'dist');
const assetsDir = resolve(distDir, 'assets');

console.log('🔍 빌드 결과 확인 중...\n');

if (!existsSync(distDir)) {
  console.error('❌ dist 폴더가 없습니다!');
  process.exit(1);
}

if (!existsSync(assetsDir)) {
  console.error('❌ dist/assets 폴더가 없습니다!');
  process.exit(1);
}

const files = readdirSync(assetsDir);
const jsFiles = files.filter(f => f.endsWith('.js'));

console.log(`✅ 생성된 JS 파일 개수: ${jsFiles.length}`);
console.log(`📁 JS 파일 목록:`);
jsFiles.forEach(f => console.log(`   - ${f}`));

if (jsFiles.length === 0) {
  console.error('\n❌ JS 번들 파일이 생성되지 않았습니다!');
  process.exit(1);
}

// main과 login 번들 파일이 있는지 확인
const hasMain = jsFiles.some(f => f.includes('main'));
const hasLogin = jsFiles.some(f => f.includes('login'));

if (!hasMain) {
  console.error('\n❌ main 번들 파일이 없습니다!');
  process.exit(1);
}

if (!hasLogin) {
  console.error('\n❌ login 번들 파일이 없습니다!');
  process.exit(1);
}

console.log('\n✅ 빌드 결과 확인 완료!');

