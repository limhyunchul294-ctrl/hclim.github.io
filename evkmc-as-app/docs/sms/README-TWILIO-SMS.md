# Twilio Verify SMS 크롤링 가이드

Twilio Monitor에서 Verify 서비스로 발송된 SMS 내용을 크롤링하는 방법입니다.

## 📋 사전 준비

### 1. Twilio SDK 설치

```bash
npm install
```

또는

```bash
cd evkmc-as-app
npm install twilio
```

### 2. Twilio API 자격 증명 설정

Twilio Console (https://console.twilio.com)에서 다음 정보를 확인합니다:

- **Account SID**: 계정 SID
- **Auth Token**: 인증 토큰

#### 방법 1: .env 파일 사용 (권장)

`evkmc-as-app` 폴더에 `.env` 파일을 생성하고 다음 내용을 추가합니다:

```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
```

`.env.example` 파일을 참고하세요.

#### 방법 2: 환경 변수로 설정

**Windows PowerShell:**
```powershell
$env:TWILIO_ACCOUNT_SID="your_account_sid_here"
$env:TWILIO_AUTH_TOKEN="your_auth_token_here"
```

**Windows CMD:**
```cmd
set TWILIO_ACCOUNT_SID=your_account_sid_here
set TWILIO_AUTH_TOKEN=your_auth_token_here
```

**Linux/Mac:**
```bash
export TWILIO_ACCOUNT_SID=your_account_sid_here
export TWILIO_AUTH_TOKEN=your_auth_token_here
```

## 🚀 사용 방법

### 기본 사용법

가장 최근 100개의 SMS를 조회합니다:

```bash
node scripts/fetch-twilio-sms.js
```

### 옵션

| 옵션 | 설명 | 예제 |
|------|------|------|
| `--limit N` | 최대 N개 메시지 조회 (기본값: 100) | `--limit 50` |
| `--since DATE` | 시작 날짜 (YYYY-MM-DD) | `--since 2024-01-01` |
| `--until DATE` | 종료 날짜 (YYYY-MM-DD) | `--until 2024-01-31` |
| `--to PHONE` | 특정 전화번호로 필터링 | `--to +821012345678` |
| `--output FILE` | 결과를 파일로 저장 | `--output sms-log.json` |
| `--format FORMAT` | 출력 형식 (json 또는 text) | `--format text` |
| `--help` | 도움말 표시 | `--help` |

### 사용 예제

#### 1. 최근 50개 SMS 조회

```bash
node scripts/fetch-twilio-sms.js --limit 50
```

#### 2. 특정 기간의 SMS 조회

```bash
node scripts/fetch-twilio-sms.js --since 2024-01-01 --until 2024-01-31
```

#### 3. 특정 번호로 발송된 SMS 조회

```bash
node scripts/fetch-twilio-sms.js --to +821012345678
```

#### 4. 텍스트 형식으로 출력

```bash
node scripts/fetch-twilio-sms.js --format text
```

#### 5. JSON 파일로 저장

```bash
node scripts/fetch-twilio-sms.js --output sms-log.json
```

#### 6. 여러 옵션 조합

```bash
node scripts/fetch-twilio-sms.js \
  --since 2024-01-01 \
  --until 2024-01-31 \
  --limit 200 \
  --format text \
  --output january-sms.txt
```

## 📤 출력 형식

### JSON 형식 (기본값)

```json
[
  {
    "type": "message",
    "sid": "SM1234567890abcdef",
    "to": "+821012345678",
    "from": "+1234567890",
    "body": "Your verification code is 123456",
    "status": "delivered",
    "dateSent": "2024-01-15T10:30:00Z",
    "dateCreated": "2024-01-15T10:29:55Z",
    "direction": "outbound-api"
  }
]
```

### 텍스트 형식

```
[1] SMS 정보
==================================================
전화번호: +821012345678
발신자: +1234567890
내용: Your verification code is 123456
상태: delivered
발송 시간: 2024-01-15T10:30:00Z
서비스: Default Verify Service
```

## 🔍 작동 원리

이 스크립트는 다음 두 가지 방법으로 SMS를 조회합니다:

1. **Verify API**: Twilio Verify 서비스의 인증 시도 기록을 조회합니다.
2. **Messages API**: Twilio Messages 로그에서 Verify 관련 메시지를 필터링하여 조회합니다.

두 결과를 합쳐서 중복을 제거하고 최신순으로 정렬하여 반환합니다.

## ⚠️ 주의사항

1. **Trial 계정 제한**: Trial 계정은 일일 메시지 수가 제한될 수 있습니다.
2. **API 레이트 리밋**: 너무 많은 요청을 보내면 API 레이트 리밋에 걸릴 수 있습니다.
3. **보안**: `.env` 파일은 절대 Git에 커밋하지 마세요. `.gitignore`에 추가되어 있습니다.
4. **SMS 내용**: Twilio Verify API는 직접적인 SMS 내용을 제공하지 않을 수 있습니다. 이 경우 Messages API를 통해 내용을 확인합니다.

## 🐛 문제 해결

### "환경 변수가 필요합니다" 오류

`.env` 파일이 올바르게 설정되었는지 확인하세요:

```bash
# .env 파일 확인
cat .env

# 또는 PowerShell에서
Get-Content .env
```

### "Verify 서비스를 찾을 수 없습니다" 오류

Twilio Console에서 Verify 서비스가 활성화되어 있는지 확인하세요:
- https://console.twilio.com/us1/develop/verify/services

### "권한이 없습니다" 오류

API 자격 증명이 올바른지 확인하세요:
- Account SID와 Auth Token이 정확한지
- 계정이 활성화되어 있는지

## 📚 추가 리소스

- [Twilio API 문서](https://www.twilio.com/docs/verify/api)
- [Twilio Node.js SDK](https://www.twilio.com/docs/libraries/node)
- [Twilio Console](https://console.twilio.com)


