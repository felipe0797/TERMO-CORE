/**
 * CONTEÚDO PADRÃO DAS ABAS
 * Renderiza conteúdo padrão quando as abas não têm dados
 */

// ============================================================
// RENDERIZAR PERFIL PADRÃO
// ============================================================
function renderDefaultProfile() {
    const container = document.getElementById('profile-container');
    if (!container) return;

    const level = getLevelInfo(userStats.xp || 0).level;
    const username = currentUser || 'Usuário';

    container.innerHTML = `
        <div class="card">
            <div class="section-title">👤 Meu Perfil</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                <div style="text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 10px;">👨‍💼</div>
                    <div style="color: #00d4ff; font-weight: 700; font-size: 18px;">${username}</div>
                    <div style="color: #a0aec0; font-size: 14px;">Nível ${level}</div>
                </div>
                <div style="display: flex; flex-direction: column; justify-content: center; gap: 12px;">
                    <div style="background: rgba(0, 212, 255, 0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(0, 212, 255, 0.2);">
                        <div style="color: #a0aec0; font-size: 12px; text-transform: uppercase;">XP Total</div>
                        <div style="color: #00d4ff; font-weight: 700; font-size: 18px;">${userStats.xp || 0}</div>
                    </div>
                    <div style="background: rgba(0, 212, 255, 0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(0, 212, 255, 0.2);">
                        <div style="color: #a0aec0; font-size: 12px; text-transform: uppercase;">Moedas</div>
                        <div style="color: #00d4ff; font-weight: 700; font-size: 18px;">💰 ${userStats.coins || 0}</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="section-title">📊 Estatísticas</div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin: 16px 0;">
                <div style="background: rgba(0, 212, 255, 0.05); padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="color: #a0aec0; font-size: 12px; margin-bottom: 8px;">Jogos Jogados</div>
                    <div style="color: #00d4ff; font-weight: 700; font-size: 20px;">${userStats.totalGames || 0}</div>
                </div>
                <div style="background: rgba(0, 212, 255, 0.05); padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="color: #a0aec0; font-size: 12px; margin-bottom: 8px;">Nível</div>
                    <div style="color: #00d4ff; font-weight: 700; font-size: 20px;">${level}</div>
                </div>
                <div style="background: rgba(0, 212, 255, 0.05); padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="color: #a0aec0; font-size: 12px; margin-bottom: 8px;">Itens</div>
                    <div style="color: #00d4ff; font-weight: 700; font-size: 20px;">${(userStats.ownedItems || []).length}</div>
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// RENDERIZAR SOCIAL PADRÃO
// ============================================================
function renderDefaultSocial() {
    const container = document.getElementById('social-container');
    if (!container) return;

    container.innerHTML = `
        <div class="card">
            <div class="section-title">👥 Social</div>
            <div style="text-align: center; padding: 40px 20px; color: #a0aec0;">
                <div style="font-size: 48px; margin-bottom: 16px;">👫</div>
                <p>Nenhum amigo adicionado ainda.</p>
                <p style="font-size: 14px; margin-top: 8px;">Convide seus amigos para jogar!</p>
                <button class="btn-primary" style="margin-top: 16px; padding: 10px 24px;">Adicionar Amigo</button>
            </div>
        </div>

        <div class="card">
            <div class="section-title">📨 Convites Pendentes</div>
            <div style="text-align: center; padding: 40px 20px; color: #a0aec0;">
                <p>Você não tem convites pendentes.</p>
            </div>
        </div>
    `;
}

// ============================================================
// RENDERIZAR CONQUISTAS PADRÃO
// ============================================================
function renderDefaultAchievements() {
    const container = document.getElementById('achievements-container');
    if (!container) return;

    const achievements = [
        { icon: '🎮', name: 'Primeira Vitória', desc: 'Ganhe seu primeiro jogo', unlocked: false },
        { icon: '⭐', name: 'Perfeição', desc: 'Ganhe um jogo em 1 tentativa', unlocked: false },
        { icon: '📈', name: 'Escalador', desc: 'Atinja o nível 10', unlocked: false },
        { icon: '🏆', name: 'Veterano', desc: 'Jogue 100 vezes', unlocked: false },
        { icon: '💎', name: 'Colecionador', desc: 'Compre 5 itens na loja', unlocked: false },
        { icon: '👥', name: 'Social', desc: 'Adicione 5 amigos', unlocked: false }
    ];

    container.innerHTML = `
        <div class="card">
            <div class="section-title">🏆 Conquistas</div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin: 16px 0;">
                ${achievements.map((ach, idx) => `
                    <div style="background: rgba(0, 212, 255, 0.05); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 16px; text-align: center; opacity: ${ach.unlocked ? '1' : '0.5'};">
                        <div style="font-size: 32px; margin-bottom: 8px;">${ach.icon}</div>
                        <div style="color: #cbd5e0; font-weight: 600; font-size: 14px; margin-bottom: 4px;">${ach.name}</div>
                        <div style="color: #718096; font-size: 12px;">${ach.desc}</div>
                        ${ach.unlocked ? '<div style="color: #10b981; font-size: 12px; margin-top: 8px;">✓ Desbloqueado</div>' : '<div style="color: #718096; font-size: 12px; margin-top: 8px;">Bloqueado</div>'}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ============================================================
// RENDERIZAR LOJA PADRÃO
// ============================================================
function renderDefaultShop() {
    const container = document.getElementById('shop-container');
    if (!container) return;

    const items = [
        { icon: '🎨', name: 'Tema Neon', desc: 'Tema com cores neon vibrantes', price: 500, type: 'theme' },
        { icon: '🌅', name: 'Tema Sunset', desc: 'Cores quentes do pôr do sol', price: 500, type: 'theme' },
        { icon: '🌲', name: 'Tema Floresta', desc: 'Tons verdes naturais', price: 500, type: 'theme' },
        { icon: '👨', name: 'Avatar Azul', desc: 'Avatar com cor azul', price: 300, type: 'avatar' },
        { icon: '👨', name: 'Avatar Vermelho', desc: 'Avatar com cor vermelha', price: 300, type: 'avatar' },
        { icon: '👨', name: 'Avatar Verde', desc: 'Avatar com cor verde', price: 300, type: 'avatar' }
    ];

    container.innerHTML = `
        <div class="card">
            <div class="section-title">🛒 Loja</div>
            <div style="color: #a0aec0; margin-bottom: 20px;">Moedas disponíveis: <span style="color: #00d4ff; font-weight: 700;">💰 ${userStats.coins || 0}</span></div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                ${items.map((item, idx) => `
                    <div style="background: rgba(0, 212, 255, 0.05); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 16px;">
                        <div style="font-size: 32px; margin-bottom: 8px;">${item.icon}</div>
                        <div style="color: #cbd5e0; font-weight: 600; margin-bottom: 4px;">${item.name}</div>
                        <div style="color: #718096; font-size: 12px; margin-bottom: 12px;">${item.desc}</div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #00d4ff; font-weight: 700;">💰 ${item.price}</span>
                            <button class="btn-primary" style="padding: 6px 12px; font-size: 12px;">Comprar</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// ============================================================
// RENDERIZAR ROLETA PADRÃO
// ============================================================
function renderDefaultRoulette() {
    const container = document.getElementById('roulette-container');
    if (!container) return;

    container.innerHTML = `
        <div class="card">
            <div class="section-title">🎡 Roleta da Sorte</div>
            <div style="text-align: center; padding: 40px 20px;">
                <div style="font-size: 64px; margin-bottom: 16px;">🎡</div>
                <p style="color: #cbd5e0; margin-bottom: 16px;">Gire a roleta e ganhe prêmios incríveis!</p>
                <div style="background: rgba(0, 212, 255, 0.1); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <div style="color: #a0aec0; font-size: 12px; text-transform: uppercase; margin-bottom: 8px;">Fichas Disponíveis</div>
                    <div style="color: #00d4ff; font-weight: 700; font-size: 24px;">🎟️ ${userStats.tickets || 1}</div>
                </div>
                <button class="btn-primary" style="padding: 12px 32px; font-size: 16px; margin-top: 16px;">Girar Roleta</button>
                <p style="color: #718096; font-size: 12px; margin-top: 16px;">1 ficha por giro | Ganhe moedas, XP e itens!</p>
            </div>
        </div>
    `;
}

// ============================================================
// INICIALIZAR CONTEÚDO PADRÃO
// ============================================================
function initializeDefaultContent() {
    renderDefaultProfile();
    renderDefaultSocial();
    renderDefaultAchievements();
    renderDefaultShop();
    renderDefaultRoulette();
}
