/**
 * TABS DEFAULT CONTENT v2.2 - Core Games Platform
 * Renderiza conteúdo padrão para as abas da plataforma.
 * As abas Perfil, Social e Loja são tratadas pelos módulos "enhanced".
 * Este arquivo só renderiza Conquistas, Roleta e Seletor de Jogos.
 */

// ============================================================
// PERFIL — desativado, usa renderEnhancedProfile
// ============================================================
function renderDefaultProfile() {
    console.log('ℹ️ [Default] Perfil gerenciado por renderEnhancedProfile (v2.2)');
}

// ============================================================
// SOCIAL — desativado, usa renderEnhancedSocial
// ============================================================
function renderDefaultSocial() {
    console.log('ℹ️ [Default] Social gerenciado por renderEnhancedSocial (v2.2)');
}

// ============================================================
// LOJA — desativado, usa renderEnhancedShop
// ============================================================
function renderDefaultShop() {
    console.log('ℹ️ [Default] Loja gerenciada por renderEnhancedShop (v2.2)');
}

// ============================================================
// CONQUISTAS PADRÃO (mantido como fallback)
// ============================================================
function renderDefaultAchievements() {
    // Só renderiza se o enhanced não tiver preenchido
    const container = document.querySelector('[data-tab="achievements"]');
    if (!container || container.innerHTML.trim().length > 50) return;

    const achievements = [
        { icon: '🎮', name: 'Primeira Vitória', desc: 'Ganhe seu primeiro jogo' },
        { icon: '⭐', name: 'Perfeição', desc: 'Acerte todas as palavras' },
        { icon: '📈', name: 'Escalador', desc: 'Atinja nível 10' },
        { icon: '🏆', name: 'Veterano', desc: 'Jogue 100 vezes' }
    ];

    container.innerHTML = `
        <div style="padding:20px;">
            <div style="background:linear-gradient(135deg,rgba(0,212,255,.1),rgba(0,100,200,.1));padding:24px;border-radius:12px;border:1px solid rgba(0,212,255,.2);">
                <div style="font-weight:700;color:#00d4ff;margin-bottom:20px;font-size:18px;">🏆 Conquistas</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;">
                    ${achievements.map(ach => `
                        <div style="background:rgba(0,212,255,.05);padding:16px;border-radius:8px;border:1px solid rgba(0,212,255,.1);text-align:center;opacity:.6;">
                            <div style="font-size:32px;margin-bottom:8px;">${ach.icon}</div>
                            <div style="font-weight:700;color:#cbd5e0;font-size:14px;margin-bottom:4px;">${ach.name}</div>
                            <div style="color:#a0aec0;font-size:12px;">${ach.desc}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// ROLETA PADRÃO (mantido como fallback)
// ============================================================
function renderDefaultRoulette() {
    const container = document.querySelector('[data-tab="roulette"]');
    if (!container || container.innerHTML.trim().length > 50) return;

    container.innerHTML = `
        <div style="padding:20px;">
            <div style="background:linear-gradient(135deg,rgba(0,212,255,.1),rgba(0,100,200,.1));padding:24px;border-radius:12px;border:1px solid rgba(0,212,255,.2);text-align:center;">
                <div style="font-size:64px;margin-bottom:16px;">🎡</div>
                <div style="font-weight:700;color:#00d4ff;margin-bottom:8px;font-size:18px;">Roleta da Sorte</div>
                <div style="color:#a0aec0;margin-bottom:20px;">
                    <p>Jogue TermoCore para ganhar tickets!</p>
                    <p style="font-size:12px;">Use os tickets para girar a roleta e ganhar prêmios incríveis.</p>
                </div>
                <button onclick="launchGame('termocore')"
                    style="padding:12px 24px;background:linear-gradient(135deg,#00d4ff,#0099cc);color:#000;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:14px;">
                    🎮 Jogar TermoCore
                </button>
            </div>
        </div>
    `;
}

// ============================================================
// INICIALIZAR CONTEÚDO PADRÃO
// Só renderiza Conquistas, Roleta e Seletor.
// Perfil, Social e Loja são gerenciados pelos módulos enhanced.
// ============================================================
function initializeDefaultContent() {
    try {
        console.log('📝 [Default] Renderizando conteúdo padrão das abas...');

        renderDefaultProfile();    // no-op
        renderDefaultSocial();     // no-op
        renderDefaultShop();       // no-op
        renderDefaultAchievements();
        renderDefaultRoulette();

        // Seletor de jogos
        if (typeof gameSelectorUI !== 'undefined') {
            gameSelectorUI.renderGameSelector();
        }

        console.log('✅ [Default] Conteúdo padrão renderizado');
    } catch (err) {
        console.error('❌ [Default] Erro ao renderizar conteúdo padrão:', err);
    }
}
