-- 명함 이미지 Storage 버킷 RLS 정책 설정
-- 이 마이그레이션은 business_cards Storage 버킷에 대한 접근 권한을 설정합니다.

-- 1. Storage 버킷이 존재하는지 확인하고, 없으면 생성 (수동으로 생성해야 할 수도 있음)
-- 참고: Storage 버킷은 Supabase Dashboard에서 수동으로 생성해야 합니다.
-- 버킷 이름: business_cards
-- Public: false (인증된 사용자만 접근)

-- 2. Storage 버킷의 RLS 정책 설정
-- 인증된 사용자는 자신의 폴더에만 파일을 업로드/읽기/삭제할 수 있습니다.

-- 기존 정책 삭제 (있다면)
DO $$
BEGIN
    -- SELECT 정책 삭제
    DROP POLICY IF EXISTS "사용자는 자신의 명함 이미지를 조회할 수 있습니다" ON storage.objects;
    DROP POLICY IF EXISTS "사용자는 자신의 명함 이미지를 업로드할 수 있습니다" ON storage.objects;
    DROP POLICY IF EXISTS "사용자는 자신의 명함 이미지를 삭제할 수 있습니다" ON storage.objects;
    
    -- 기존 정책이 다른 이름으로 있을 수 있으므로 확인
    PERFORM 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname LIKE '%business_cards%';
    
    IF FOUND THEN
        -- business_cards 관련 모든 정책 삭제
        EXECUTE (
            SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON storage.objects;', ' ')
            FROM pg_policies 
            WHERE schemaname = 'storage' 
            AND tablename = 'objects' 
            AND policyname LIKE '%business_cards%'
        );
    END IF;
END $$;

-- SELECT 정책: 사용자는 자신의 명함 이미지를 조회할 수 있습니다
CREATE POLICY "사용자는 자신의 명함 이미지를 조회할 수 있습니다"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'business_cards' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- INSERT 정책: 사용자는 자신의 폴더에만 명함 이미지를 업로드할 수 있습니다
CREATE POLICY "사용자는 자신의 명함 이미지를 업로드할 수 있습니다"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'business_cards' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- UPDATE 정책: 사용자는 자신의 명함 이미지를 수정할 수 있습니다
CREATE POLICY "사용자는 자신의 명함 이미지를 수정할 수 있습니다"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'business_cards' 
    AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'business_cards' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- DELETE 정책: 사용자는 자신의 명함 이미지를 삭제할 수 있습니다
CREATE POLICY "사용자는 자신의 명함 이미지를 삭제할 수 있습니다"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'business_cards' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 정책 확인 쿼리
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname LIKE '%명함%'
ORDER BY policyname;

