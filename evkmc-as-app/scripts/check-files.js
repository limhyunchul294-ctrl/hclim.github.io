import { existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

const requiredFiles = [
  'js/main.js',
  'js/login.js',
  'js/config.js',
  'index.html',
  'login.html'
];

console.log('🔍 필수 파일 확인 중...\n');

let allExist = true;
for (const file of requiredFiles) {
  const filePath = resolve(rootDir, file);
  if (existsSync(filePath)) {
    console.log(`✅ 파일 존재: ${file}`);
  } else {
    console.error(`❌ 파일 없음: ${file}`);
    allExist = false;
  }
}

if (!allExist) {
  console.error('\n❌ 필수 파일이 누락되었습니다!');
  process.exit(1);
}

console.log('\n✅ 모든 필수 파일이 존재합니다.');

