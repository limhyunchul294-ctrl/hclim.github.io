-- 와이어링 커넥터 파일 추가 (슬라이딩 도어, 루프, 루프 익스텐션, 테일게이트)
-- 실행 방법: Supabase Dashboard > SQL Editor에서 실행
-- 또는 Supabase CLI: supabase migration up

-- documents 테이블이 존재하는 경우에만 실행
DO $$
BEGIN
    -- documents 테이블 존재 여부 확인
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'documents'
    ) THEN
        -- 기존 wiring-1-1, wiring-1-2, wiring-1-3 업데이트 (버킷 및 파일명 변경)
        UPDATE documents
        SET 
            file_name = 'Main wiring.jpeg',
            bucket = 'wiring_diagrams',
            updated_at = NOW()
        WHERE id = 'wiring-1-1' AND (bucket != 'wiring_diagrams' OR file_name != 'Main wiring.jpeg');

        UPDATE documents
        SET 
            file_name = 'Chassis wiring.jpeg',
            bucket = 'wiring_diagrams',
            updated_at = NOW()
        WHERE id = 'wiring-1-2' AND (bucket != 'wiring_diagrams' OR file_name != 'Chassis wiring.jpeg');

        UPDATE documents
        SET 
            file_name = 'Door wiring.jpeg',
            bucket = 'wiring_diagrams',
            updated_at = NOW()
        WHERE id = 'wiring-1-3' AND (bucket != 'wiring_diagrams' OR file_name != 'Door wiring.jpeg');

        -- 새 파일 wiring-1-4, wiring-1-5, wiring-1-6, wiring-1-7 추가
        -- 슬라이딩 도어 와이어링
        INSERT INTO documents (id, file_name, bucket, title, type, category, created_at, updated_at)
        SELECT 
            'wiring-1-4',
            'Sliding Door wiring.jpeg',
            'wiring_diagrams',
            '슬라이딩 도어 와이어링',
            'image',
            '와이어링 커넥터',
            NOW(),
            NOW()
        WHERE NOT EXISTS (
            SELECT 1 FROM documents WHERE id = 'wiring-1-4'
        );

        -- 루프 와이어링
        INSERT INTO documents (id, file_name, bucket, title, type, category, created_at, updated_at)
        SELECT 
            'wiring-1-5',
            'Roof wiring.jpeg',
            'wiring_diagrams',
            '루프 와이어링',
            'image',
            '와이어링 커넥터',
            NOW(),
            NOW()
        WHERE NOT EXISTS (
            SELECT 1 FROM documents WHERE id = 'wiring-1-5'
        );

        -- 루프 익스텐션 와이어링
        INSERT INTO documents (id, file_name, bucket, title, type, category, created_at, updated_at)
        SELECT 
            'wiring-1-6',
            'Roof Extention wiring.jpeg',
            'wiring_diagrams',
            '루프 익스텐션 와이어링',
            'image',
            '와이어링 커넥터',
            NOW(),
            NOW()
        WHERE NOT EXISTS (
            SELECT 1 FROM documents WHERE id = 'wiring-1-6'
        );

        -- 테일게이트 와이어링
        INSERT INTO documents (id, file_name, bucket, title, type, category, created_at, updated_at)
        SELECT 
            'wiring-1-7',
            'Tailgate wiring.jpeg',
            'wiring_diagrams',
            '테일게이트 와이어링',
            'image',
            '와이어링 커넥터',
            NOW(),
            NOW()
        WHERE NOT EXISTS (
            SELECT 1 FROM documents WHERE id = 'wiring-1-7'
        );

        RAISE NOTICE '와이어링 커넥터 파일 4개가 추가되었습니다.';
        
        -- 추가된 데이터 확인 (테이블이 존재하는 경우에만)
        PERFORM 1 FROM documents WHERE id IN ('wiring-1-4', 'wiring-1-5', 'wiring-1-6', 'wiring-1-7');
        IF FOUND THEN
            RAISE NOTICE '와이어링 커넥터 파일이 성공적으로 추가되었습니다.';
        END IF;
    ELSE
        RAISE NOTICE 'documents 테이블이 존재하지 않습니다.';
        RAISE NOTICE '이 프로젝트는 JavaScript의 PDF_MAPPING 객체에서 파일을 직접 관리합니다.';
        RAISE NOTICE 'js/main.js 파일의 PDF_MAPPING에 이미 모든 와이어링 파일이 정의되어 있습니다.';
    END IF;
END $$;
