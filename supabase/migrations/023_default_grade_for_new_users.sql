-- 신규 사용자 등록 시 기본 등급(blue) 자동 할당
-- grade가 NULL인 경우 'blue'로 설정

-- ============================================
-- 1. 트리거 함수: INSERT 시 grade 기본값 설정
-- ============================================
CREATE OR REPLACE FUNCTION set_default_user_grade()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.grade IS NULL OR NEW.grade = '' THEN
        NEW.grade = 'blue';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 2. 트리거 생성
-- ============================================
DROP TRIGGER IF EXISTS trigger_set_default_user_grade ON public.users;
CREATE TRIGGER trigger_set_default_user_grade
    BEFORE INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION set_default_user_grade();

-- ============================================
-- 3. 기존 grade가 NULL인 사용자에게 기본값 적용
-- ============================================
UPDATE public.users
SET grade = 'blue'
WHERE grade IS NULL OR grade = '';
