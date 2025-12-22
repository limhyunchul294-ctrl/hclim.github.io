// js/securityUtils.js
// 보안 관련 유틸리티 함수

import DOMPurify from 'dompurify';

/**
 * HTML 이스케이프 함수
 * 텍스트를 HTML에 안전하게 삽입하기 위해 특수 문자를 이스케이프합니다
 */
export function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * DOMPurify를 사용하여 HTML 정화
 * 사용자 입력을 HTML로 렌더링할 때 XSS 공격을 방지합니다
 * @param {string} dirty - 정화할 HTML 문자열
 * @param {object} options - DOMPurify 옵션
 * @returns {string} 정화된 HTML 문자열
 */
export function sanitizeHtml(dirty, options = {}) {
    if (!dirty) return '';
    
    // 기본 옵션 (Markdown 콘텐츠를 위한 허용 태그)
    const defaultOptions = {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 'b', 'i',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li',
            'a', 'img',
            'blockquote', 'code', 'pre',
            'hr', 'div', 'span'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
        ALLOW_DATA_ATTR: false
    };
    
    const sanitizeOptions = { ...defaultOptions, ...options };
    return DOMPurify.sanitize(dirty, sanitizeOptions);
}

/**
 * Markdown을 파싱한 후 HTML 정화
 * marked 라이브러리로 파싱한 후 DOMPurify로 정화합니다
 * @param {string} markdown - Markdown 문자열
 * @returns {string} 정화된 HTML 문자열
 */
export function parseAndSanitizeMarkdown(markdown) {
    if (!markdown) return '';
    
    // marked 라이브러리 확인
    let parsedHtml = '';
    if (typeof marked !== 'undefined' && marked && marked.parse) {
        parsedHtml = marked.parse(markdown);
    } else if (window.marked && window.marked.parse) {
        parsedHtml = window.marked.parse(markdown);
    } else {
        // marked가 없으면 기본 이스케이프 처리
        return escapeHtml(markdown)
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }
    
    // DOMPurify로 정화
    return sanitizeHtml(parsedHtml);
}

/**
 * 입력 검증 유틸리티
 */
export const validators = {
    /**
     * 게시글 제목 검증
     */
    title: (title) => {
        if (!title || typeof title !== 'string') {
            return { valid: false, error: '제목을 입력해주세요.' };
        }
        
        const trimmed = title.trim();
        if (trimmed.length === 0) {
            return { valid: false, error: '제목을 입력해주세요.' };
        }
        
        if (trimmed.length > 255) {
            return { valid: false, error: '제목은 255자 이하여야 합니다.' };
        }
        
        return { valid: true };
    },
    
    /**
     * 게시글/댓글 내용 검증
     */
    content: (content, maxLength = 10000) => {
        if (!content || typeof content !== 'string') {
            return { valid: false, error: '내용을 입력해주세요.' };
        }
        
        const trimmed = content.trim();
        if (trimmed.length === 0) {
            return { valid: false, error: '내용을 입력해주세요.' };
        }
        
        if (trimmed.length > maxLength) {
            return { valid: false, error: `내용은 ${maxLength.toLocaleString()}자 이하여야 합니다.` };
        }
        
        return { valid: true };
    },
    
    /**
     * 카테고리 검증
     */
    category: (category, allowedCategories = ['일반', '중요', '업데이트', '질문', '정보', '공유']) => {
        if (!category || typeof category !== 'string') {
            return { valid: false, error: '카테고리를 선택해주세요.' };
        }
        
        if (!allowedCategories.includes(category)) {
            return { valid: false, error: `허용되지 않은 카테고리입니다. (${allowedCategories.join(', ')})` };
        }
        
        return { valid: true };
    }
};

console.log('✅ 보안 유틸리티 로드 완료');

