-- Phase A–C: TSB bulletin, DTC cross-ref, SM version, field notes, ETM anchors

-- TSB bulletins
CREATE TABLE IF NOT EXISTS public.tsb_bulletins (
    id BIGSERIAL PRIMARY KEY,
    bulletin_no TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT,
    published_at DATE,
    models TEXT[] DEFAULT '{}',
    symptoms TEXT[] DEFAULT '{}',
    related_dtc_codes TEXT[] DEFAULT '{}',
    must_read_before_repair BOOLEAN NOT NULL DEFAULT false,
    storage_bucket TEXT DEFAULT 'tsb_documents',
    storage_path TEXT,
    tree_node_id TEXT,
    min_grade TEXT NOT NULL DEFAULT 'blue' CHECK (min_grade IN ('blue', 'silver', 'black')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tsb_bulletins_published ON public.tsb_bulletins (published_at DESC);
CREATE INDEX IF NOT EXISTS idx_tsb_bulletins_active ON public.tsb_bulletins (is_active) WHERE is_active;

ALTER TABLE public.tsb_bulletins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tsb_bulletins_select ON public.tsb_bulletins;
CREATE POLICY tsb_bulletins_select ON public.tsb_bulletins
    FOR SELECT TO authenticated USING (is_active = true);

DROP POLICY IF EXISTS tsb_bulletins_admin_all ON public.tsb_bulletins;
CREATE POLICY tsb_bulletins_admin_all ON public.tsb_bulletins
    FOR ALL TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- DTC cross references
CREATE TABLE IF NOT EXISTS public.dtc_cross_refs (
    id BIGSERIAL PRIMARY KEY,
    dtc_code TEXT NOT NULL,
    ref_type TEXT NOT NULL CHECK (ref_type IN ('sm', 'tsb', 'etm', 'wiring')),
    label TEXT NOT NULL,
    href TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    min_grade TEXT NOT NULL DEFAULT 'blue' CHECK (min_grade IN ('blue', 'silver', 'black')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dtc_cross_refs_code ON public.dtc_cross_refs (dtc_code);

ALTER TABLE public.dtc_cross_refs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS dtc_cross_refs_select ON public.dtc_cross_refs;
CREATE POLICY dtc_cross_refs_select ON public.dtc_cross_refs
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS dtc_cross_refs_admin ON public.dtc_cross_refs;
CREATE POLICY dtc_cross_refs_admin ON public.dtc_cross_refs
    FOR ALL TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- Manual document versions (SM / ETM meta)
CREATE TABLE IF NOT EXISTS public.manual_documents (
    id BIGSERIAL PRIMARY KEY,
    doc_key TEXT NOT NULL UNIQUE,
    doc_category TEXT NOT NULL CHECK (doc_category IN ('sm', 'etm', 'wiring')),
    title TEXT NOT NULL,
    model_key TEXT,
    version_label TEXT NOT NULL DEFAULT '1.0',
    effective_date DATE,
    change_summary TEXT,
    supersedes_label TEXT,
    min_grade TEXT NOT NULL DEFAULT 'blue' CHECK (min_grade IN ('blue', 'silver', 'black')),
    storage_bucket TEXT,
    storage_path TEXT,
    is_current BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_manual_documents_key ON public.manual_documents (doc_key);

ALTER TABLE public.manual_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS manual_documents_select ON public.manual_documents;
CREATE POLICY manual_documents_select ON public.manual_documents
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS manual_documents_admin ON public.manual_documents;
CREATE POLICY manual_documents_admin ON public.manual_documents
    FOR ALL TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- Field tech notes (KB)
CREATE TABLE IF NOT EXISTS public.field_tech_notes (
    id BIGSERIAL PRIMARY KEY,
    author_user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    dtc_code TEXT,
    vin_masked TEXT,
    model_key TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by UUID REFERENCES auth.users (id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_field_tech_notes_status ON public.field_tech_notes (status, created_at DESC);

ALTER TABLE public.field_tech_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS field_tech_notes_select ON public.field_tech_notes;
CREATE POLICY field_tech_notes_select ON public.field_tech_notes
    FOR SELECT TO authenticated
    USING (status = 'approved' OR author_user_id = auth.uid() OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS field_tech_notes_insert ON public.field_tech_notes;
CREATE POLICY field_tech_notes_insert ON public.field_tech_notes
    FOR INSERT TO authenticated
    WITH CHECK (author_user_id = auth.uid());

DROP POLICY IF EXISTS field_tech_notes_update_own ON public.field_tech_notes;
CREATE POLICY field_tech_notes_update_own ON public.field_tech_notes
    FOR UPDATE TO authenticated
    USING (author_user_id = auth.uid() AND status = 'pending')
    WITH CHECK (author_user_id = auth.uid() AND status = 'pending');

DROP POLICY IF EXISTS field_tech_notes_admin ON public.field_tech_notes;
CREATE POLICY field_tech_notes_admin ON public.field_tech_notes
    FOR ALL TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- ETM page anchors (deep links)
CREATE TABLE IF NOT EXISTS public.etm_page_anchors (
    id BIGSERIAL PRIMARY KEY,
    etm_node_id TEXT NOT NULL,
    anchor_label TEXT NOT NULL,
    page_number INT NOT NULL,
    connector_code TEXT,
    related_dtc_code TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_etm_page_anchors_node ON public.etm_page_anchors (etm_node_id);

ALTER TABLE public.etm_page_anchors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS etm_page_anchors_select ON public.etm_page_anchors;
CREATE POLICY etm_page_anchors_select ON public.etm_page_anchors
    FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS etm_page_anchors_admin ON public.etm_page_anchors;
CREATE POLICY etm_page_anchors_admin ON public.etm_page_anchors
    FOR ALL TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));

-- Seed TSB (existing PDF tree nodes)
INSERT INTO public.tsb_bulletins (bulletin_no, title, summary, published_at, models, tree_node_id, storage_bucket, storage_path, must_read_before_repair)
VALUES
    ('TSB-001', 'TSB_EVKMC_001', '기술 회람 001', '2022-11-09', ARRAY['masada-2van','masada-4van','masada-cargo'], 'tsb-1', 'tsb_documents', 'TSB_EVKMC_001_221109.pdf', false),
    ('TSB-002', 'TSB_EVKMC_002', '기술 회람 002', '2023-10-19', ARRAY['masada-2van','masada-4van'], 'tsb-2', 'tsb_documents', 'TSB_EVKMC_002_231019.pdf', false),
    ('TSB-003', 'TSB_EVKMC_003', '기술 회람 003', '2022-08-22', ARRAY['masada-qq'], 'tsb-3', 'tsb_documents', 'TSB_EVKMC_003_220822.pdf', false),
    ('TSB-004', 'TSB_EVKMC_004', '기술 회람 004', '2023-04-20', ARRAY['masada-2van'], 'tsb-4', 'tsb_documents', 'TSB_EVKMC_004_230420.pdf', true),
    ('TSB-005', 'TSB_EVKMC_005', '기술 회람 005', '2023-04-27', ARRAY['masada-2van','masada-4van'], 'tsb-5', 'tsb_documents', 'TSB_EVKMC_005_230427.pdf', false),
    ('TSB-006', 'TSB_EVKMC_006', '기술 회람 006', '2023-04-27', ARRAY['masada-cargo'], 'tsb-6', 'tsb_documents', 'TSB_EVKMC_006_230427.pdf', false),
    ('TSB-007', 'TSB_EVKMC_007', '고전압 안전 관련', '2023-04-27', ARRAY['masada-2van','masada-4van','masada-cargo','masada-qq'], 'tsb-7', 'tsb_documents', 'TSB_EVKMC_007_230427.pdf', true),
    ('TSB-008', 'TSB_EVKMC_008', '기술 회람 008', '2023-04-28', ARRAY['masada-2van'], 'tsb-8', 'tsb_documents', 'TSB_EVKMC_008_230428.pdf', false),
    ('TSB-009', 'TSB_EVKMC_009', '기술 회람 009', '2023-04-28', ARRAY['masada-4van'], 'tsb-9', 'tsb_documents', 'TSB_EVKMC_009_230428.pdf', false),
    ('TSB-010', 'TSB_EVKMC_010', '기술 회람 010', '2023-05-03', ARRAY['masada-qq'], 'tsb-10', 'tsb_documents', 'TSB_EVKMC_010_230503.pdf', false)
ON CONFLICT (bulletin_no) DO NOTHING;

-- Sample manual versions
INSERT INTO public.manual_documents (doc_key, doc_category, title, model_key, version_label, effective_date, change_summary, min_grade)
VALUES
    ('sm:masada-qq', 'sm', 'MASADA QQ 정비지침서', 'masada-qq', '2025.03', '2025-03-01', 'QQ 챕터 PDF 일괄 반영', 'blue'),
    ('sm:masada-2van', 'sm', 'MASADA 2VAN 정비지침서', 'masada-2van', '2024.12', '2024-12-01', '2VAN 정비 절 개정', 'blue'),
    ('etm:hv-system', 'etm', '고전압 시스템 회로도', NULL, '2024.11', '2024-11-15', 'BMS·PDU 회로 갱신', 'silver'),
    ('etm:bms', 'etm', 'BMS 회로도', NULL, '2024.11', '2024-11-15', NULL, 'silver')
ON CONFLICT (doc_key) DO NOTHING;

-- Sample DTC cross refs (운영에서 확장)
INSERT INTO public.dtc_cross_refs (dtc_code, ref_type, label, href, sort_order)
VALUES
    ('P0A80', 'sm', '정비지침서 — 고전압', '#/shop?model=masada-2van', 10),
    ('P0A80', 'tsb', 'TSB-007 고전압 안전', '#/tsb', 20),
    ('P0A80', 'etm', 'ETM 고전압 시스템', '#/etm', 30),
    ('P1B00', 'wiring', '와이어링 — BMS', '#/wiring', 40);

-- ETM anchors sample
INSERT INTO public.etm_page_anchors (etm_node_id, anchor_label, page_number, connector_code, related_dtc_code, sort_order)
VALUES
    ('etm-1-1', 'BMS 커넥터 C101', 12, 'C101', 'P0A80', 10),
    ('etm-1-4', 'PDU 메인 퓨즈', 8, 'F101', NULL, 20);

-- TSB read tracking (optional badge)
CREATE TABLE IF NOT EXISTS public.tsb_read_ack (
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    bulletin_id BIGINT NOT NULL REFERENCES public.tsb_bulletins (id) ON DELETE CASCADE,
    read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, bulletin_id)
);

ALTER TABLE public.tsb_read_ack ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tsb_read_ack_own ON public.tsb_read_ack;
CREATE POLICY tsb_read_ack_own ON public.tsb_read_ack
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
