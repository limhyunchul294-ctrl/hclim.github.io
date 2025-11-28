/**
 * Windows 휴대폰 연결을 활용한 SMS 전송
 * 
 * Windows Phone Link는 직접적인 API를 제공하지 않지만,
 * 안드로이드 스마트폰의 SMS Gateway를 활용하여 SMS를 전송할 수 있습니다.
 * 
 * 지원하는 방법:
 * 1. 안드로이드 SMS Gateway 서버 앱 사용
 * 2. Tasker 앱 + HTTP 요청
 * 3. 안드로이드 웹앱을 통한 직접 전송
 * 
 * 사용법:
 *   node scripts/windows-phone-sms.js --phone +821012345678 --message "메시지 내용"
 */

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

/**
 * 방법 1: SMS Gateway 서버 앱 사용
 * 
 * 안드로이드 앱 설치 필요:
 * - "SMS Gateway Server" (Play Store에서 검색)
 * - 또는 "SMS Gateway API" 앱
 * 
 * 설정:
 * 1. 안드로이드 폰에 SMS Gateway 앱 설치
 * 2. 앱에서 HTTP API 서버 활성화
 * 3. IP 주소와 포트 확인 (예: 192.168.0.100:8080)
 * 4. API 키 설정 (선택사항)
 * 5. .env에 추가:
 *    SMS_GATEWAY_URL=http://192.168.0.100:8080
 *    SMS_GATEWAY_API_KEY=your_api_key (선택사항)
 */
async function sendSMSViaGateway(phoneNumber, message) {
    const gatewayUrl = process.env.SMS_GATEWAY_URL;
    const apiKey = process.env.SMS_GATEWAY_API_KEY || process.env.SMS_GATEWAY_TOKEN;

    if (!gatewayUrl) {
        throw new Error('SMS_GATEWAY_URL을 .env에 설정해주세요. (예: http://192.168.0.100:8080)');
    }

    // 국내 번호 형식으로 변환 (+821012345678 -> 01012345678)
    const localPhone = phoneNumber.replace(/^\+82/, '0').replace(/-/g, '');

    try {
        // API 문서에 따르면 루트 경로(/)에 POST 요청
        // 형식: { "to": "+821012345678", "message": "메시지 내용" }
        const endpoint = '/';
        const url = `${gatewayUrl}${endpoint}`;
        
        // 국제 형식으로 변환 (+8210...)
        const internationalPhone = `+82${localPhone.substring(1)}`;

        // API 문서 형식에 맞춘 요청 본문 (토큰 포함)
        const requestBodies = [
            // 토큰을 본문에 포함 (가장 일반적)
            { to: internationalPhone, message: message, token: apiKey },
            { to: internationalPhone, message: message, api_key: apiKey },
            { to: internationalPhone, message: message, authorization: apiKey },
            // 토큰 없이 시도 (인증이 설정되지 않은 경우)
            { to: internationalPhone, message: message }
        ];

        // 헤더 설정 (토큰을 헤더에 포함하는 방식도 시도)
        const headerOptions = [
            // 토큰을 본문에만 포함
            { 'Content-Type': 'application/json' },
            // 토큰을 헤더에 포함
            { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
            { 'Content-Type': 'application/json', 'Token': apiKey },
            { 'Content-Type': 'application/json', 'X-Token': apiKey }
        ];

        let lastError = null;

        for (const headers of headerOptions) {
            for (const body of requestBodies) {
                try {
                    console.log(`🔍 시도 중: ${JSON.stringify(Object.keys(body))}, 헤더: ${Object.keys(headers).join(', ')}`);
                    
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify(body)
                    });

                    const responseText = await response.text().catch(() => '');
                    
                    if (response.ok) {
                        try {
                            const data = JSON.parse(responseText);
                            console.log(`✅ SMS 전송 성공!`);
                            console.log(`   사용된 형식: ${JSON.stringify(Object.keys(body))}`);
                            return { success: true, service: 'SMS Gateway', data: data };
                        } catch (parseErr) {
                            // JSON 파싱 실패하지만 200 응답인 경우
                            if (responseText.toLowerCase().includes('success') || 
                                responseText.toLowerCase().includes('sent') ||
                                responseText.toLowerCase().includes('ok')) {
                                console.log(`✅ SMS 전송 성공!`);
                                return { success: true, service: 'SMS Gateway', data: { message: responseText } };
                            }
                        }
                    } else {
                        // 디버깅: 실패한 요청 로그
                        if (response.status === 401) {
                            console.log(`⚠️  인증 실패 (401): 토큰 확인 필요`);
                        } else {
                            console.log(`⚠️  시도 실패: ${response.status} ${response.statusText}`);
                            if (responseText && responseText.length < 300) {
                                console.log(`   응답: ${responseText}`);
                            }
                        }
                    }
                } catch (err) {
                    lastError = err;
                    // 다음 형식 시도
                    continue;
                }
            }
        }

        // 모든 시도 실패
        if (lastError) {
            if (lastError.code === 'ECONNREFUSED' || lastError.code === 'ENOTFOUND') {
                throw new Error(`SMS Gateway 서버에 연결할 수 없습니다. 안드로이드 폰의 IP 주소와 포트를 확인해주세요: ${gatewayUrl}`);
            }
            throw new Error(`SMS Gateway 전송 실패: ${lastError.message}`);
        }

        throw new Error(`SMS 전송 실패: 모든 인증 방식 시도 실패. 토큰(${apiKey ? '설정됨' : '없음'})과 API 형식을 확인해주세요.\nAPI 형식: POST / { "to": "+8210...", "message": "..." }`);

    } catch (error) {
        throw new Error(`SMS Gateway 전송 실패: ${error.message}`);
    }
}

/**
 * 방법 2: Tasker 앱을 통한 HTTP 요청
 * 
 * 안드로이드 설정:
 * 1. Tasker 앱 설치
 * 2. HTTP Request 프로필 생성
 * 3. SMS 전송 태스크 설정
 * 4. AutoShare 플러그인으로 HTTP 요청 수신 시 SMS 전송
 * 
 * 이 방법은 Tasker 설정이 복잡하므로, 
 * 방법 1 (SMS Gateway)을 권장합니다.
 */

/**
 * 방법 3: Microsoft Graph API를 통한 Teams/Outlook 알림
 * 
 * Windows Phone Link는 직접 API가 없지만,
 * Microsoft Graph API를 통해 Teams나 Outlook으로 알림을 보낼 수 있습니다.
 */
async function sendNotificationViaGraph(message, phoneNumber) {
    const clientId = process.env.MICROSOFT_CLIENT_ID;
    const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
    const tenantId = process.env.MICROSOFT_TENANT_ID;
    const chatId = process.env.MICROSOFT_TEAMS_CHAT_ID;

    if (!clientId || !clientSecret || !tenantId) {
        throw new Error('Microsoft Graph API 인증 정보를 .env에 설정해주세요.');
    }

    try {
        // Microsoft Graph API 인증 토큰 획득
        const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
        const tokenResponse = await fetch(tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                scope: 'https://graph.microsoft.com/.default',
                grant_type: 'client_credentials'
            })
        });

        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token) {
            throw new Error('Microsoft Graph API 인증 실패');
        }

        // Teams 채팅으로 메시지 전송
        if (chatId) {
            const teamsUrl = `https://graph.microsoft.com/v1.0/chats/${chatId}/messages`;
            const messageResponse = await fetch(teamsUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${tokenData.access_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    body: {
                        contentType: 'text',
                        content: `📱 Twilio SMS 알림\n\n전화번호: ${phoneNumber}\n메시지: ${message}`
                    }
                })
            });

            if (!messageResponse.ok) {
                const errorText = await messageResponse.text();
                throw new Error(`Teams API 오류: ${errorText}`);
            }

            return { success: true, service: 'Microsoft Teams', data: await messageResponse.json() };
        }

        throw new Error('MICROSOFT_TEAMS_CHAT_ID를 .env에 설정해주세요.');

    } catch (error) {
        throw new Error(`Microsoft Graph API 전송 실패: ${error.message}`);
    }
}

/**
 * 방법 4: 안드로이드 ADB를 통한 직접 전송
 * 
 * 안드로이드 개발자 옵션과 USB 디버깅이 활성화된 경우,
 * ADB(Android Debug Bridge)를 통해 SMS를 전송할 수 있습니다.
 * 
 * 설정:
 * 1. 안드로이드 폰에서 개발자 옵션 활성화
 * 2. USB 디버깅 활성화
 * 3. USB로 PC와 연결
 * 4. ADB 설치: https://developer.android.com/studio/releases/platform-tools
 */
async function sendSMSViaADB(phoneNumber, message) {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    // 국내 번호 형식으로 변환
    const localPhone = phoneNumber.replace(/^\+82/, '0').replace(/-/g, '');

    try {
        // ADB를 통해 SMS 전송 (안드로이드 SDK 필요)
        // adb shell service call isms 5 i32 1 s16 "com.android.mms.service" s16 "+821012345678" s16 "null" s16 "메시지 내용" s16 "null" s16 "null"
        
        // 더 간단한 방법: Android 앱 패키지를 사용
        // SMS를 보내는 안드로이드 앱을 만들고, ADB로 실행
        
        // 주의: 이 방법은 복잡하고 권장하지 않음
        // SMS Gateway 서버 앱 사용을 권장
        
        throw new Error('ADB를 통한 SMS 전송은 복잡합니다. SMS Gateway 서버 앱 사용을 권장합니다.');

    } catch (error) {
        throw new Error(`ADB 전송 실패: ${error.message}`);
    }
}

/**
 * 메인 함수: Twilio에서 최신 SMS 조회 후 Windows/안드로이드를 통해 전송
 */
async function sendLatestSMSViaPhone(channel, phoneNumber) {
    loadEnv();

    // Twilio 클라이언트 초기화
    const twilio = (await import('twilio')).default;
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
        throw new Error('TWILIO_ACCOUNT_SID와 TWILIO_AUTH_TOKEN을 .env에 설정해주세요.');
    }

    const client = twilio(accountSid, authToken);

    try {
        // 특정 번호로 발송된 최신 메시지 조회
        const messages = await client.messages.list({
            to: phoneNumber,
            limit: 1
        });

        if (messages.length === 0) {
            throw new Error(`${phoneNumber}로 발송된 메시지를 찾을 수 없습니다.`);
        }

        const latestMessage = messages[0];
        const messageBody = latestMessage.body || '(메시지 내용 없음)';

        console.log(`📱 최신 SMS 조회:`);
        console.log(`   전화번호: ${phoneNumber}`);
        console.log(`   내용: ${messageBody}`);
        console.log(`   발송 시간: ${latestMessage.dateSent}`);
        console.log('');

        // 선택한 채널로 전송
        let result;
        switch (channel.toLowerCase()) {
            case 'gateway':
                result = await sendSMSViaGateway(phoneNumber, messageBody);
                break;
            case 'teams':
                result = await sendNotificationViaGraph(messageBody, phoneNumber);
                break;
            default:
                throw new Error(`지원하지 않는 채널: ${channel}. gateway 또는 teams 중 선택해주세요.`);
        }

        console.log(`✅ ${result.service}로 전송 성공!`);
        return result;

    } catch (error) {
        console.error(`❌ 오류: ${error.message}`);
        throw error;
    }
}

// 커맨드라인 실행
const args = process.argv.slice(2);
let channel = null;
let phone = null;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--channel' && args[i + 1]) {
        channel = args[i + 1];
        i++;
    } else if (args[i] === '--phone' && args[i + 1]) {
        phone = args[i + 1];
        i++;
    }
}

if (channel && phone) {
    sendLatestSMSViaPhone(channel, phone).catch(console.error);
} else {
    console.log(`
Windows 휴대폰 연결을 활용한 SMS 전송

⚠️  주의: Windows Phone Link는 직접적인 API를 제공하지 않습니다.
대신 안드로이드 스마트폰의 SMS Gateway를 활용합니다.

사용법:
  node scripts/windows-phone-sms.js --channel CHANNEL --phone PHONE

채널 옵션:
  gateway  - 안드로이드 SMS Gateway 서버 앱 (권장)
  teams    - Microsoft Teams 알림 (Windows 통합)

방법 1: SMS Gateway 서버 앱 (권장)
  설정:
  1. 안드로이드 폰에 "SMS Gateway Server" 앱 설치
  2. 앱에서 HTTP API 서버 활성화
  3. IP 주소와 포트 확인 (예: 192.168.0.100:8080)
  4. .env에 추가:
     SMS_GATEWAY_URL=http://192.168.0.100:8080
     SMS_GATEWAY_API_KEY=your_api_key (선택사항)

방법 2: Microsoft Teams 알림
  설정:
  1. Azure AD 앱 등록
  2. .env에 추가:
     MICROSOFT_CLIENT_ID=your_client_id
     MICROSOFT_CLIENT_SECRET=your_client_secret
     MICROSOFT_TENANT_ID=your_tenant_id
     MICROSOFT_TEAMS_CHAT_ID=your_chat_id

예제:
  node scripts/windows-phone-sms.js --channel gateway --phone +821012345678
    `);
}

export { sendSMSViaGateway, sendNotificationViaGraph, sendLatestSMSViaPhone };

