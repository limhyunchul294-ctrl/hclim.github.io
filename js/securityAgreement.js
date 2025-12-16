// js/securityAgreement.js
// 보안서약서 팝업 컴포넌트

window.securityAgreement = {
    /**
     * 보안서약서 동의 상태 확인
     * @returns {Promise<boolean>} 동의 여부
     */
    async checkAgreementStatus() {
        try {
            const session = await window.authSession?.getSession();
            if (!session || !session.user) {
                return false;
            }

            const userInfo = await window.authService?.getUserInfo();
            if (!userInfo) {
                return false;
            }

            // Supabase에서 보안서약서 동의 상태 확인
            const { data, error } = await window.supabaseClient
                .from('users')
                .select('security_agreement_accepted, security_agreement_date')
                .eq('auth_user_id', session.user.id)
                .single();

            if (error) {
                console.warn('⚠️ 보안서약서 동의 상태 조회 실패:', error);
                // 조회 실패 시 동의하지 않은 것으로 간주
                return false;
            }

            return data?.security_agreement_accepted === true;
        } catch (error) {
            console.error('❌ 보안서약서 동의 상태 확인 오류:', error);
            return false;
        }
    },

    /**
     * 보안서약서 동의 저장
     * @param {string} company - 회사명
     * @param {string} name - 담당자 이름
     * @returns {Promise<boolean>} 저장 성공 여부
     */
    async saveAgreement(company, name) {
        try {
            const session = await window.authSession?.getSession();
            if (!session || !session.user) {
                console.error('❌ 세션이 없습니다');
                return false;
            }

            const userInfo = await window.authService?.getUserInfo();
            if (!userInfo) {
                console.error('❌ 사용자 정보가 없습니다');
                return false;
            }

            // Supabase에 보안서약서 동의 정보 저장
            const updateData = {
                security_agreement_accepted: true,
                security_agreement_date: new Date().toISOString(),
                security_agreement_company: company,
                security_agreement_name: name
            };

            console.log('💾 보안서약서 동의 저장 시도:', {
                auth_user_id: session.user.id,
                email: session.user.email,
                userInfo: {
                    profile_id: userInfo.profile_id,
                    auth_user_id: userInfo.auth_user_id,
                    email: userInfo.email
                },
                updateData
            });

            // 방법 1: auth_user_id로 업데이트 시도
            let { data: updateResult, error: updateError } = await window.supabaseClient
                .from('users')
                .update(updateData)
                .eq('auth_user_id', session.user.id)
                .select();

            console.log('📊 auth_user_id 업데이트 결과:', { 
                data: updateResult, 
                error: updateError,
                resultCount: updateResult?.length || 0
            });

            // 방법 2: auth_user_id로 업데이트 실패 시 이메일로 시도
            if (updateError || !updateResult || updateResult.length === 0) {
                console.log('🔄 auth_user_id로 업데이트 실패, 이메일로 재시도...');
                console.log('📧 이메일:', session.user.email);
                
                if (session.user.email) {
                    const normalizedEmail = session.user.email.trim().toLowerCase();
                    const { data: emailResult, error: emailError } = await window.supabaseClient
                        .from('users')
                        .update(updateData)
                        .ilike('email', normalizedEmail)
                        .select();

                    console.log('📊 이메일 업데이트 결과:', { 
                        data: emailResult, 
                        error: emailError,
                        resultCount: emailResult?.length || 0
                    });

                    if (emailError) {
                        console.error('❌ 이메일로 업데이트 실패:', emailError);
                        console.error('❌ 에러 상세:', JSON.stringify(emailError, null, 2));
                        
                        // 방법 3: profile_id가 있으면 profile_id로 시도
                        if (userInfo.profile_id) {
                            console.log('🔄 profile_id로 재시도...', userInfo.profile_id);
                            const { data: profileResult, error: profileError } = await window.supabaseClient
                                .from('users')
                                .update(updateData)
                                .eq('profile_id', userInfo.profile_id)
                                .select();
                            
                            console.log('📊 profile_id 업데이트 결과:', { 
                                data: profileResult, 
                                error: profileError,
                                resultCount: profileResult?.length || 0
                            });
                            
                            if (profileError) {
                                console.error('❌ profile_id로 업데이트 실패:', profileError);
                                console.error('❌ 에러 상세:', JSON.stringify(profileError, null, 2));
                                
                                // RLS 정책 문제일 가능성 높음
                                if (profileError.code === '42501' || profileError.message?.includes('permission denied')) {
                                    console.error('💡 RLS 정책 문제로 보입니다. 다음을 확인하세요:');
                                    console.error('   1. Supabase Dashboard > SQL Editor에서 다음 파일 실행:');
                                    console.error('      supabase/fix_security_agreement_rls_final.sql');
                                    console.error('   2. 정책이 제대로 추가되었는지 확인');
                                }
                                return false;
                            } else if (!profileResult || profileResult.length === 0) {
                                console.error('❌ profile_id로 업데이트했지만 레코드가 없습니다');
                                console.error('💡 가능한 원인:');
                                console.error('   1. profile_id가 잘못되었거나 레코드가 없음');
                                console.error('   2. RLS 정책이 업데이트를 차단함');
                                return false;
                            }
                            // profile_id로 성공한 경우 updateResult 업데이트
                            updateResult = profileResult;
                        } else {
                            console.error('❌ profile_id도 없어 업데이트할 수 없습니다');
                            console.error('💡 해결 방법:');
                            console.error('   1. Supabase Dashboard에서 auth_user_id 동기화 SQL 실행');
                            console.error('   2. 또는 관리자에게 사용자 정보 확인 요청');
                            return false;
                        }
                    } else if (!emailResult || emailResult.length === 0) {
                        console.error('❌ 이메일로 업데이트했지만 레코드가 없습니다');
                        console.error('💡 가능한 원인:');
                        console.error('   1. 이메일이 users 테이블에 없음');
                        console.error('   2. RLS 정책이 업데이트를 차단함');
                        console.error('   3. auth_user_id가 users 테이블과 연결되지 않음');
                        return false;
                    } else {
                        // 이메일로 성공한 경우 updateResult 업데이트
                        updateResult = emailResult;
                    }
                } else {
                    console.error('❌ 이메일 정보가 없어 업데이트할 수 없습니다');
                    return false;
                }
            }

            // 최종 성공 확인
            if (!updateResult || updateResult.length === 0) {
                console.error('❌ 모든 방법으로 업데이트 시도했지만 실패했습니다');
                return false;
            }

            console.log('✅ 보안서약서 동의 저장 성공:', updateResult[0]);

            // 사용자 정보 캐시 갱신
            if (window.authService?.refreshUserInfo) {
                await window.authService.refreshUserInfo();
            }

            console.log('✅ 보안서약서 동의 저장 완료');
            return true;
        } catch (error) {
            console.error('❌ 보안서약서 동의 저장 오류:', error);
            return false;
        }
    },

    /**
     * 보안서약서 팝업 표시
     */
    showPopup() {
        // 이미 팝업이 표시되어 있으면 중복 생성 방지
        if (document.getElementById('security-agreement-popup')) {
            return;
        }

        const popup = document.createElement('div');
        popup.id = 'security-agreement-popup';
        popup.className = 'fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center p-4';
        popup.style.backdropFilter = 'blur(4px)';

        popup.innerHTML = `
            <div class="security-agreement-container bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div class="security-agreement-header bg-gradient-to-r from-slate-700 to-slate-800 text-white p-6">
                    <h1 class="text-2xl font-bold mb-2">EVKMC 보안서약서</h1>
                    <p class="text-sm opacity-90">기술 문서 포털 사용자 동의서</p>
                    <div class="mt-3 inline-block bg-black bg-opacity-20 px-3 py-1 rounded text-xs">
                        정비 기술 문서 및 서비스 정보 보호 약관
                    </div>
                </div>
                
                <div class="security-agreement-content flex-1 overflow-y-auto p-6 text-slate-700" style="max-height: calc(90vh - 300px);">
                    <div class="space-y-6">
                        <div class="section">
                            <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">1. 서비스 개요 및 목적</h2>
                            <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all hover:bg-slate-100 hover:translate-x-1" onclick="toggleSecuritySection(this)">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm font-medium">본 포털의 운영 목적과 자료 보호에 대해 알아보기</span>
                                    <span class="expand-icon text-slate-600">▼</span>
                                </div>
                                <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                                    <p class="mb-3">본 포털(evkmc-as-app.vercel.app)은 EVKMC에서 제공하는 자동차 정비 관련 기술 문서를 공유하는 정비 포털입니다. 협력점 및 인증 사용자에게 최신의 기술 정보와 서비스 자료를 제공하여 고품질의 정비 서비스를 지원하고자 합니다.</p>
                                    <p class="mb-3">본 포털은 정비 산업의 기술 수준 향상과 정비 서비스 품질 관리를 위한 전문적인 플랫폼으로, 다양한 협력점의 정비 업무 효율성을 극대화하기 위해 설계되었습니다. 제공되는 모든 자료는 EVKMC의 독자적인 연구와 개발을 통해 축적된 기술 자산으로, 저작권법 및 영업비밀보호법으로 보호받습니다.</p>
                                    <p>본 포털의 자료는 협력점 직원들의 정비 기술 향상 및 고객 서비스 개선을 목적으로 제한적으로 공유되는 것이며, 무단 배포나 외부 공개는 EVKMC의 기술 자산 보호를 침해하는 심각한 행위입니다. 이러한 행위는 관련 법령에 따라 형사적, 민사적 책임을 초래합니다.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="section">
                            <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">2. 허용되는 사용 범위</h2>
                            <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all hover:bg-slate-100 hover:translate-x-1" onclick="toggleSecuritySection(this)">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm font-medium">자료 이용이 명시적으로 허용되는 범위 확인하기</span>
                                    <span class="expand-icon text-slate-600">▼</span>
                                </div>
                                <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                                    <p class="mb-3"><strong>본 포털에 저장되어 있는 모든 자료에 대해 다음의 행위는 명시적으로 허용됩니다:</strong></p>
                                    <ul class="list-disc list-inside ml-4 mb-3 space-y-1">
                                        <li>자료의 열람 및 조회</li>
                                        <li>개인적 학습 목적의 자료 저장 및 보관</li>
                                        <li>사용자 본인의 정비 업무에 필요한 범위 내에서의 활용</li>
                                        <li>협력점 내 필요한 직원과의 공유 (원본 훼손 없이, 폐쇄된 네트워크 내에서만)</li>
                                        <li>정비 서비스 향상을 위한 내부 교육 및 훈련</li>
                                    </ul>
                                    <p class="mb-2"><strong>사용자의 책임:</strong></p>
                                    <p>사용자는 위의 범위 내에서 자료를 활용할 때, 항상 EVKMC의 저작권 표시를 유지하고 자료의 출처를 명시해야 합니다. 자료를 수정하거나 2차 창작물을 만들 경우에도 원본의 저작권 표시는 반드시 유지되어야 하며, EVKMC의 허가 없이는 수정된 내용을 배포할 수 없습니다.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="section">
                            <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">3. 금지되는 행위</h2>
                            <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all hover:bg-slate-100 hover:translate-x-1" onclick="toggleSecuritySection(this)">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm font-medium">엄격히 금지되는 행위와 그 이유 알아보기</span>
                                    <span class="expand-icon text-slate-600">▼</span>
                                </div>
                                <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                                    <p class="mb-3"><strong>다음의 행위는 엄격히 금지되며, 위반 시 형사적 처벌 및 민사적 손해배상 청구를 받을 수 있습니다:</strong></p>
                                    <ul class="list-disc list-inside ml-4 mb-3 space-y-1">
                                        <li>자료의 불특정 다수에 대한 무단 배포</li>
                                        <li>인터넷(SNS, 웹사이트, 클라우드, 메신저, 이메일 등)을 통한 무단 업로드 및 공개</li>
                                        <li>상업적 이용 목적의 2차 가공, 편집 및 판매</li>
                                        <li>저작권 표시 제거 또는 출처 은폐</li>
                                        <li>자료의 무단 전재 및 배포용 링크 생성</li>
                                        <li>타인으로 하여금 자료를 배포하도록 권유 또는 강요</li>
                                        <li>자료의 부분 또는 전체 복제본 작성 및 배포</li>
                                        <li>자료 내용을 기반으로 한 경쟁사 자료 개발</li>
                                    </ul>
                                    <p><strong>특히 주의:</strong> 인터넷 플랫폼을 통한 무단 배포는 자동으로 불특정 다수에게 확산되는 특성상 더욱 심각한 위반으로 간주되며, 적발 시 더욱 무거운 처벌을 받을 수 있습니다.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded my-4">
                            <p class="text-sm leading-relaxed"><strong>⚠️ 중요 안내</strong><br>
                            본 자료는 EVKMC의 기술 자산으로 저작권법 및 영업비밀보호법으로 보호받습니다. 무단 배포 및 업로드는 형사적 처벌(징역, 벌금)과 민사적 손해배상(최대 수억원대)을 초래할 수 있습니다.</p>
                        </div>
                        
                        <div class="section">
                            <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">4. 적용 법령 및 형사적 책임</h2>
                            <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all hover:bg-slate-100 hover:translate-x-1" onclick="toggleSecuritySection(this)">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm font-medium">무단 배포 시 적용되는 법령과 처벌 상세 알아보기</span>
                                    <span class="expand-icon text-slate-600">▼</span>
                                </div>
                                <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                                    <p class="mb-3"><strong>본 포털의 자료를 불특정 다수에게 무단 배포하거나 인터넷에 업로드한 경우, 다음의 법령에 따른 형사 처벌을 받을 수 있습니다:</strong></p>
                                    <p class="mb-2"><strong>1) 저작권법 제136조 (저작권 침해)</strong></p>
                                    <p class="ml-4 mb-3">5년 이하의 징역 또는 5천만원 이하의 벌금에 처해질 수 있습니다.</p>
                                    <p class="mb-2"><strong>2) 정보통신망이용촉진및정보보호등에관한법률(정보통신망법) 제74조</strong></p>
                                    <p class="ml-4 mb-3">인터넷을 통해 저작권이 침해된 자료를 유포한 경우, 7년 이하의 징역 또는 5천만원 이하의 벌금에 처해질 수 있습니다.</p>
                                    <p class="mb-2"><strong>3) 영업비밀보호법 제2조, 제10조</strong></p>
                                    <p class="ml-4 mb-3">EVKMC의 기술 자료가 경영상 가치 있는 비공개 정보로 인정될 경우, 이를 무단 공개한 자는 10년 이하의 징역 또는 1억원 이하의 벌금에 처해질 수 있습니다.</p>
                                    <p class="mb-2"><strong>4) 부정경쟁방지및영업비밀보호에관한법률(부정경쟁방지법)</strong></p>
                                    <p class="ml-4 mb-3">EVKMC의 영업비밀을 훔치거나 부정한 수단으로 취득하여 이용하거나 배포한 경우, 3년 이하의 징역 또는 3천만원 이하의 벌금에 처해질 수 있습니다.</p>
                                    <p class="mb-2"><strong>5) 자동차관리법 및 자동차안전기준에관한규칙</strong></p>
                                    <p class="ml-4">자동차 정비 관련 기술 정보는 자동차관리법에 따른 정비 기준을 준수하기 위한 중요한 정보입니다. 이러한 정보를 부정하게 이용하거나 무단으로 배포하여 정비 품질 저하 또는 안전 사고를 초래한 경우, 별도의 행정처벌과 형사 책임이 추가될 수 있습니다.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="section">
                            <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">5. 민사적 책임 및 손해배상</h2>
                            <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all hover:bg-slate-100 hover:translate-x-1" onclick="toggleSecuritySection(this)">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm font-medium">민사상 손해배상 청구 규모 및 방식 상세 알아보기</span>
                                    <span class="expand-icon text-slate-600">▼</span>
                                </div>
                                <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                                    <p class="mb-3"><strong>무단 배포 및 업로드로 인한 민사상 손해배상 청구를 받을 수 있으며, 그 규모는 다음과 같습니다:</strong></p>
                                    <p class="mb-2"><strong>1) 실제 손해액</strong></p>
                                    <p class="ml-4 mb-3">저작권 침해로 인한 EVKMC의 실제 손실액 전부를 배상해야 합니다.</p>
                                    <p class="mb-2"><strong>2) 예정된 손해배상액 (저작권법 제109조)</strong></p>
                                    <p class="ml-4 mb-3">1회 침해 시 5백만원~5천만원의 손해배상액을 청구할 수 있습니다. 중복 침해, 광범위한 확산, 상업적 이용, 고의적 침해 등의 경우 배상액이 상향 조정되어 1회당 수천만원~수억원대까지 청구될 수 있습니다.</p>
                                    <p class="mb-2"><strong>3) 부대비용 및 재판비용</strong></p>
                                    <p class="ml-4 mb-3">저작권 침해 소송을 담당하는 전문 변호사의 정기적 비용, 법원 소송비용, 기술 감정료, 온라인 게시물 삭제 및 모니터링 비용 등 모든 부대비용을 피고인이 부담하게 됩니다.</p>
                                    <p class="mb-2"><strong>4) 영구적 배포금지 가처분</strong></p>
                                    <p class="ml-4 mb-3">법원은 EVKMC의 요청에 따라 피고인의 자료 배포를 영구적으로 금지하는 가처분 명령을 내릴 수 있습니다.</p>
                                    <p class="mb-2"><strong>5) 이자 및 지연배상금</strong></p>
                                    <p class="ml-4">손해배상금에 대해 법원이 정한 이자율(연 5%)이 가산되며, 판결 확정 이후 지연배상금도 발생합니다.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="section">
                            <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">6. 책임의 범위 및 공동 불법행위</h2>
                            <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all hover:bg-slate-100 hover:translate-x-1" onclick="toggleSecuritySection(this)">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm font-medium">직·간접적 책임이 발생하는 다양한 경우 확인하기</span>
                                    <span class="expand-icon text-slate-600">▼</span>
                                </div>
                                <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                                    <p class="mb-3"><strong>다음의 경우, 배포자 뿐만 아니라 적극적으로 확산에 동조하거나 도운 자도 법적 책임을 질 수 있습니다:</strong></p>
                                    <ul class="list-disc list-inside ml-4 mb-3 space-y-1">
                                        <li>불법 게시물의 재공유, 리트윗, 공감/좋아요 표시</li>
                                        <li>다운로드 링크의 배포 또는 소개</li>
                                        <li>적극적인 재전송 및 확산 (개인 채팅, 그룹 채팅, SNS, 메일 등)</li>
                                        <li>삭제된 게시물의 스크린샷 저장 및 공유</li>
                                        <li>수정·편집된 자료의 2차 배포</li>
                                        <li>자료를 링크한 타 커뮤니티 게시물 작성</li>
                                        <li>자료 배포자에게 제보, 정보 제공, 협력</li>
                                    </ul>
                                    <p><strong>공동 불법행위의 법적 책임:</strong></p>
                                    <p class="ml-4">법원은 이러한 행위를 민법 제760조의 공동 불법행위로 인정하여 모든 관여자에게 연대 책임을 물을 수 있습니다. 즉, 실제 배포자가 아니더라도 확산을 도운 모든 사람이 손해배상을 해야 하며, EVKMC는 배포자뿐만 아니라 모든 참여자를 상대로 소송을 제기할 수 있습니다.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="section">
                            <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">7. 모니터링, 적발 및 대응 절차</h2>
                            <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all hover:bg-slate-100 hover:translate-x-1" onclick="toggleSecuritySection(this)">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm font-medium">EVKMC의 모니터링 방식 및 적발 시 대응 조치 알아보기</span>
                                    <span class="expand-icon text-slate-600">▼</span>
                                </div>
                                <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                                    <p class="mb-3"><strong>EVKMC는 본 포털 자료의 무단 배포를 지속적이고 광범위하게 모니터링하며, 적발 시 다음의 조치를 취합니다:</strong></p>
                                    <p class="mb-2"><strong>1) 온라인 모니터링 및 삭제 요청</strong></p>
                                    <p class="ml-4 mb-3">EVKMC는 Google, Naver, Kakao 등 주요 검색 엔진 및 SNS를 대상으로 무단 배포 자료를 정기적으로 모니터링합니다.</p>
                                    <p class="mb-2"><strong>2) 배포자 신원 파악</strong></p>
                                    <p class="ml-4 mb-3">EVKMC는 필요시 변호사와 협력하여 법원에 인터넷 이용자 정보 공개 청구를 제출, IP 주소를 통해 배포자의 실명을 파악할 수 있습니다.</p>
                                    <p class="mb-2"><strong>3) 경찰청/검찰청 고소·고발</strong></p>
                                    <p class="ml-4 mb-3">적발된 무단 배포 행위에 대해 저작권법, 정보통신망법, 영업비밀보호법 등 관련 법령을 근거로 경찰청 사이버수사대 또는 검찰청에 고소/고발을 제기합니다.</p>
                                    <p class="mb-2"><strong>4) 포털 서비스 이용 중단</strong></p>
                                    <p class="ml-4 mb-3">무단 배포 행위가 확인되면 해당 사용자의 포털 접근권을 즉시 차단합니다.</p>
                                    <p class="mb-2"><strong>5) 협력점 인증 취소 및 거래 중단</strong></p>
                                    <p class="ml-4 mb-3">배포자가 협력점 직원인 경우, 해당 협력점의 포털 인증을 취소하고 EVKMC와의 거래 관계를 중단할 수 있습니다.</p>
                                    <p class="mb-2"><strong>6) 손해배상 청구 소송</strong></p>
                                    <p class="ml-4">형사 고소/고발과 별도로 민사 손해배상 청구 소송을 제기합니다.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="section">
                            <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">8. 사용자의 권리와 의무</h2>
                            <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all hover:bg-slate-100 hover:translate-x-1" onclick="toggleSecuritySection(this)">
                                <div class="flex justify-between items-center">
                                    <span class="text-sm font-medium">포털 이용 시 사용자가 가져야 할 책임감 확인하기</span>
                                    <span class="expand-icon text-slate-600">▼</span>
                                </div>
                                <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                                    <p class="mb-2"><strong>사용자의 권리:</strong></p>
                                    <ul class="list-disc list-inside ml-4 mb-3 space-y-1">
                                        <li>승인된 범위 내에서 포털의 기술 자료에 무제한 접근 권리</li>
                                        <li>자료에 대한 질문 및 기술 지원 요청 권리</li>
                                        <li>자료 업데이트 및 신규 자료에 대한 우선 접근 권리</li>
                                        <li>EVKMC에 자료 개선 의견 제시 권리</li>
                                    </ul>
                                    <p class="mb-2"><strong>사용자의 의무:</strong></p>
                                    <ul class="list-disc list-inside ml-4 space-y-1">
                                        <li>포털에 접근하는 자신의 계정에 대한 보안 유지 (비밀번호 공개 금지)</li>
                                        <li>자료 무단 배포 금지 및 저작권 표시 유지</li>
                                        <li>자료 열람 및 사용 목적을 승인된 범위로 제한</li>
                                        <li>자료 내용의 정확성 검증 책임</li>
                                        <li>자료 사용으로 인한 손해에 대해 EVKMC에 책임을 묻지 않을 것</li>
                                        <li>무단 배포를 발견한 경우 EVKMC에 즉시 신고할 의무</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="security-agreement-footer bg-slate-50 p-6 border-t border-slate-200">
                    <div class="mb-4">
                        <div class="flex items-center mb-2">
                            <span class="text-sm font-semibold text-slate-700">보안서약서 동의 확인</span>
                            <span class="text-red-500 font-bold ml-1">*</span>
                        </div>
                        <p class="text-xs text-slate-600 mb-4"><strong>중요:</strong> 위의 내용을 모두 읽으신 후, 아래 문구를 정확히 입력하여 동의를 진행해주시기 바랍니다. 자세히 보기 버튼을 눌러 전체 내용을 확인하지 않은 경우 입력 필드가 비활성화됩니다.</p>
                    </div>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-xs text-slate-600 mb-1 font-medium">입력 문구: "EVKMC 보안서약서에 동의합니다"를 정확히 입력하세요</label>
                            <input type="text" id="agreementInput" placeholder="여기에 입력하세요..." disabled class="w-full px-3 py-2 border-2 border-slate-200 rounded focus:outline-none focus:border-blue-500 transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed">
                            <div id="inputStatus" class="text-xs mt-1 hidden"></div>
                            <div id="agreementNotice" class="text-xs text-red-500 mt-1">⚠️ 위의 모든 섹션을 읽으신 후 입력하실 수 있습니다.</div>
                        </div>
                        
                        <div>
                            <label class="block text-xs text-slate-600 mb-1 font-medium">소속 회사명 또는 협력점명을 입력하세요</label>
                            <input type="text" id="companyInput" placeholder="예: OO 정비소" disabled class="w-full px-3 py-2 border-2 border-slate-200 rounded focus:outline-none focus:border-blue-500 transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed">
                            <div id="companyStatus" class="text-xs mt-1 hidden"></div>
                        </div>
                        
                        <div>
                            <label class="block text-xs text-slate-600 mb-1 font-medium">담당자 이름을 입력하세요</label>
                            <input type="text" id="nameInput" placeholder="예: 홍길동" disabled class="w-full px-3 py-2 border-2 border-slate-200 rounded focus:outline-none focus:border-blue-500 transition-colors disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed">
                            <div id="nameStatus" class="text-xs mt-1 hidden"></div>
                        </div>
                    </div>
                    
                    <div class="flex gap-3 mt-6">
                        <button id="security-agreement-cancel-btn" class="flex-1 px-4 py-3 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors font-semibold">취소</button>
                        <button id="security-agreement-agree-btn" disabled class="flex-1 px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-semibold disabled:bg-slate-400 disabled:cursor-not-allowed">동의 및 포털 이용</button>
                    </div>
                    <p class="text-xs text-slate-500 text-center mt-3">본 약관에 동의하지 않으실 경우 포털 서비스를 이용할 수 없습니다.</p>
                </div>
            </div>
        `;

        document.body.appendChild(popup);

        // 팝업 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
            .security-agreement-container {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            .security-agreement-content::-webkit-scrollbar {
                width: 8px;
            }
            .security-agreement-content::-webkit-scrollbar-track {
                background: #f1f1f1;
            }
            .security-agreement-content::-webkit-scrollbar-thumb {
                background: #64748b;
                border-radius: 4px;
            }
            .expandable-item.expanded {
                background: #e2e8f0 !important;
                border-left-color: #475569 !important;
            }
            .expandable-item.expanded .expand-icon {
                transform: rotate(180deg);
            }
            .expandable-content {
                animation: slideDown 0.3s ease;
            }
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            #inputStatus.correct {
                color: #10b981;
                display: block;
            }
            #inputStatus.incorrect {
                color: #ef4444;
                display: block;
            }
            #companyStatus.correct {
                color: #10b981;
                display: block;
            }
            #companyStatus.incorrect {
                color: #ef4444;
                display: block;
            }
            #nameStatus.correct {
                color: #10b981;
                display: block;
            }
            #nameStatus.incorrect {
                color: #ef4444;
                display: block;
            }
        `;
        document.head.appendChild(style);

        // 이벤트 리스너 설정
        this.initPopupEvents();
    },

    /**
     * 팝업 이벤트 리스너 초기화
     */
    initPopupEvents() {
        const agreementInput = document.getElementById('agreementInput');
        const companyInput = document.getElementById('companyInput');
        const nameInput = document.getElementById('nameInput');
        const agreeBtn = document.getElementById('security-agreement-agree-btn');
        const cancelBtn = document.getElementById('security-agreement-cancel-btn');
        const inputStatus = document.getElementById('inputStatus');
        const companyStatus = document.getElementById('companyStatus');
        const nameStatus = document.getElementById('nameStatus');
        const agreementNotice = document.getElementById('agreementNotice');

        // 모든 확장 가능한 항목 추적
        const expandableItems = document.querySelectorAll('.expandable-item');
        const requiredSections = 8;
        let expandedCount = 0;

        // 섹션 확장/축소 함수
        window.toggleSecuritySection = function(element) {
            const isExpanding = !element.classList.contains('expanded');
            
            element.classList.toggle('expanded');
            element.classList.toggle('not-expanded');
            
            const content = element.querySelector('.expandable-content');
            if (content) {
                if (isExpanding) {
                    content.classList.remove('hidden');
                    expandedCount++;
                } else {
                    content.classList.add('hidden');
                    expandedCount--;
                }
            }
            
            // 모든 섹션이 펼쳐지면 입력 필드 활성화
            if (expandedCount === requiredSections) {
                agreementInput.disabled = false;
                companyInput.disabled = false;
                nameInput.disabled = false;
                agreementNotice.style.display = 'none';
            } else {
                agreementInput.disabled = true;
                companyInput.disabled = true;
                nameInput.disabled = true;
                agreementInput.value = '';
                companyInput.value = '';
                nameInput.value = '';
                inputStatus.textContent = '';
                companyStatus.textContent = '';
                nameStatus.textContent = '';
                agreementNotice.style.display = 'block';
                agreeBtn.disabled = true;
            }
        };

        // 동의 문구 검증
        function checkAgreementText() {
            const inputValue = agreementInput.value.trim();
            const targetText = 'EVKMC 보안서약서에 동의합니다';
            
            if (inputValue === '') {
                inputStatus.textContent = '';
                inputStatus.className = 'hidden';
            } else if (inputValue === targetText) {
                inputStatus.textContent = '✓ 정확히 입력되었습니다.';
                inputStatus.className = 'correct';
            } else {
                inputStatus.textContent = '✗ 입력이 정확하지 않습니다. 정확히 입력해주세요.';
                inputStatus.className = 'incorrect';
            }
            
            updateButtonState();
        }

        // 회사명 검증
        function checkCompanyInput() {
            const inputValue = companyInput.value.trim();
            
            if (inputValue === '') {
                companyStatus.textContent = '';
                companyStatus.className = 'hidden';
            } else if (inputValue.length >= 2) {
                companyStatus.textContent = '✓ 회사명이 입력되었습니다.';
                companyStatus.className = 'correct';
            } else {
                companyStatus.textContent = '✗ 2글자 이상 입력해주세요.';
                companyStatus.className = 'incorrect';
            }
            
            updateButtonState();
        }

        // 이름 검증
        function checkNameInput() {
            const inputValue = nameInput.value.trim();
            
            if (inputValue === '') {
                nameStatus.textContent = '';
                nameStatus.className = 'hidden';
            } else if (inputValue.length >= 2) {
                nameStatus.textContent = '✓ 이름이 입력되었습니다.';
                nameStatus.className = 'correct';
            } else {
                nameStatus.textContent = '✗ 2글자 이상 입력해주세요.';
                nameStatus.className = 'incorrect';
            }
            
            updateButtonState();
        }

        // 버튼 상태 업데이트
        function updateButtonState() {
            const agreementComplete = agreementInput.value.trim() === 'EVKMC 보안서약서에 동의합니다';
            const companyFilled = companyInput.value.trim().length >= 2;
            const nameFilled = nameInput.value.trim().length >= 2;
            
            agreeBtn.disabled = !(agreementComplete && companyFilled && nameFilled);
        }

        // 이벤트 리스너 등록
        agreementInput.addEventListener('input', checkAgreementText);
        companyInput.addEventListener('input', checkCompanyInput);
        nameInput.addEventListener('input', checkNameInput);

        // 동의 버튼 클릭
        agreeBtn.addEventListener('click', async () => {
            const company = companyInput.value.trim();
            const name = nameInput.value.trim();
            
            // 입력값 재검증
            const agreementComplete = agreementInput.value.trim() === 'EVKMC 보안서약서에 동의합니다';
            const companyFilled = company.length >= 2;
            const nameFilled = name.length >= 2;
            
            if (!agreementComplete || !companyFilled || !nameFilled) {
                if (window.showToast) {
                    window.showToast('모든 항목을 정확히 입력해주세요.', 'error');
                } else {
                    alert('모든 항목을 정확히 입력해주세요.');
                }
                return;
            }
            
            agreeBtn.disabled = true;
            agreeBtn.textContent = '처리 중...';
            
            try {
                const success = await this.saveAgreement(company, name);
                
                if (success) {
                    const popup = document.getElementById('security-agreement-popup');
                    if (popup) {
                        popup.remove();
                    }
                    
                    // 사용자 정보 캐시 갱신
                    if (window.authService?.refreshUserInfo) {
                        await window.authService.refreshUserInfo();
                    }
                    
                    // 토스트 메시지 표시
                    if (window.showToast) {
                        window.showToast('보안서약서에 동의하셨습니다. 포털 서비스를 이용하실 수 있습니다.', 'success');
                    } else {
                        alert('보안서약서에 동의하셨습니다. 포털 서비스를 이용하실 수 있습니다.');
                    }
                } else {
                    agreeBtn.disabled = false;
                    agreeBtn.textContent = '동의 및 포털 이용';
                    
                    if (window.showToast) {
                        window.showToast('보안서약서 동의 저장에 실패했습니다. 다시 시도해주세요.', 'error');
                    } else {
                        alert('보안서약서 동의 저장에 실패했습니다. 다시 시도해주세요.');
                    }
                }
            } catch (error) {
                console.error('❌ 보안서약서 동의 처리 오류:', error);
                agreeBtn.disabled = false;
                agreeBtn.textContent = '동의 및 포털 이용';
                
                if (window.showToast) {
                    window.showToast('오류가 발생했습니다. 다시 시도해주세요.', 'error');
                } else {
                    alert('오류가 발생했습니다. 다시 시도해주세요.');
                }
            }
        });

        // 취소 버튼 클릭
        cancelBtn.addEventListener('click', () => {
            if (confirm('보안서약서에 동의하지 않으시겠습니까?\n포털 서비스 이용이 제한됩니다.')) {
                const popup = document.getElementById('security-agreement-popup');
                if (popup) {
                    popup.remove();
                }
                // 로그아웃 처리
                window.location.href = 'login.html';
            }
        });

        // 팝업 외부 클릭 시 닫기 방지 (필수 동의이므로)
        const popup = document.getElementById('security-agreement-popup');
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                // 외부 클릭 시 아무 동작도 하지 않음 (동의 필수)
            }
        });
    },

    /**
     * 보안서약서 팝업 표시 여부 확인 및 표시
     */
    async checkAndShow() {
        try {
            const isAgreed = await this.checkAgreementStatus();
            
            if (!isAgreed) {
                // 동의하지 않은 경우 팝업 표시
                this.showPopup();
            }
        } catch (error) {
            console.error('❌ 보안서약서 확인 오류:', error);
            // 오류 발생 시에도 팝업 표시 (안전을 위해)
            this.showPopup();
        }
    },

    /**
     * 보안서약서 전문 보기 (읽기 전용 모드)
     */
    showViewOnlyPopup() {
        // 이미 팝업이 표시되어 있으면 중복 생성 방지
        if (document.getElementById('security-agreement-popup')) {
            return;
        }

        const popup = document.createElement('div');
        popup.id = 'security-agreement-popup';
        popup.className = 'fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center p-4';
        popup.style.backdropFilter = 'blur(4px)';

        popup.innerHTML = `
            <div class="security-agreement-container bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                <div class="security-agreement-header bg-gradient-to-r from-slate-700 to-slate-800 text-white p-6">
                    <h1 class="text-2xl font-bold mb-2">EVKMC 보안서약서</h1>
                    <p class="text-sm opacity-90">기술 문서 포털 사용자 동의서</p>
                    <div class="mt-3 inline-block bg-black bg-opacity-20 px-3 py-1 rounded text-xs">
                        정비 기술 문서 및 서비스 정보 보호 약관
                    </div>
                </div>
                
                <div class="security-agreement-content flex-1 overflow-y-auto p-6 text-slate-700" style="max-height: calc(90vh - 150px);">
                    ${this.getAgreementContentHTML()}
                </div>
                
                <div class="security-agreement-footer bg-slate-50 p-6 border-t border-slate-200">
                    <button 
                        id="security-agreement-close-btn" 
                        class="w-full px-4 py-3 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors font-semibold"
                    >
                        닫기
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(popup);

        // 팝업 스타일 추가 (이미 추가되어 있으면 스킵)
        if (!document.getElementById('security-agreement-styles')) {
            const style = document.createElement('style');
            style.id = 'security-agreement-styles';
            style.textContent = `
                .security-agreement-container {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .security-agreement-content::-webkit-scrollbar {
                    width: 8px;
                }
                .security-agreement-content::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }
                .security-agreement-content::-webkit-scrollbar-thumb {
                    background: #64748b;
                    border-radius: 4px;
                }
                .expandable-item.expanded {
                    background: #e2e8f0 !important;
                    border-left-color: #475569 !important;
                }
                .expandable-item.expanded .expand-icon {
                    transform: rotate(180deg);
                }
                .expandable-content {
                    animation: slideDown 0.3s ease;
                }
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // 닫기 버튼 이벤트
        const closeBtn = document.getElementById('security-agreement-close-btn');
        closeBtn.addEventListener('click', () => {
            popup.remove();
        });

        // 팝업 외부 클릭 시 닫기
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.remove();
            }
        });

        // 모든 섹션 자동 확장 (읽기 전용 모드)
        setTimeout(() => {
            const expandableItems = popup.querySelectorAll('.expandable-item');
            expandableItems.forEach(item => {
                if (!item.classList.contains('expanded')) {
                    item.classList.add('expanded');
                    item.classList.remove('not-expanded');
                    const content = item.querySelector('.expandable-content');
                    if (content) {
                        content.classList.remove('hidden');
                    }
                }
            });
        }, 100);
    },

    /**
     * 보안서약서 내용 HTML 반환 (재사용 가능)
     */
    getAgreementContentHTML() {
        return `
            <div class="space-y-6">
                <div class="section">
                    <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">1. 서비스 개요 및 목적</h2>
                    <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all hover:bg-slate-100 hover:translate-x-1" onclick="toggleSecuritySection(this)">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-medium">본 포털의 운영 목적과 자료 보호에 대해 알아보기</span>
                            <span class="expand-icon text-slate-600">▼</span>
                        </div>
                        <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                            <p class="mb-3">본 포털(evkmc-as-app.vercel.app)은 EVKMC에서 제공하는 자동차 정비 관련 기술 문서를 공유하는 정비 포털입니다. 협력점 및 인증 사용자에게 최신의 기술 정보와 서비스 자료를 제공하여 고품질의 정비 서비스를 지원하고자 합니다.</p>
                            <p class="mb-3">본 포털은 정비 산업의 기술 수준 향상과 정비 서비스 품질 관리를 위한 전문적인 플랫폼으로, 다양한 협력점의 정비 업무 효율성을 극대화하기 위해 설계되었습니다. 제공되는 모든 자료는 EVKMC의 독자적인 연구와 개발을 통해 축적된 기술 자산으로, 저작권법 및 영업비밀보호법으로 보호받습니다.</p>
                            <p>본 포털의 자료는 협력점 직원들의 정비 기술 향상 및 고객 서비스 개선을 목적으로 제한적으로 공유되는 것이며, 무단 배포나 외부 공개는 EVKMC의 기술 자산 보호를 침해하는 심각한 행위입니다. 이러한 행위는 관련 법령에 따라 형사적, 민사적 책임을 초래합니다.</p>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">2. 허용되는 사용 범위</h2>
                    <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all hover:bg-slate-100 hover:translate-x-1" onclick="toggleSecuritySection(this)">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-medium">자료 이용이 명시적으로 허용되는 범위 확인하기</span>
                            <span class="expand-icon text-slate-600">▼</span>
                        </div>
                        <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                            <p class="mb-3"><strong>본 포털에 저장되어 있는 모든 자료에 대해 다음의 행위는 명시적으로 허용됩니다:</strong></p>
                            <ul class="list-disc list-inside ml-4 mb-3 space-y-1">
                                <li>자료의 열람 및 조회</li>
                                <li>개인적 학습 목적의 자료 저장 및 보관</li>
                                <li>사용자 본인의 정비 업무에 필요한 범위 내에서의 활용</li>
                                <li>협력점 내 필요한 직원과의 공유 (원본 훼손 없이, 폐쇄된 네트워크 내에서만)</li>
                                <li>정비 서비스 향상을 위한 내부 교육 및 훈련</li>
                            </ul>
                            <p class="mb-2"><strong>사용자의 책임:</strong></p>
                            <p>사용자는 위의 범위 내에서 자료를 활용할 때, 항상 EVKMC의 저작권 표시를 유지하고 자료의 출처를 명시해야 합니다. 자료를 수정하거나 2차 창작물을 만들 경우에도 원본의 저작권 표시는 반드시 유지되어야 하며, EVKMC의 허가 없이는 수정된 내용을 배포할 수 없습니다.</p>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">3. 금지되는 행위</h2>
                    <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all hover:bg-slate-100 hover:translate-x-1" onclick="toggleSecuritySection(this)">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-medium">엄격히 금지되는 행위와 그 이유 알아보기</span>
                            <span class="expand-icon text-slate-600">▼</span>
                        </div>
                        <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                            <p class="mb-3"><strong>다음의 행위는 엄격히 금지되며, 위반 시 형사적 처벌 및 민사적 손해배상 청구를 받을 수 있습니다:</strong></p>
                            <ul class="list-disc list-inside ml-4 mb-3 space-y-1">
                                <li>자료의 불특정 다수에 대한 무단 배포</li>
                                <li>인터넷(SNS, 웹사이트, 클라우드, 메신저, 이메일 등)을 통한 무단 업로드 및 공개</li>
                                <li>상업적 이용 목적의 2차 가공, 편집 및 판매</li>
                                <li>저작권 표시 제거 또는 출처 은폐</li>
                                <li>자료의 무단 전재 및 배포용 링크 생성</li>
                                <li>타인으로 하여금 자료를 배포하도록 권유 또는 강요</li>
                                <li>자료의 부분 또는 전체 복제본 작성 및 배포</li>
                                <li>자료 내용을 기반으로 한 경쟁사 자료 개발</li>
                            </ul>
                            <p><strong>특히 주의:</strong> 인터넷 플랫폼을 통한 무단 배포는 자동으로 불특정 다수에게 확산되는 특성상 더욱 심각한 위반으로 간주되며, 적발 시 더욱 무거운 처벌을 받을 수 있습니다.</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded my-4">
                    <p class="text-sm leading-relaxed"><strong>⚠️ 중요 안내</strong><br>
                    본 자료는 EVKMC의 기술 자산으로 저작권법 및 영업비밀보호법으로 보호받습니다. 무단 배포 및 업로드는 형사적 처벌(징역, 벌금)과 민사적 손해배상(최대 수억원대)을 초래할 수 있습니다.</p>
                </div>
                
                <div class="section">
                    <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">4. 적용 법령 및 형사적 책임</h2>
                    <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all hover:bg-slate-100 hover:translate-x-1" onclick="toggleSecuritySection(this)">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-medium">무단 배포 시 적용되는 법령과 처벌 상세 알아보기</span>
                            <span class="expand-icon text-slate-600">▼</span>
                        </div>
                        <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                            <p class="mb-3"><strong>본 포털의 자료를 불특정 다수에게 무단 배포하거나 인터넷에 업로드한 경우, 다음의 법령에 따른 형사 처벌을 받을 수 있습니다:</strong></p>
                            <p class="mb-2"><strong>1) 저작권법 제136조 (저작권 침해)</strong></p>
                            <p class="ml-4 mb-3">5년 이하의 징역 또는 5천만원 이하의 벌금에 처해질 수 있습니다.</p>
                            <p class="mb-2"><strong>2) 정보통신망이용촉진및정보보호등에관한법률(정보통신망법) 제74조</strong></p>
                            <p class="ml-4 mb-3">인터넷을 통해 저작권이 침해된 자료를 유포한 경우, 7년 이하의 징역 또는 5천만원 이하의 벌금에 처해질 수 있습니다.</p>
                            <p class="mb-2"><strong>3) 영업비밀보호법 제2조, 제10조</strong></p>
                            <p class="ml-4 mb-3">EVKMC의 기술 자료가 경영상 가치 있는 비공개 정보로 인정될 경우, 이를 무단 공개한 자는 10년 이하의 징역 또는 1억원 이하의 벌금에 처해질 수 있습니다.</p>
                            <p class="mb-2"><strong>4) 부정경쟁방지및영업비밀보호에관한법률(부정경쟁방지법)</strong></p>
                            <p class="ml-4 mb-3">EVKMC의 영업비밀을 훔치거나 부정한 수단으로 취득하여 이용하거나 배포한 경우, 3년 이하의 징역 또는 3천만원 이하의 벌금에 처해질 수 있습니다.</p>
                            <p class="mb-2"><strong>5) 자동차관리법 및 자동차안전기준에관한규칙</strong></p>
                            <p class="ml-4">자동차 정비 관련 기술 정보는 자동차관리법에 따른 정비 기준을 준수하기 위한 중요한 정보입니다. 이러한 정보를 부정하게 이용하거나 무단으로 배포하여 정비 품질 저하 또는 안전 사고를 초래한 경우, 별도의 행정처벌과 형사 책임이 추가될 수 있습니다.</p>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">5. 민사적 책임 및 손해배상</h2>
                    <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all hover:bg-slate-100 hover:translate-x-1" onclick="toggleSecuritySection(this)">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-medium">민사상 손해배상 청구 규모 및 방식 상세 알아보기</span>
                            <span class="expand-icon text-slate-600">▼</span>
                        </div>
                        <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                            <p class="mb-3"><strong>무단 배포 및 업로드로 인한 민사상 손해배상 청구를 받을 수 있으며, 그 규모는 다음과 같습니다:</strong></p>
                            <p class="mb-2"><strong>1) 실제 손해액</strong></p>
                            <p class="ml-4 mb-3">저작권 침해로 인한 EVKMC의 실제 손실액 전부를 배상해야 합니다.</p>
                            <p class="mb-2"><strong>2) 예정된 손해배상액 (저작권법 제109조)</strong></p>
                            <p class="ml-4 mb-3">1회 침해 시 5백만원~5천만원의 손해배상액을 청구할 수 있습니다. 중복 침해, 광범위한 확산, 상업적 이용, 고의적 침해 등의 경우 배상액이 상향 조정되어 1회당 수천만원~수억원대까지 청구될 수 있습니다.</p>
                            <p class="mb-2"><strong>3) 부대비용 및 재판비용</strong></p>
                            <p class="ml-4 mb-3">저작권 침해 소송을 담당하는 전문 변호사의 정기적 비용, 법원 소송비용, 기술 감정료, 온라인 게시물 삭제 및 모니터링 비용 등 모든 부대비용을 피고인이 부담하게 됩니다.</p>
                            <p class="mb-2"><strong>4) 영구적 배포금지 가처분</strong></p>
                            <p class="ml-4 mb-3">법원은 EVKMC의 요청에 따라 피고인의 자료 배포를 영구적으로 금지하는 가처분 명령을 내릴 수 있습니다.</p>
                            <p class="mb-2"><strong>5) 이자 및 지연배상금</strong></p>
                            <p class="ml-4">손해배상금에 대해 법원이 정한 이자율(연 5%)이 가산되며, 판결 확정 이후 지연배상금도 발생합니다.</p>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">6. 책임의 범위 및 공동 불법행위</h2>
                    <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all hover:bg-slate-100 hover:translate-x-1" onclick="toggleSecuritySection(this)">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-medium">직·간접적 책임이 발생하는 다양한 경우 확인하기</span>
                            <span class="expand-icon text-slate-600">▼</span>
                        </div>
                        <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                            <p class="mb-3"><strong>다음의 경우, 배포자 뿐만 아니라 적극적으로 확산에 동조하거나 도운 자도 법적 책임을 질 수 있습니다:</strong></p>
                            <ul class="list-disc list-inside ml-4 mb-3 space-y-1">
                                <li>불법 게시물의 재공유, 리트윗, 공감/좋아요 표시</li>
                                <li>다운로드 링크의 배포 또는 소개</li>
                                <li>적극적인 재전송 및 확산 (개인 채팅, 그룹 채팅, SNS, 메일 등)</li>
                                <li>삭제된 게시물의 스크린샷 저장 및 공유</li>
                                <li>수정·편집된 자료의 2차 배포</li>
                                <li>자료를 링크한 타 커뮤니티 게시물 작성</li>
                                <li>자료 배포자에게 제보, 정보 제공, 협력</li>
                            </ul>
                            <p><strong>공동 불법행위의 법적 책임:</strong></p>
                            <p class="ml-4">법원은 이러한 행위를 민법 제760조의 공동 불법행위로 인정하여 모든 관여자에게 연대 책임을 물을 수 있습니다. 즉, 실제 배포자가 아니더라도 확산을 도운 모든 사람이 손해배상을 해야 하며, EVKMC는 배포자뿐만 아니라 모든 참여자를 상대로 소송을 제기할 수 있습니다.</p>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">7. 모니터링, 적발 및 대응 절차</h2>
                    <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all hover:bg-slate-100 hover:translate-x-1" onclick="toggleSecuritySection(this)">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-medium">EVKMC의 모니터링 방식 및 적발 시 대응 조치 알아보기</span>
                            <span class="expand-icon text-slate-600">▼</span>
                        </div>
                        <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                            <p class="mb-3"><strong>EVKMC는 본 포털 자료의 무단 배포를 지속적이고 광범위하게 모니터링하며, 적발 시 다음의 조치를 취합니다:</strong></p>
                            <p class="mb-2"><strong>1) 온라인 모니터링 및 삭제 요청</strong></p>
                            <p class="ml-4 mb-3">EVKMC는 Google, Naver, Kakao 등 주요 검색 엔진 및 SNS를 대상으로 무단 배포 자료를 정기적으로 모니터링합니다.</p>
                            <p class="mb-2"><strong>2) 배포자 신원 파악</strong></p>
                            <p class="ml-4 mb-3">EVKMC는 필요시 변호사와 협력하여 법원에 인터넷 이용자 정보 공개 청구를 제출, IP 주소를 통해 배포자의 실명을 파악할 수 있습니다.</p>
                            <p class="mb-2"><strong>3) 경찰청/검찰청 고소·고발</strong></p>
                            <p class="ml-4 mb-3">적발된 무단 배포 행위에 대해 저작권법, 정보통신망법, 영업비밀보호법 등 관련 법령을 근거로 경찰청 사이버수사대 또는 검찰청에 고소/고발을 제기합니다.</p>
                            <p class="mb-2"><strong>4) 포털 서비스 이용 중단</strong></p>
                            <p class="ml-4 mb-3">무단 배포 행위가 확인되면 해당 사용자의 포털 접근권을 즉시 차단합니다.</p>
                            <p class="mb-2"><strong>5) 협력점 인증 취소 및 거래 중단</strong></p>
                            <p class="ml-4 mb-3">배포자가 협력점 직원인 경우, 해당 협력점의 포털 인증을 취소하고 EVKMC와의 거래 관계를 중단할 수 있습니다.</p>
                            <p class="mb-2"><strong>6) 손해배상 청구 소송</strong></p>
                            <p class="ml-4">형사 고소/고발과 별도로 민사 손해배상 청구 소송을 제기합니다.</p>
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <h2 class="text-base font-semibold mb-3 pb-2 border-b-2 border-red-500">8. 사용자의 권리와 의무</h2>
                    <div class="expandable-item not-expanded bg-slate-50 border-l-4 border-blue-500 p-4 rounded cursor-pointer transition-all hover:bg-slate-100 hover:translate-x-1" onclick="toggleSecuritySection(this)">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-medium">포털 이용 시 사용자가 가져야 할 책임감 확인하기</span>
                            <span class="expand-icon text-slate-600">▼</span>
                        </div>
                        <div class="expandable-content hidden mt-4 pt-4 border-t border-slate-300 text-sm leading-relaxed">
                            <p class="mb-2"><strong>사용자의 권리:</strong></p>
                            <ul class="list-disc list-inside ml-4 mb-3 space-y-1">
                                <li>승인된 범위 내에서 포털의 기술 자료에 무제한 접근 권리</li>
                                <li>자료에 대한 질문 및 기술 지원 요청 권리</li>
                                <li>자료 업데이트 및 신규 자료에 대한 우선 접근 권리</li>
                                <li>EVKMC에 자료 개선 의견 제시 권리</li>
                            </ul>
                            <p class="mb-2"><strong>사용자의 의무:</strong></p>
                            <ul class="list-disc list-inside ml-4 space-y-1">
                                <li>포털에 접근하는 자신의 계정에 대한 보안 유지 (비밀번호 공개 금지)</li>
                                <li>자료 무단 배포 금지 및 저작권 표시 유지</li>
                                <li>자료 열람 및 사용 목적을 승인된 범위로 제한</li>
                                <li>자료 내용의 정확성 검증 책임</li>
                                <li>자료 사용으로 인한 손해에 대해 EVKMC에 책임을 묻지 않을 것</li>
                                <li>무단 배포를 발견한 경우 EVKMC에 즉시 신고할 의무</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

// 전역 함수로 등록 (내 정보 페이지에서 사용)
window.showSecurityAgreementView = function() {
    window.securityAgreement?.showViewOnlyPopup();
};

console.log('✅ securityAgreement 모듈 로드 완료');

