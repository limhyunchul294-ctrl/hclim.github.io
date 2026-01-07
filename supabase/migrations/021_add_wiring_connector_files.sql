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
        -- 기존 wiring-1-4, wiring-1-5, wiring-1-6, wiring-1-7가 이미 있는지 확인 후 추가
        -- 슬라이딩 도어 와이어링
        INSERT INTO documents (id, file_name, bucket, title, type, category, created_at, updated_at)
        SELECT 
            'wiring-1-4',
            '슬라이딩 도어 와이어링.jpeg',
            'manual',
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
            '루프 와이어링.jpeg',
            'manual',
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
            '루프 익스텐션 와이어링.jpeg',
            'manual',
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
            '테일게이트 와이어링.jpeg',
            'manual',
            '테일게이트 와이어링',
            'image',
            '와이어링 커넥터',
            NOW(),
            NOW()
        WHERE NOT EXISTS (
            SELECT 1 FROM documents WHERE id = 'wiring-1-7'
        );

        RAISE NOTICE '와이어링 커넥터 파일 4개가 추가되었습니다.';
    ELSE
        RAISE NOTICE 'documents 테이블이 존재하지 않습니다. 테이블 생성이 필요합니다.';
    END IF;
END $$;

-- 추가된 데이터 확인
SELECT 
    id,
    file_name,
    bucket,
    title,
    type,
    category,
    created_at
FROM documents
WHERE id IN ('wiring-1-4', 'wiring-1-5', 'wiring-1-6', 'wiring-1-7')
ORDER BY id;
