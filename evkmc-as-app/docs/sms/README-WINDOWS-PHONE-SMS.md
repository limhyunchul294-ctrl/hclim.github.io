# Windows 휴대폰 연결을 활용한 SMS 전송 가이드

Windows의 "휴대폰과 연결" 기능을 활용하여 Twilio SMS 내용을 안드로이드 스마트폰으로 전송하는 방법입니다.

## ⚠️ 중요 사항

**Windows Phone Link는 직접적인 프로그래밍 API를 제공하지 않습니다.**

대신 안드로이드 스마트폰의 **SMS Gateway 서버 앱**을 활용하여 SMS를 전송할 수 있습니다.

## 🎯 추천 방법: SMS Gateway 서버 앱

### 개념

1. **안드로이드 스마트폰**에 SMS Gateway 서버 앱 설치
2. 앱이 HTTP API 서버로 동작
3. **Windows PC**에서 HTTP 요청으로 SMS 전송
4. 안드로이드 폰이 실제 SMS로 전송

### 장점

- ✅ 완전 무료
- ✅ 실제 SMS 전송 (안드로이드 폰의 SMS 기능 활용)
- ✅ Windows Phone Link와 동일한 번호로 발송 가능
- ✅ 프로그래밍 가능한 API 제공

### 단점

- ⚠️ 안드로이드 폰이 항상 켜져있어야 함
- ⚠️ PC와 안드로이드 폰이 같은 네트워크(WiFi)에 연결되어야 함

## 📱 설정 방법

### 1단계: 안드로이드 SMS Gateway 앱 설치

#### 추천 앱

1. **SMS Gateway Server** (Play Store)
   - 검색어: "SMS Gateway Server"
   - 개발자: 다양한 버전 있음

2. **SMS Gateway API** (Play Store)
   - 검색어: "SMS Gateway API"
   - HTTP API 서버 제공

3. **Tasker** (고급 사용자용)
   - 더 복잡하지만 강력한 자동화 기능
   - HTTP 요청 수신 시 SMS 전송 프로필 설정 가능

### 2단계: SMS Gateway 앱 설정

#### 일반적인 설정 과정:

1. **앱 실행**
2. **HTTP API 서버 활성화**
   - 포트 설정 (예: 8080)
   - API 키 설정 (선택사항, 보안 강화)

3. **IP 주소 확인**
   - 앱 화면에서 표시되는 IP 주소 확인
   - 예: `192.168.0.100:8080`
   - 또는 `http://192.168.0.100:8080`

4. **권한 부여**
   - SMS 전송 권한 허용
   - 네트워크 접근 권한 허용

### 3단계: Windows PC와 안드로이드 폰 연결 확인

1. **같은 WiFi 네트워크에 연결**
   - PC와 안드로이드 폰이 같은 WiFi에 연결되어 있어야 합니다

2. **방화벽 설정**
   - Windows 방화벽에서 해당 포트 허용 (필요시)
   - 안드로이드 폰의 방화벽 설정 확인

3. **IP 주소 테스트**
   - Windows PC의 브라우저에서 `http://192.168.0.100:8080` 접속 확인
   - API 문서나 상태 페이지가 표시되면 성공

### 4단계: .env 파일 설정

`evkmc-as-app` 폴더의 `.env` 파일에 다음 내용 추가:

```env
# SMS Gateway 설정
SMS_GATEWAY_URL=http://192.168.0.100:8080
SMS_GATEWAY_API_KEY=your_api_key  # 선택사항 (앱에서 설정한 경우)
```

**주의:**
- `192.168.0.100`을 실제 안드로이드 폰의 IP 주소로 변경하세요
- 포트 번호도 앱에서 설정한 값으로 변경하세요

### 5단계: 사용

```bash
cd evkmc-as-app
node scripts/windows-phone-sms.js --channel gateway --phone +821012345678
```

## 🔧 상세 설정 (SMS Gateway Server 앱 예시)

### API 엔드포인트

대부분의 SMS Gateway 앱은 다음과 같은 API를 제공합니다:

#### SMS 전송 API

```
POST http://192.168.0.100:8080/send
Content-Type: application/json

{
  "phone": "01012345678",
  "message": "메시지 내용"
}
```

#### 응답 예시

```json
{
  "success": true,
  "messageId": "1234567890"
}
```

### 커스텀 설정이 필요한 경우

앱마다 API 형식이 다를 수 있습니다. `scripts/windows-phone-sms.js` 파일의 `sendSMSViaGateway` 함수를 수정하여 맞춤 설정할 수 있습니다.

## 🌐 외부 네트워크 접근 (고급)

같은 WiFi 네트워크가 아닌 경우:

### 방법 1: VPN 사용
- PC와 안드로이드 폰을 VPN으로 연결

### 방법 2: 포트 포워딩
- 라우터에서 포트 포워딩 설정 (보안 주의)

### 방법 3: 동적 DNS + 포트 포워딩
- 외부에서도 접근 가능하도록 설정 (보안 매우 주의)

**⚠️ 보안 경고:** 외부에서 접근 가능하게 설정하면 인증을 반드시 설정하세요.

## 📋 대안: Microsoft Teams 알림

Windows Phone Link 대신 Microsoft Teams를 통해 알림을 받는 방법도 있습니다.

### 설정 방법

1. **Azure AD 앱 등록**
   - Azure Portal → 앱 등록 → 새 등록
   - API 권한: `ChatMessage.Send`

2. **Teams 채팅방 ID 확인**
   - Teams 웹에서 채팅방 URL 확인
   - 또는 Graph API로 채팅방 목록 조회

3. **.env 파일 설정**

```env
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret
MICROSOFT_TENANT_ID=your_tenant_id
MICROSOFT_TEAMS_CHAT_ID=your_chat_id
```

4. **사용**

```bash
node scripts/windows-phone-sms.js --channel teams --phone +821012345678
```

## 🔍 문제 해결

### "SMS Gateway 서버에 연결할 수 없습니다" 오류

**원인:**
1. 안드로이드 폰과 PC가 다른 WiFi에 연결됨
2. IP 주소가 잘못됨
3. 포트 번호가 잘못됨
4. 방화벽이 차단함
5. SMS Gateway 앱이 실행되지 않음

**해결:**
1. 같은 WiFi 네트워크에 연결 확인
2. 안드로이드 폰의 IP 주소 다시 확인 (WiFi 설정 → 네트워크 정보)
3. SMS Gateway 앱이 실행 중인지 확인
4. 브라우저에서 `http://[IP]:[PORT]` 접속 테스트

### "SMS 전송 실패" 오류

**원인:**
1. API 형식이 잘못됨
2. 인증 키가 잘못됨
3. 전화번호 형식 오류

**해결:**
1. SMS Gateway 앱의 API 문서 확인
2. API 키 재설정
3. 전화번호 형식 확인 (01012345678 또는 +821012345678)

## 📱 추천 SMS Gateway 앱 목록

1. **SMS Gateway Server** (무료)
   - 간단한 HTTP API 제공
   - Play Store에서 검색 가능

2. **SMS Gateway API** (무료/유료)
   - 다양한 API 옵션
   - 인증 지원

3. **Tasker** (유료, 고급)
   - 완전한 자동화 가능
   - HTTP 요청 수신 → SMS 전송 프로필 설정

## 💡 사용 시나리오

### 시나리오 1: 로그인 알림

1. 사용자가 로그인 시도
2. Twilio로 OTP SMS 발송
3. SMS Gateway를 통해 관리자 휴대폰으로도 동일 내용 전송
4. 관리자가 로그인 시도 내역 실시간 확인

### 시나리오 2: 백업 알림

1. Twilio SMS 발송
2. Telegram으로 알림 (주 알림)
3. SMS Gateway로도 전송 (백업, 실제 SMS)

## 🔐 보안 고려사항

1. **API 키 사용**: SMS Gateway 앱에서 API 키를 설정하면 보안 강화
2. **HTTPS 사용**: 가능한 경우 HTTPS로 설정 (Let's Encrypt 등)
3. **방화벽**: 외부 접근이 불필요한 경우 방화벽으로 차단
4. **IP 화이트리스트**: 특정 IP에서만 접근 허용 (고급 설정)

## 📚 참고 자료

- [Windows Phone Link 설정](https://support.microsoft.com/ko-kr/topic/pc%EC%97%90%EC%84%9C-%EB%AC%B8%EC%9E%90-%EB%A9%94%EC%8B%9C%EC%A7%80-%EB%B3%B4%EB%82%B4%EA%B8%B0-%EB%B0%8F-%EB%B0%9B%EA%B8%B0-43189e43-8121-35f6-7930-db095bf938a4)
- [Microsoft Graph API](https://learn.microsoft.com/ko-kr/graph/overview)
- [Tasker 자동화 가이드](https://tasker.joaoapps.com/)

