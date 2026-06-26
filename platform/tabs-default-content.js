/**
 * TABS DEFAULT CONTENT - Core Games Platform
 * Renderiza conteúdo padrão para as abas da plataforma
 */

// ============================================================
// RENDERIZAR PERFIL PADRÃO
// ============================================================
function renderDefaultProfile() {
    const container = document.querySelector('[data-tab="profile"]');
    if (!container) return;

    const platformUser = localStorage.getItem('cg_current_user');
    let username = 'Usuário';
    let level = 1;
    let xp = 0;
    let coins = 0;
    let tickets = 0;

    if (platformUser) {
        try {
            const userData = JSON.parse(platformUser);
            username = userData.username || 'Usuário';
        } catch (e) {
            console.error('❌ Erro ao parsear usuário:', e);
        }
    }

    container.innerHTML = `
        <div style="padding: 20px;">
            <div style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 100, 200, 0.1) 100%); padding: 24px; border-radius: 12px; border: 1px solid rgba(0, 212, 255, 0.2);">
                
                <!-- HEADER DO PERFIL -->
                <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid rgba(0, 212, 255, 0.2);">
                    <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); display: flex; align-items: center; justify-content: center; font-size: 40px;">👤</div>
                    <div>
                        <div style="font-size: 24px; font-weight: 700; color: #00d4ff; margin-bottom: 4px;">${username}</div>
                        <div style="color: #a0aec0; font-size: 14px;">Nível ${level}</div>
                    </div>
                </div>

                <!-- STATS -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
                    <div style="background: rgba(0, 212, 255, 0.1); padding: 16px; border-radius: 8px; border: 1px solid rgba(0, 212, 255, 0.2); text-align: center;">
                        <div style="font-size: 24px; margin-bottom: 8px;">⭐</div>
                        <div style="color: #a0aec0; font-size: 12px; margin-bottom: 4px;">XP</div>
                        <div style="color: #00d4ff; font-weight: 700; font-size: 18px;">${xp}</div>
                    </div>
                    <div style="background: rgba(0, 212, 255, 0.1); padding: 16px; border-radius: 8px; border: 1px solid rgba(0, 212, 255, 0.2); text-align: center;">
                        <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                        <div style="color: #a0aec0; font-size: 12px; margin-bottom: 4px;">Moedas</div>
                        <div style="color: #00d4ff; font-weight: 700; font-size: 18px;">${coins}</div>
                    </div>
                    <div style="background: rgba(0, 212, 255, 0.1); padding: 16px; border-radius: 8px; border: 1px solid rgba(0, 212, 255, 0.2); text-align: center;">
                        <div style="font-size: 24px; margin-bottom: 8px;">🎟️</div>
                        <div style="color: #a0aec0; font-size: 12px; margin-bottom: 4px;">Fichas</div>
                        <div style="color: #00d4ff; font-weight: 700; font-size: 18px;">${tickets}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// RENDERIZAR SOCIAL PADRÃO
// ============================================================
function renderDefaultSocial() {
    const container = document.querySelector('[data-tab="social"]');
    if (!container) return;

    container.innerHTML = `
        <div style="padding: 20px;">
            <div style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 100, 200, 0.1) 100%); padding: 24px; border-radius: 12px; border: 1px solid rgba(0, 212, 255, 0.2);">
                <div style="font-weight: 700; color: #00d4ff; margin-bottom: 20px; font-size: 18px;">👥 Social</div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <!-- AMIGOS -->
                    <div>
                        <div style="font-weight: 700; color: #cbd5e0; margin-bottom: 12px;">Seus Amigos</div>
                        <div style="background: rgba(0, 212, 255, 0.05); padding: 16px; border-radius: 8px; border: 1px solid rgba(0, 212, 255, 0.1); text-align: center; color: #a0aec0;">
                            <div style="font-size: 32px; margin-bottom: 8px;">👥</div>
                            <p>Nenhum amigo ainda</p>
                            <p style="font-size: 12px;">Convide seus amigos para jogar!</p>
                        </div>
                    </div>

                    <!-- CONVITES -->
                    <div>
                        <div style="font-weight: 700; color: #cbd5e0; margin-bottom: 12px;">Convites Pendentes</div>
                        <div style="background: rgba(0, 212, 255, 0.05); padding: 16px; border-radius: 8px; border: 1px solid rgba(0, 212, 255, 0.1); text-align: center; color: #a0aec0;">
                            <div style="font-size: 32px; margin-bottom: 8px;">📨</div>
                            <p>Nenhum convite</p>
                            <p style="font-size: 12px;">Você receberá notificações aqui</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// RENDERIZAR CONQUISTAS PADRÃO
// ============================================================
function renderDefaultAchievements() {
    const container = document.querySelector('[data-tab="achievements"]');
    if (!container) return;

    const achievements = [
        { icon: '🎮', name: 'Primeira Vitória', desc: 'Ganhe seu primeiro jogo' },
        { icon: '⭐', name: 'Perfeição', desc: 'Acerte todas as palavras' },
        { icon: '📈', name: 'Escalador', desc: 'Atinja nível 10' },
        { icon: '🏆', name: 'Veterano', desc: 'Jogue 100 vezes' }
    ];

    container.innerHTML = `
        <div style="padding: 20px;">
            <div style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 100, 200, 0.1) 100%); padding: 24px; border-radius: 12px; border: 1px solid rgba(0, 212, 255, 0.2);">
                <div style="font-weight: 700; color: #00d4ff; margin-bottom: 20px; font-size: 18px;">🏆 Conquistas</div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
                    ${achievements.map(ach => `
                        <div style="background: rgba(0, 212, 255, 0.05); padding: 16px; border-radius: 8px; border: 1px solid rgba(0, 212, 255, 0.1); text-align: center; opacity: 0.6;">
                            <div style="font-size: 32px; margin-bottom: 8px;">${ach.icon}</div>
                            <div style="font-weight: 700; color: #cbd5e0; font-size: 14px; margin-bottom: 4px;">${ach.name}</div>
                            <div style="color: #a0aec0; font-size: 12px;">${ach.desc}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// RENDERIZAR LOJA PADRÃO
// ============================================================
function renderDefaultShop() {
    const container = document.querySelector('[data-tab="shop"]');
    if (!container) return;

    const items = [
        { icon: '🎨', name: 'Tema Neon', price: 500, type: 'theme' },
        { icon: '🌅', name: 'Tema Sunset', price: 500, type: 'theme' },
        { icon: '👨', name: 'Avatar Herói', price: 300, type: 'avatar' },
        { icon: '👩', name: 'Avatar Mágica', price: 300, type: 'avatar' }
    ];

    container.innerHTML = `
        <div style="padding: 20px;">
            <div style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 100, 200, 0.1) 100%); padding: 24px; border-radius: 12px; border: 1px solid rgba(0, 212, 255, 0.2);">
                <div style="font-weight: 700; color: #00d4ff; margin-bottom: 20px; font-size: 18px;">🛒 Loja</div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
                    ${items.map(item => `
                        <div style="background: rgba(0, 212, 255, 0.05); padding: 16px; border-radius: 8px; border: 1px solid rgba(0, 212, 255, 0.1); text-align: center;">
                            <div style="font-size: 32px; margin-bottom: 8px;">${item.icon}</div>
                            <div style="font-weight: 700; color: #cbd5e0; font-size: 14px; margin-bottom: 8px;">${item.name}</div>
                            <div style="color: #00d4ff; font-weight: 700; margin-bottom: 12px;">💰 ${item.price}</div>
                            <button style="width: 100%; padding: 8px; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); color: #000; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 12px;">
                                COMPRAR
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// RENDERIZAR ROLETA PADRÃO
// ============================================================
function renderDefaultRoulette() {
    const container = document.querySelector('[data-tab="roulette"]');
    if (!container) return;

    container.innerHTML = `
        <div style="padding: 20px;">
            <div style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 100, 200, 0.1) 100%); padding: 24px; border-radius: 12px; border: 1px solid rgba(0, 212, 255, 0.2); text-align: center;">
                <div style="font-size: 64px; margin-bottom: 16px;">🎡</div>
                <div style="font-weight: 700; color: #00d4ff; margin-bottom: 8px; font-size: 18px;">Roleta da Sorte</div>
                <div style="color: #a0aec0; margin-bottom: 20px;">
                    <p>Jogue TermoCore para ganhar tickets!</p>
                    <p style="font-size: 12px;">Use os tickets para girar a roleta e ganhar prêmios incríveis.</p>
                </div>
                <button style="padding: 12px 24px; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); color: #000; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 14px;">
                    🎮 Jogar TermoCore
                </button>
            </div>
        </div>
    `;
}

// ============================================================
// INICIALIZAR CONTEÚDO PADRÃO
// ============================================================
function initializeDefaultContent() {
    try {
        console.log('📝 Renderizando conteúdo padrão das abas...');
        
        renderDefaultProfile();
        renderDefaultSocial();
        renderDefaultAchievements();
        renderDefaultShop();
        renderDefaultRoulette();
        
        // Renderizar Game Selector usando o componente
        if (typeof gameSelectorUI !== 'undefined') {
            gameSelectorUI.renderGameSelector();
        }
        
        console.log('✅ Conteúdo padrão renderizado com sucesso');
    } catch (error) {
        console.error('❌ Erro ao renderizar conteúdo padrão:', error);
    }
}
