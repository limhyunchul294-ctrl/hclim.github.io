-- MASADA 차량 보증 데이터 테이블
CREATE TABLE IF NOT EXISTS warranty_data (
  id BIGSERIAL PRIMARY KEY,
  vin VARCHAR(17) NOT NULL,
  model VARCHAR(100),
  year VARCHAR(10),
  release_date DATE,
  general_warranty_expiry DATE,
  general_warranty_km INTEGER,
  drivetrain_warranty_expiry DATE,
  drivetrain_warranty_km INTEGER,
  battery_warranty_expiry DATE,
  battery_warranty_km INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_warranty_vin ON warranty_data(vin);
CREATE INDEX IF NOT EXISTS idx_warranty_vin_last6 ON warranty_data(RIGHT(vin, 6));

ALTER TABLE warranty_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view warranty data"
ON warranty_data FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage warranty data"
ON warranty_data FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.role = 'admin')
  OR (SELECT role FROM public.users WHERE auth_user_id = auth.uid()) = 'admin'
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.users u WHERE u.auth_user_id = auth.uid() AND u.role = 'admin')
  OR (SELECT role FROM public.users WHERE auth_user_id = auth.uid()) = 'admin'
);

GRANT SELECT ON warranty_data TO authenticated;
GRANT ALL ON warranty_data TO authenticated;
GRANT SELECT ON warranty_data TO anon;
