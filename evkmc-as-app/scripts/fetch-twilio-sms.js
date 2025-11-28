/**
 * Twilio Verify SMS 크롤링 스크립트
 * 
 * Twilio Monitor에서 Verify 서비스로 발송된 SMS 내용만 추출합니다.
 * 
 * 사용법:
 *   node scripts/fetch-twilio-sms.js [옵션]
 * 
 * 환경 변수 설정 (.env 파일 또는 환경 변수):
 *   TWILIO_ACCOUNT_SID=your_account_sid
 *   TWILIO_AUTH_TOKEN=your_auth_token
 * 
 * 옵션:
 *   --limit N        : 최대 N개 메시지 조회 (기본값: 100)
 *   --since DATE     : 시작 날짜 (YYYY-MM-DD 형식)
 *   --until DATE     : 종료 날짜 (YYYY-MM-DD 형식)
 *   --to PHONE       : 특정 전화번호로 필터링
 *   --output FILE    : 결과를 JSON 파일로 저장
 *   --format text    : 텍스트 형식으로 출력 (기본값: json)
 */

import twilio from 'twilio';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 환경 변수 로드 (.env 파일이 있으면 로드)
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

// 커맨드라인 인수 파싱
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        limit: 100,
        since: null,
        until: null,
        to: null,
        output: null,
        format: 'json'
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const nextArg = args[i + 1];

        switch (arg) {
            case '--limit':
                if (nextArg) {
                    options.limit = parseInt(nextArg, 10);
                    i++;
                }
                break;
            case '--since':
                if (nextArg) {
                    options.since = new Date(nextArg);
                    i++;
                }
                break;
            case '--until':
                if (nextArg) {
                    options.until = new Date(nextArg);
                    i++;
                }
                break;
            case '--to':
                if (nextArg) {
                    options.to = nextArg;
                    i++;
                }
                break;
            case '--output':
                if (nextArg) {
                    options.output = nextArg;
                    i++;
                }
                break;
            case '--format':
                if (nextArg) {
                    options.format = nextArg;
                    i++;
                }
                break;
            case '--help':
                console.log(`
Twilio Verify SMS 크롤링 스크립트

사용법:
  node scripts/fetch-twilio-sms.js [옵션]

필수 환경 변수:
  TWILIO_ACCOUNT_SID  : Twilio 계정 SID
  TWILIO_AUTH_TOKEN   : Twilio 인증 토큰

옵션:
  --limit N           : 최대 N개 메시지 조회 (기본값: 100)
  --since DATE        : 시작 날짜 (YYYY-MM-DD)
  --until DATE        : 종료 날짜 (YYYY-MM-DD)
  --to PHONE          : 특정 전화번호로 필터링 (예: +821012345678)
  --output FILE       : 결과를 파일로 저장
  --format FORMAT     : 출력 형식 (json 또는 text, 기본값: json)
  --help              : 도움말 표시

예제:
  # 최근 50개 SMS 조회
  node scripts/fetch-twilio-sms.js --limit 50

  # 특정 기간의 SMS 조회
  node scripts/fetch-twilio-sms.js --since 2024-01-01 --until 2024-01-31

  # 특정 번호로 발송된 SMS 조회
  node scripts/fetch-twilio-sms.js --to +821012345678

  # 텍스트 형식으로 출력
  node scripts/fetch-twilio-sms.js --format text

  # JSON 파일로 저장
  node scripts/fetch-twilio-sms.js --output sms-log.json
                `);
                process.exit(0);
        }
    }

    return options;
}

// Twilio 클라이언트 초기화
function initTwilioClient() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
        console.error('❌ 오류: TWILIO_ACCOUNT_SID와 TWILIO_AUTH_TOKEN 환경 변수가 필요합니다.');
        console.error('');
        console.error('설정 방법:');
        console.error('  1. .env 파일 생성:');
        console.error('     TWILIO_ACCOUNT_SID=your_account_sid');
        console.error('     TWILIO_AUTH_TOKEN=your_auth_token');
        console.error('');
        console.error('  2. 또는 환경 변수로 설정:');
        console.error('     export TWILIO_ACCOUNT_SID=your_account_sid');
        console.error('     export TWILIO_AUTH_TOKEN=your_auth_token');
        process.exit(1);
    }

    return twilio(accountSid, authToken);
}

// Verify 서비스의 SMS 메시지 가져오기
async function fetchVerifySMS(client, options) {
    console.log('🔍 Twilio Verify SMS 조회 중...\n');

    try {
        // Verify 서비스 목록 가져오기
        const verifyServices = await client.verify.v2.services.list();
        
        if (verifyServices.length === 0) {
            console.log('⚠️  Verify 서비스를 찾을 수 없습니다.');
            return [];
        }

        console.log(`✅ ${verifyServices.length}개의 Verify 서비스를 찾았습니다.\n`);

        // 모든 Verify 서비스에서 메시지 수집
        let allSMS = [];

        for (const service of verifyServices) {
            console.log(`📱 서비스: ${service.friendlyName || service.sid} (${service.sid})`);
            
            try {
                // Verify 시도 목록 가져오기 (SMS 발송 기록 포함)
                // 주의: Twilio SDK 버전에 따라 API 구조가 다를 수 있습니다.
                let verifications = [];
                try {
                    verifications = await client.verify.v2
                        .services(service.sid)
                        .verifications
                        .list({
                            limit: options.limit,
                            dateCreatedAfter: options.since,
                            dateCreatedBefore: options.until
                        });
                } catch (apiError) {
                    // API 구조가 다른 경우를 대비
                    try {
                        verifications = await client.verify
                            .services(service.sid)
                            .verifications
                            .list({
                                limit: options.limit,
                                dateCreatedAfter: options.since,
                                dateCreatedBefore: options.until
                            });
                    } catch (apiError2) {
                        console.log(`   ⚠️  Verify API 호출 실패 (건너뜀): ${apiError2.message}`);
                        continue; // 이 서비스는 건너뛰고 계속
                    }
                }

                console.log(`   - ${verifications.length}개의 인증 시도 발견`);

                // 각 인증 시도에 대한 상세 정보 가져오기
                for (const verification of verifications) {
                    // 전화번호 필터링
                    if (options.to && verification.to !== options.to) {
                        continue;
                    }

                    // SMS 관련 정보 추출
                    // 주의: Verify API는 직접적인 SMS 내용(body)을 제공하지 않습니다.
                    // 실제 SMS 내용을 확인하려면 Messages API를 사용해야 합니다.
                    const smsInfo = {
                        serviceSid: service.sid,
                        serviceName: service.friendlyName || service.sid,
                        verificationSid: verification.sid,
                        to: verification.to,
                        status: verification.status,
                        channel: verification.channel,
                        dateCreated: verification.dateCreated,
                        dateUpdated: verification.dateUpdated,
                        // body는 Messages API에서 가져와야 함
                    };

                    allSMS.push(smsInfo);
                }
            } catch (error) {
                console.error(`   ❌ 오류 발생: ${error.message}`);
            }
        }

        return allSMS;

    } catch (error) {
        console.error('❌ SMS 조회 중 오류 발생:', error.message);
        throw error;
    }
}

// 메시지 로그 가져오기 (Verify와 별도의 메시지 로그)
async function fetchMessageLogs(client, options) {
    console.log('📨 Twilio 메시지 로그 조회 중...\n');

    try {
        const listOptions = {
            limit: options.limit || 50
        };
        
        if (options.since) {
            listOptions.dateSentAfter = options.since;
        }
        if (options.until) {
            listOptions.dateSentBefore = options.until;
        }
        if (options.to) {
            listOptions.to = options.to;
        }

        console.log(`   📋 조회 옵션:`, JSON.stringify(listOptions, null, 2));
        
        const messages = await client.messages.list(listOptions);
        
        console.log(`   ✅ Twilio API에서 ${messages.length}개 메시지 수신\n`);

        // 모든 메시지 반환 (필터링 제거 - Messaging 로그의 모든 Body 확인)
        const formattedMessages = messages.map(msg => ({
            sid: msg.sid,
            to: msg.to,
            from: msg.from,
            body: msg.body || '(메시지 내용 없음)',
            status: msg.status,
            dateSent: msg.dateSent,
            dateCreated: msg.dateCreated,
            direction: msg.direction,
            errorCode: msg.errorCode || null,
            errorMessage: msg.errorMessage || null
        }));

        return formattedMessages;

    } catch (error) {
        console.error('❌ 메시지 로그 조회 중 오류 발생:', error.message);
        throw error;
    }
}

// 결과 출력
function outputResults(smsData, options) {
    if (smsData.length === 0) {
        console.log('\n⚠️  조회된 SMS가 없습니다.');
        return;
    }

    console.log(`\n✅ 총 ${smsData.length}개의 SMS를 찾았습니다.\n`);

    let output = '';

    if (options.format === 'text') {
        // 텍스트 형식 출력
        smsData.forEach((sms, index) => {
            output += `\n[${index + 1}] SMS 정보\n`;
            output += `${'='.repeat(50)}\n`;
            output += `전화번호: ${sms.to || sms.To || 'N/A'}\n`;
            output += `발신자: ${sms.from || sms.From || 'N/A'}\n`;
            output += `내용: ${sms.body || sms.Body || 'N/A'}\n`;
            output += `상태: ${sms.status || sms.Status || 'N/A'}\n`;
            output += `발송 시간: ${sms.dateSent || sms.dateCreated || 'N/A'}\n`;
            if (sms.serviceName) {
                output += `서비스: ${sms.serviceName}\n`;
            }
            output += `\n`;
        });
    } else {
        // JSON 형식 출력
        output = JSON.stringify(smsData, null, 2);
    }

    // 콘솔에 출력
    console.log(output);

    // 파일로 저장
    if (options.output) {
        fs.writeFileSync(options.output, output, 'utf-8');
        console.log(`\n✅ 결과가 ${options.output}에 저장되었습니다.`);
    }
}

// Verify 정보와 메시지 로그 매칭
function matchVerifyWithMessages(verifySMS, messageLogs) {
    const matched = [];

    // 메시지 로그를 우선으로 사용 (SMS 내용 포함)
    for (const msg of messageLogs) {
        // 해당 메시지와 관련된 Verify 정보 찾기
        const relatedVerify = verifySMS.find(v => 
            v.to === msg.to && 
            Math.abs(new Date(v.dateCreated) - new Date(msg.dateSent)) < 60000 // 1분 이내
        );

        matched.push({
            type: 'message',
            sid: msg.sid,
            verificationSid: relatedVerify?.verificationSid,
            serviceName: relatedVerify?.serviceName,
            to: msg.to,
            from: msg.from,
            body: msg.body, // 실제 SMS 내용
            status: msg.status,
            dateSent: msg.dateSent,
            dateCreated: msg.dateCreated,
            direction: msg.direction
        });
    }

    // Verify만 있고 메시지 로그가 없는 경우 추가
    for (const verify of verifySMS) {
        const alreadyIncluded = matched.some(m => 
            m.verificationSid === verify.verificationSid ||
            (m.to === verify.to && 
             m.dateSent && 
             Math.abs(new Date(m.dateSent) - new Date(verify.dateCreated)) < 60000)
        );

        if (!alreadyIncluded) {
            matched.push({
                type: 'verify',
                verificationSid: verify.verificationSid,
                serviceName: verify.serviceName,
                serviceSid: verify.serviceSid,
                to: verify.to,
                status: verify.status,
                channel: verify.channel,
                dateCreated: verify.dateCreated,
                dateUpdated: verify.dateUpdated,
                body: null // Verify API는 body를 제공하지 않음
            });
        }
    }

    return matched;
}

// 메인 실행 함수
async function main() {
    loadEnv();
    const options = parseArgs();

    console.log('🚀 Twilio Verify SMS 크롤링 시작\n');
    console.log('옵션:', JSON.stringify(options, null, 2));
    console.log('');

    const client = initTwilioClient();

    try {
        // 메시지 로그에서 모든 SMS 조회 (Messaging 로그의 Body 확인)
        const messageLogs = await fetchMessageLogs(client, options);
        
        console.log(`✅ 메시지 로그: ${messageLogs.length}개 발견\n`);
        
        // Verify 서비스 정보도 가져오기 (선택적)
        let verifySMS = [];
        try {
            verifySMS = await fetchVerifySMS(client, options);
        } catch (verifyError) {
            console.log(`⚠️  Verify 서비스 조회 중 오류 (메시지 로그는 계속 조회): ${verifyError.message}\n`);
        }

        // Verify 정보와 메시지 로그 매칭 (Verify가 있는 경우에만)
        let matchedSMS = [];
        if (verifySMS.length > 0) {
            matchedSMS = matchVerifyWithMessages(verifySMS, messageLogs);
        } else {
            // Verify 정보가 없으면 메시지 로그만 사용
            matchedSMS = messageLogs.map(msg => ({
                type: 'message',
                sid: msg.sid,
                to: msg.to,
                from: msg.from,
                body: msg.body,
                status: msg.status,
                dateSent: msg.dateSent,
                dateCreated: msg.dateCreated,
                direction: msg.direction
            }));
        }

        // 중복 제거 (SID 기준)
        const uniqueSMS = matchedSMS.filter((sms, index, self) =>
            index === self.findIndex(s => 
                (s.sid || s.verificationSid) === (sms.sid || sms.verificationSid)
            )
        );

        // 발송 시간 기준 정렬 (최신순)
        uniqueSMS.sort((a, b) => {
            const dateA = new Date(a.dateSent || a.dateCreated || 0);
            const dateB = new Date(b.dateSent || b.dateCreated || 0);
            return dateB - dateA;
        });

        outputResults(uniqueSMS, options);

    } catch (error) {
        console.error('\n❌ 실행 중 오류 발생:', error);
        process.exit(1);
    }
}

// 스크립트 실행
main();

