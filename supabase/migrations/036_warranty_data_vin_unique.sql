-- warranty_data: VIN 유니크 제약(upsert onConflict) 및 수정 시 updated_at 갱신

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'warranty_data_vin_key'
  ) THEN
    ALTER TABLE public.warranty_data
      ADD CONSTRAINT warranty_data_vin_key UNIQUE (vin);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.warranty_data_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_warranty_data_updated_at ON public.warranty_data;
CREATE TRIGGER trg_warranty_data_updated_at
  BEFORE UPDATE ON public.warranty_data
  FOR EACH ROW
  EXECUTE FUNCTION public.warranty_data_set_updated_at();
