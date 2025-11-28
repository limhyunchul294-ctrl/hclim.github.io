/**
 * Twilio SMS 내용을 다른 매체로 전송하는 서비스
 * 
 * 지원하는 알림 채널:
 * 1. Telegram Bot (무료, 실시간)
 * 2. Discord Webhook (무료, 실시간)
 * 3. Email (무료, 이메일 알림)
 * 4. 국내 SMS 서비스 연동 예시 (알리고, 쿨SMS 등)
 * 
 * 사용법:
 *   node scripts/notification-service.js --channel telegram --phone +821012345678
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Node.js 18+ 내장 fetch 사용 (필요시 node-fetch 설치: npm install node-fetch)
// const fetch = globalThis.fetch || require('node-fetch');
// ES Module에서는 fetch가 기본 제공되므로 그대로 사용

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
 * Telegram Bot을 통해 메시지 전송
 * 
 * 설정 방법:
 * 1. @BotFather에게 /newbot 명령어로 봇 생성
 * 2. 받은 Bot Token을 .env에 추가: TELEGRAM_BOT_TOKEN=your_token
 * 3. 채팅방 ID 확인: https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
 * 4. .env에 추가: TELEGRAM_CHAT_ID=your_chat_id
 */
async function sendTelegram(message, phoneNumber) {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
        throw new Error('TELEGRAM_BOT_TOKEN과 TELEGRAM_CHAT_ID를 .env에 설정해주세요.');
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const text = `📱 Twilio SMS 알림\n\n` +
                 `전화번호: ${phoneNumber}\n` +
                 `메시지 내용:\n${message}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: text,
                parse_mode: 'HTML'
            })
        });

        const data = await response.json();
        
        if (!data.ok) {
            throw new Error(`Telegram API 오류: ${data.description}`);
        }

        return { success: true, service: 'Telegram', messageId: data.result.message_id };
    } catch (error) {
        throw new Error(`Telegram 전송 실패: ${error.message}`);
    }
}

/**
 * Discord Webhook을 통해 메시지 전송
 * 
 * 설정 방법:
 * 1. Discord 서버 설정 > 통합 > 웹후크 > 새 웹후크
 * 2. 웹후크 URL 복사
 * 3. .env에 추가: DISCORD_WEBHOOK_URL=your_webhook_url
 */
async function sendDiscord(message, phoneNumber) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
        throw new Error('DISCORD_WEBHOOK_URL을 .env에 설정해주세요.');
    }

    const embed = {
        title: '📱 Twilio SMS 알림',
        description: message,
        color: 0x3498db,
        fields: [
            {
                name: '전화번호',
                value: phoneNumber,
                inline: true
            },
            {
                name: '발송 시간',
                value: new Date().toLocaleString('ko-KR'),
                inline: true
            }
        ],
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                embeds: [embed]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Discord API 오류: ${errorText}`);
        }

        return { success: true, service: 'Discord' };
    } catch (error) {
        throw new Error(`Discord 전송 실패: ${error.message}`);
    }
}

/**
 * 이메일을 통해 알림 전송 (Node.js nodemailer 필요)
 * 
 * 설정 방법:
 * 1. npm install nodemailer
 * 2. .env에 이메일 설정 추가:
 *    EMAIL_SERVICE=gmail
 *    EMAIL_USER=your_email@gmail.com
 *    EMAIL_PASS=your_app_password
 *    EMAIL_TO=recipient@example.com
 */
async function sendEmail(message, phoneNumber) {
    try {
        // nodemailer를 동적으로 로드 (설치된 경우에만)
        const nodemailer = (await import('nodemailer')).default;

        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TO,
            subject: `📱 Twilio SMS 알림 - ${phoneNumber}`,
            html: `
                <h2>Twilio SMS 알림</h2>
                <p><strong>전화번호:</strong> ${phoneNumber}</p>
                <p><strong>메시지 내용:</strong></p>
                <pre>${message}</pre>
                <p><strong>발송 시간:</strong> ${new Date().toLocaleString('ko-KR')}</p>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, service: 'Email', messageId: info.messageId };
    } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') {
            throw new Error('nodemailer가 설치되지 않았습니다. npm install nodemailer 실행 필요');
        }
        throw new Error(`이메일 전송 실패: ${error.message}`);
    }
}

/**
 * 알리고 (국내 SMS 서비스)를 통해 SMS 전송
 * 
 * 설정 방법:
 * 1. 알리고 가입: https://www.aligo.in
 * 2. .env에 추가:
 *    ALIGO_API_KEY=your_api_key
 *    ALIGO_USER_ID=your_user_id
 *    ALIGO_SENDER=발신번호
 */
async function sendAligo(message, phoneNumber) {
    const apiKey = process.env.ALIGO_API_KEY;
    const userId = process.env.ALIGO_USER_ID;
    const sender = process.env.ALIGO_SENDER;

    if (!apiKey || !userId || !sender) {
        throw new Error('ALIGO_API_KEY, ALIGO_USER_ID, ALIGO_SENDER를 .env에 설정해주세요.');
    }

    // 국내 번호 형식으로 변환 (+821012345678 -> 01012345678)
    const localPhone = phoneNumber.replace(/^\+82/, '0');

    const url = 'https://apis.aligo.in/send/';
    const formData = new URLSearchParams({
        key: apiKey,
        user_id: userId,
        sender: sender,
        receiver: localPhone,
        msg: message,
        testmode_yn: 'N' // 테스트 모드: Y (실제 발송 안함)
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString()
        });

        const data = await response.json();
        
        if (data.result_code !== '1') {
            throw new Error(`알리고 API 오류: ${data.message}`);
        }

        return { success: true, service: 'Aligo', messageId: data.msg_id };
    } catch (error) {
        throw new Error(`알리고 전송 실패: ${error.message}`);
    }
}

/**
 * 쿨SMS (국내 SMS 서비스)를 통해 SMS 전송
 * 
 * 설정 방법:
 * 1. 쿨SMS 가입: https://www.coolsms.co.kr
 * 2. .env에 추가:
 *    COOLSMS_API_KEY=your_api_key
 *    COOLSMS_API_SECRET=your_api_secret
 *    COOLSMS_SENDER=발신번호
 */
async function sendCoolSMS(message, phoneNumber) {
    const apiKey = process.env.COOLSMS_API_KEY;
    const apiSecret = process.env.COOLSMS_API_SECRET;
    const sender = process.env.COOLSMS_SENDER;

    if (!apiKey || !apiSecret || !sender) {
        throw new Error('COOLSMS_API_KEY, COOLSMS_API_SECRET, COOLSMS_SENDER를 .env에 설정해주세요.');
    }

    // 국내 번호 형식으로 변환
    const localPhone = phoneNumber.replace(/^\+82/, '0');

    const url = 'https://api.coolsms.co.kr/messages/v4/send';
    
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: {
                    to: localPhone,
                    from: sender,
                    text: message
                }
            })
        });

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(`쿨SMS API 오류: ${data.errorMessage || JSON.stringify(data)}`);
        }

        return { success: true, service: 'CoolSMS', messageId: data.groupId };
    } catch (error) {
        throw new Error(`쿨SMS 전송 실패: ${error.message}`);
    }
}

/**
 * 메인 함수: Twilio에서 최신 SMS 조회 후 전송
 */
async function sendLatestSMS(channel, phoneNumber) {
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
            case 'telegram':
                result = await sendTelegram(messageBody, phoneNumber);
                break;
            case 'discord':
                result = await sendDiscord(messageBody, phoneNumber);
                break;
            case 'email':
                result = await sendEmail(messageBody, phoneNumber);
                break;
            case 'aligo':
                result = await sendAligo(messageBody, phoneNumber);
                break;
            case 'coolsms':
                result = await sendCoolSMS(messageBody, phoneNumber);
                break;
            default:
                throw new Error(`지원하지 않는 채널: ${channel}. telegram, discord, email, aligo, coolsms 중 선택해주세요.`);
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
    sendLatestSMS(channel, phone).catch(console.error);
} else {
    console.log(`
Twilio SMS 알림 서비스

사용법:
  node scripts/notification-service.js --channel CHANNEL --phone PHONE

채널 옵션:
  telegram  - Telegram Bot (무료)
  discord   - Discord Webhook (무료)
  email     - 이메일 (무료, nodemailer 필요)
  aligo     - 알리고 SMS (유료, 국내)
  coolsms   - 쿨SMS (유료, 국내)

예제:
  node scripts/notification-service.js --channel telegram --phone +821012345678
    `);
}

export { sendTelegram, sendDiscord, sendEmail, sendAligo, sendCoolSMS, sendLatestSMS };

