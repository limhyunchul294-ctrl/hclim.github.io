# 모바일 PDF 뷰어 최적화 가이드

## ✅ 적용 완료
**옵션 1 + 3 조합** (모바일에서 새 창으로 열기 UI)이 코드에 적용되었습니다.

---

## 문제 상황
모바일 크롬 브라우저에서 iframe으로 PDF를 표시할 때 **1페이지만 보이는 현상**이 발생합니다.
이는 모바일 브라우저의 기본 PDF 뷰어가 iframe 내에서 제한적으로 작동하기 때문입니다.

## 해결 방법 옵션

### ✅ 옵션 1: 모바일에서 새 창으로 열기 (권장)
- **장점**: 가장 확실하고 간단한 방법
- **단점**: 사용자가 별도 창을 닫아야 함
- **적용 난이도**: ⭐ 쉬움

**구현 방법:**
```javascript
// 모바일 환경 감지
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

if (isMobile) {
    // 새 창으로 PDF 열기
    window.open(fileBlobUrl, '_blank');
} else {
    // 기존 iframe 방식 유지
}
```

---

### ✅ 옵션 2: 모바일용 iframe 최적화
- **장점**: 기존 UI 유지
- **단점**: 모든 모바일 브라우저에서 완벽하게 작동하지 않을 수 있음
- **적용 난이도**: ⭐⭐ 보통

**구현 방법:**
```javascript
// iframe에 모바일 최적화 속성 추가
<iframe 
    src="${fileBlobUrl}"
    class="w-full h-full"
    style="
        min-height: calc(100vh - 200px);
        height: 100vh;
        width: 100%;
        -webkit-overflow-scrolling: touch;
    "
    allowfullscreen
    scrolling="auto"
    seamless="seamless"
></iframe>
```

**추가 CSS:**
```css
@media (max-width: 768px) {
    iframe {
        height: calc(100vh - 100px) !important;
        min-height: 500px !important;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
    }
}
```

---

### ✅ 옵션 3: 모바일 전용 PDF 뷰어 UI
- **장점**: 모바일에서 최적화된 경험 제공
- **단점**: 개발 시간이 더 필요함
- **적용 난이도**: ⭐⭐⭐ 어려움

**구현 방법:**
1. 모바일 감지
2. "새 창에서 열기" 버튼 표시
3. 다운로드 버튼 강조
4. 간단한 안내 메시지 표시

```javascript
function pdfViewerHTML(fileBlobUrl, pageRange = null, title = '', fileName = '', bucketName = 'manual') {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
        return `
            <div class="pdf-viewer-container w-full h-full flex flex-col items-center justify-center p-4">
                <div class="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
                    <svg class="w-16 h-16 mx-auto mb-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 class="text-lg font-semibold text-gray-800 mb-2">${title}</h3>
                    <p class="text-gray-600 text-sm mb-6">모바일에서는 새 창에서 열어주세요.</p>
                    <div class="flex flex-col gap-3">
                        <button 
                            onclick="window.open('${fileBlobUrl}', '_blank')" 
                            class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                            새 창에서 열기
                        </button>
                        <button 
                            onclick="downloadSecureFile('${fileName}', '${bucketName}', ${downloadPageRange})"
                            class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                            PDF 다운로드
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 기존 iframe 코드...
}
```

---

### ✅ 옵션 4: 모바일에서 직접 다운로드
- **장점**: PDF를 기기에서 직접 볼 수 있음
- **단점**: 매번 다운로드해야 함
- **적용 난이도**: ⭐ 쉬움

**구현 방법:**
```javascript
if (isMobile) {
    // 자동으로 다운로드 시작
    const link = document.createElement('a');
    link.href = fileBlobUrl;
    link.download = fileName;
    link.click();
}
```

---

## 추천 구현 방법

### 🎯 **옵션 1 (새 창으로 열기) + 옵션 3 (UI 개선)** 조합

이 방법을 권장하는 이유:
1. ✅ 가장 확실하게 작동함
2. ✅ 사용자 경험이 명확함
3. ✅ 구현이 간단함
4. ✅ 모든 모바일 브라우저에서 호환됨

### 구현 예시:
```javascript
function pdfViewerHTML(fileBlobUrl, pageRange = null, title = '', fileName = '', bucketName = 'manual') {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const downloadPageRange = pageRange ? `[${pageRange[0]},${pageRange[1]}]` : 'null';
    
    if (isMobile) {
        return `
            <div class="pdf-viewer-container w-full h-full flex flex-col">
                <div class="flex items-center justify-between mb-3 px-1">
                    <h3 class="text-lg font-semibold text-gray-800">${title}</h3>
                </div>
                <div class="flex-1 border border-gray-300 rounded-lg overflow-auto bg-gray-50 flex items-center justify-center p-4" style="min-height: calc(100vh - 200px);">
                    <div class="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
                        <svg class="w-16 h-16 mx-auto mb-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 class="text-lg font-semibold text-gray-800 mb-2">모바일 환경 감지</h3>
                        <p class="text-gray-600 text-sm mb-6">모바일 브라우저에서는 새 창에서 열어주세요.</p>
                        <div class="flex flex-col gap-3">
                            <button 
                                onclick="window.open('${fileBlobUrl}', '_blank')" 
                                class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                                📄 새 창에서 열기
                            </button>
                            <button 
                                onclick="downloadSecureFile('${fileName}', '${bucketName}', ${downloadPageRange})"
                                class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
                                ⬇️ PDF 다운로드
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 데스크톱: 기존 iframe 방식
    return `
        <div class="pdf-viewer-container w-full h-full flex flex-col">
            <div class="flex items-center justify-between mb-3 px-1">
                <h3 class="text-lg font-semibold text-gray-800">${title}</h3>
                <div class="flex items-center gap-2">
                    <button class="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors" 
                            onclick="downloadSecureFile('${fileName}', '${bucketName}', ${downloadPageRange})">
                        다운로드
                    </button>
                </div>
            </div>
            <div class="flex-1 border border-gray-300 rounded-lg overflow-hidden bg-gray-50" style="min-height: calc(100vh - 200px);">
                <iframe src="${fileBlobUrl}" 
                        class="w-full h-full" 
                        frameborder="0"
                        style="min-height: 800px;"
                        allowfullscreen></iframe>
            </div>
        </div>
    `;
}
```

---

## 테스트 방법

1. **모바일 디바이스에서 직접 테스트**
   - 실제 모바일 기기로 접속
   - 크롬 브라우저 사용
   - PDF 문서 열기 시도

2. **Chrome DevTools로 모바일 시뮬레이션**
   - F12 키로 개발자 도구 열기
   - 디바이스 모드 활성화 (Ctrl+Shift+M)
   - 모바일 기기 선택 (iPhone, Galaxy 등)
   - 새로고침 후 테스트

3. **User Agent 변경**
   - Chrome 확장 프로그램 사용
   - 또는 개발자 도구에서 Network Conditions 변경

---

## 추가 개선 사항

### 1. 모바일 감지 개선
```javascript
// 더 정확한 모바일 감지
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
        || (window.innerWidth <= 768);
}
```

### 2. 터치 이벤트 감지
```javascript
// 터치 가능한 디바이스 감지
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
```

### 3. 사용자 선호도 저장
```javascript
// localStorage에 사용자 선택 저장
localStorage.setItem('preferMobilePDFView', 'newWindow'); // 또는 'download', 'iframe'
```

---

## 문제 해결

### Q: 새 창이 열리지 않아요
**A:** 팝업 차단 설정을 확인하세요. 또는 `window.open()` 대신 `<a>` 태그 사용:
```javascript
<a href="${fileBlobUrl}" target="_blank" rel="noopener noreferrer">PDF 열기</a>
```

### Q: 여전히 1페이지만 보여요
**A:** iframe 방식을 완전히 포기하고 옵션 1 또는 3을 사용하세요.

### Q: 모든 모바일 브라우저에서 테스트해야 하나요?
**A:** 주요 브라우저만 테스트:
- Chrome (Android)
- Safari (iOS)
- Samsung Internet (Android)

---

## 적용 상태

### ✅ 현재 적용된 방법
**옵션 1 + 3 조합** - 모바일에서 새 창으로 열기 UI

**작동 방식:**
1. 모바일 디바이스 감지 (User Agent 및 화면 크기 기준)
2. 모바일 환경: 친절한 UI와 함께 "새 창에서 열기" 및 "다운로드" 버튼 제공
3. 데스크톱 환경: 기존 iframe 방식 유지

**코드 위치:** `js/main.js` - `pdfViewerHTML()` 함수

---

## 추가 커스터마이징

다른 방식을 원하시면 다음과 같이 변경할 수 있습니다:

1. **자동으로 새 창 열기**: 모바일 감지 시 자동으로 `window.open()` 실행
2. **자동 다운로드**: 모바일 감지 시 자동으로 다운로드 시작
3. **iframe 강제 사용**: 모바일에서도 iframe 방식 사용 (비권장)
4. **사용자 선택 옵션**: 새 창/다운로드/iframe 중 선택할 수 있는 옵션 제공

필요하시면 알려주세요!

