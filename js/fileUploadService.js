// js/fileUploadService.js
// 파일 업로드 서비스

window.fileUploadService = {
    // 업로드 제한 설정
    UPLOAD_LIMITS: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        maxFilesPerPost: 5, // 게시글당 최대 5개 파일
        allowedTypes: [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/zip',
            'text/plain'
        ]
    },

    /**
     * 파일 검증
     * @param {File} file - 업로드할 파일
     * @returns {Object} { valid: boolean, error: string }
     */
    validateFile(file) {
        // 파일 크기 검증
        if (file.size > this.UPLOAD_LIMITS.maxFileSize) {
            return {
                valid: false,
                error: `파일 크기는 ${this.UPLOAD_LIMITS.maxFileSize / 1024 / 1024}MB를 초과할 수 없습니다.`
            };
        }

        // 파일 형식 검증
        if (!this.UPLOAD_LIMITS.allowedTypes.includes(file.type)) {
            return {
                valid: false,
                error: '허용되지 않은 파일 형식입니다. PDF, 이미지, 문서 파일만 업로드 가능합니다.'
            };
        }

        return { valid: true };
    },

    /**
     * 파일 업로드
     * @param {File} file - 업로드할 파일
     * @param {string} bucket - Storage 버킷 이름
     * @param {string} folder - 폴더 경로 (예: 'notices/123', 'community/456')
     * @returns {Promise<string>} Public URL
     */
    async uploadFile(file, bucket, folder) {
        try {
            // 파일 검증
            const validation = this.validateFile(file);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            if (!window.supabaseClient) {
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다');
            }

            // 파일명 생성 (중복 방지: 타임스탬프 + 원본 파일명)
            const timestamp = Date.now();
            const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
            const fileName = `${timestamp}-${sanitizedFileName}`;
            const filePath = `${folder}/${fileName}`;

            // Supabase Storage에 업로드
            const { data, error } = await window.supabaseClient
                .storage
                .from(bucket)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                throw error;
            }

            // Public URL 생성
            const { data: { publicUrl } } = window.supabaseClient
                .storage
                .from(bucket)
                .getPublicUrl(filePath);

            console.log('✅ 파일 업로드 성공:', publicUrl);
            return {
                url: publicUrl,
                path: filePath,
                name: file.name,
                size: file.size,
                type: file.type
            };

        } catch (error) {
            console.error('❌ 파일 업로드 오류:', error);
            throw error;
        }
    },

    /**
     * 여러 파일 업로드
     * @param {FileList|File[]} files - 업로드할 파일 목록
     * @param {string} bucket - Storage 버킷 이름
     * @param {string} folder - 폴더 경로
     * @returns {Promise<Array>} 업로드된 파일 정보 배열
     */
    async uploadFiles(files, bucket, folder) {
        // 파일 개수 검증
        if (files.length > this.UPLOAD_LIMITS.maxFilesPerPost) {
            throw new Error(`최대 ${this.UPLOAD_LIMITS.maxFilesPerPost}개까지 업로드 가능합니다.`);
        }

        const uploadPromises = Array.from(files).map(file => 
            this.uploadFile(file, bucket, folder)
        );

        try {
            const results = await Promise.all(uploadPromises);
            return results;
        } catch (error) {
            console.error('❌ 여러 파일 업로드 오류:', error);
            throw error;
        }
    },

    /**
     * 파일 삭제
     * @param {string} bucket - Storage 버킷 이름
     * @param {string} filePath - 파일 경로
     */
    async deleteFile(bucket, filePath) {
        try {
            if (!window.supabaseClient) {
                throw new Error('Supabase 클라이언트가 초기화되지 않았습니다');
            }

            const { error } = await window.supabaseClient
                .storage
                .from(bucket)
                .remove([filePath]);

            if (error) {
                throw error;
            }

            console.log('✅ 파일 삭제 성공:', filePath);
            return { success: true };

        } catch (error) {
            console.error('❌ 파일 삭제 오류:', error);
            throw error;
        }
    },

    /**
     * 파일 크기 포맷팅
     * @param {number} bytes - 파일 크기 (바이트)
     * @returns {string} 포맷된 크기 문자열
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },

    /**
     * 파일 아이콘 가져오기
     * @param {string} mimeType - MIME 타입
     * @returns {string} SVG 아이콘
     */
    getFileIcon(mimeType) {
        if (mimeType.startsWith('image/')) {
            return '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
        } else if (mimeType === 'application/pdf') {
            return '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>';
        } else if (mimeType.includes('word') || mimeType.includes('document')) {
            return '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>';
        } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
            return '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>';
        } else {
            return '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>';
        }
    }
};

console.log('✅ 파일 업로드 서비스 초기화 완료');

