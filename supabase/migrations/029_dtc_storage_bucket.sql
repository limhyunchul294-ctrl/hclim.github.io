-- DTC 정비 도면 Storage 버킷 및 RLS
-- Dashboard에서 버킷이 없으면 이 마이그레이션으로 생성됩니다.

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('dtc', 'dtc', false, 52428800)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = 52428800;

DROP POLICY IF EXISTS "Authenticated users can read DTC diagrams" ON storage.objects;

CREATE POLICY "Authenticated users can read DTC diagrams"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'dtc');
