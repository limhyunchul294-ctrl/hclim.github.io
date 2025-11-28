/**
 * SMS Gateway 테스트 스크립트
 * 
 * 사용법:
 *   node scripts/test-sms-gateway.js --phone 010-6430-8096 --message "테스트 메시지"
 */

import { sendSMSViaGateway } from './windows-phone-sms.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 환경 변수 로드
function loadEnv() {
    const envPath = join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8');
        envContent.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                }
            }
        });
    }
}

async function testSMS() {
    loadEnv();

    const args = process.argv.slice(2);
    let phone = null;
    let message = '테스트 SMS 전송입니다.';

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--phone' && args[i + 1]) {
            phone = args[i + 1];
            i++;
        } else if (args[i] === '--message' && args[i + 1]) {
            message = args[i + 1];
            i++;
        }
    }

    if (!phone) {
        console.log(`
SMS Gateway 테스트 스크립트

사용법:
  node scripts/test-sms-gateway.js --phone PHONE [--message MESSAGE]

예제:
  node scripts/test-sms-gateway.js --phone 010-6430-8096
  node scripts/test-sms-gateway.js --phone 010-6430-8096 --message "테스트 메시지"
        `);
        process.exit(1);
    }

    // 국내 번호 형식 정규화
    phone = phone.replace(/-/g, '').replace(/^\+82/, '0');
    
    // 010 형식 확인
    if (!phone.match(/^010\d{8}$/)) {
        console.error(`❌ 잘못된 전화번호 형식: ${phone}`);
        console.error('올바른 형식: 010-1234-5678 또는 01012345678');
        process.exit(1);
    }

    console.log('🚀 SMS Gateway 테스트 시작\n');
    console.log(`📱 전화번호: ${phone}`);
    console.log(`💬 메시지: ${message}`);
    console.log(`🌐 Gateway URL: ${process.env.SMS_GATEWAY_URL || '설정되지 않음'}`);
    console.log(`🔑 Token: ${process.env.SMS_GATEWAY_TOKEN || process.env.SMS_GATEWAY_API_KEY || '설정되지 않음'}`);
    console.log('');
    
    // 서버 연결 테스트
    try {
        const gatewayUrl = process.env.SMS_GATEWAY_URL;
        console.log(`🔍 서버 연결 테스트: ${gatewayUrl}`);
        const testResponse = await fetch(gatewayUrl, { method: 'GET' });
        console.log(`✅ 서버 응답: ${testResponse.status} ${testResponse.statusText}`);
        const testText = await testResponse.text().catch(() => '');
        if (testText) {
            console.log(`📄 응답 내용 (일부): ${testText.substring(0, 200)}`);
        }
        console.log('');
    } catch (err) {
        console.log(`⚠️  서버 연결 테스트 실패: ${err.message}`);
        console.log('');
    }

    try {
        const result = await sendSMSViaGateway(`+82${phone.substring(1)}`, message);
        console.log('\n✅ SMS 전송 성공!');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('\n❌ SMS 전송 실패:');
        console.error(error.message);
        process.exit(1);
    }
}

testSMS();

