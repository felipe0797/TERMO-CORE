/**
 * PLATFORM PROFILE ENHANCED
 * Perfil melhorado da plataforma com dados reais do TermoCore
 * Inclui: Avatar, XP, Nível, Moedas, Fichas, Inventário
 */

// ============================================================
// RENDERIZAR PERFIL COMPLETO DA PLATAFORMA
// ============================================================
async function renderEnhancedProfile() {
    const container = document.querySelector('[data-tab="profile"]');
    if (!container) return;
    
    try {
        const platformUser = localStorage.getItem('cg_current_user');
        if (!platformUser) {
            container.innerHTML = '<p>Usuário não autenticado</p>';
            return;
        }
        
        const userData = JSON.parse(platformUser);
        
        // Carregar dados reais do TermoCore
        const stats = await loadUserDataFromTermoCore(userData.id);
        const avatar = await getUserAvatar(userData.id);
        const inventory = await getUserInventory(userData.id);
        
        // Calcular nível a partir do XP
        const levelInfo = calculateLevelFromXP(stats?.xp || 0);
        
        // Renderizar perfil
        container.innerHTML = `
            <div style="padding: 20px;">
                <!-- HEADER DO PERFIL -->
                <div style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 100, 200, 0.1) 100%); padding: 24px; border-radius: 12px; border: 1px solid rgba(0, 212, 255, 0.2); margin-bottom: 20px;">
                    
                    <!-- AVATAR E NOME -->
                    <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px;">
                        <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); display: flex; align-items: center; justify-content: center; font-size: 50px; border: 3px solid rgba(0, 212, 255, 0.3);">
                            ${avatar}
                        </div>
                        <div>
                            <div style="font-size: 28px; font-weight: 700; color: #00d4ff; margin-bottom: 4px;">${userData.username}</div>
                            <div style="color: #a0aec0; font-size: 14px;">Nível ${levelInfo.level}</div>
                            <div style="color: #a0aec0; font-size: 12px; margin-top: 8px;">Jogador desde: ${new Date().toLocaleDateString('pt-BR')}</div>
                        </div>
                    </div>
                    
                    <!-- BARRA DE XP -->
                    <div style="margin-top: 16px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="color: #a0aec0; font-size: 12px;">Experiência</span>
                            <span style="color: #00d4ff; font-weight: 700; font-size: 12px;">${levelInfo.currentXP}/${levelInfo.xpForNextLevel} XP</span>
                        </div>
                        <div style="width: 100%; height: 8px; background: rgba(0, 212, 255, 0.1); border-radius: 4px; overflow: hidden;">
                            <div style="width: ${levelInfo.progressPercent}%; height: 100%; background: linear-gradient(90deg, #00d4ff 0%, #0099cc 100%); transition: width 0.3s ease;"></div>
                        </div>
                    </div>
                </div>
                
                <!-- STATS -->
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 20px;">
                    <div style="background: rgba(0, 212, 255, 0.05); padding: 16px; border-radius: 8px; border: 1px solid rgba(0, 212, 255, 0.1); text-align: center;">
                        <div style="font-size: 24px; margin-bottom: 8px;">⭐</div>
                        <div style="color: #a0aec0; font-size: 12px; margin-bottom: 4px;">XP Total</div>
                        <div style="color: #00d4ff; font-weight: 700; font-size: 18px;">${stats?.xp || 0}</div>
                    </div>
                    <div style="background: rgba(0, 212, 255, 0.05); padding: 16px; border-radius: 8px; border: 1px solid rgba(0, 212, 255, 0.1); text-align: center;">
                        <div style="font-size: 24px; margin-bottom: 8px;">💰</div>
                        <div style="color: #a0aec0; font-size: 12px; margin-bottom: 4px;">Moedas</div>
                        <div style="color: #00d4ff; font-weight: 700; font-size: 18px;">${stats?.coins || 0}</div>
                    </div>
                    <div style="background: rgba(0, 212, 255, 0.05); padding: 16px; border-radius: 8px; border: 1px solid rgba(0, 212, 255, 0.1); text-align: center;">
                        <div style="font-size: 24px; margin-bottom: 8px;">🎟️</div>
                        <div style="color: #a0aec0; font-size: 12px; margin-bottom: 4px;">Fichas</div>
                        <div style="color: #00d4ff; font-weight: 700; font-size: 18px;">${stats?.spinTickets || 0}</div>
                    </div>
                    <div style="background: rgba(0, 212, 255, 0.05); padding: 16px; border-radius: 8px; border: 1px solid rgba(0, 212, 255, 0.1); text-align: center;">
                        <div style="font-size: 24px; margin-bottom: 8px;">🎮</div>
                        <div style="color: #a0aec0; font-size: 12px; margin-bottom: 4px;">Jogos</div>
                        <div style="color: #00d4ff; font-weight: 700; font-size: 18px;">${stats?.totalGames || 0}</div>
                    </div>
                </div>
                
                <!-- INVENTÁRIO -->
                <div style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 100, 200, 0.1) 100%); padding: 24px; border-radius: 12px; border: 1px solid rgba(0, 212, 255, 0.2);">
                    <div style="font-weight: 700; color: #00d4ff; margin-bottom: 16px; font-size: 16px;">📦 Inventário</div>
                    
                    ${inventory.length > 0 ? `
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 12px;">
                            ${inventory.map(item => `
                                <div style="background: rgba(0, 212, 255, 0.05); padding: 12px; border-radius: 8px; border: 2px solid ${item.isActive ? 'rgba(0, 212, 255, 0.5)' : 'rgba(0, 212, 255, 0.1)'}; text-align: center; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                    <div style="font-size: 28px; margin-bottom: 8px;">${item.icon}</div>
                                    <div style="color: #a0aec0; font-size: 11px; word-break: break-word;">${item.name}</div>
                                    ${item.isActive ? '<div style="color: #10b981; font-size: 10px; margin-top: 4px; font-weight: 700;">✓ ATIVO</div>' : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div style="text-align: center; color: #a0aec0; padding: 20px;">
                            <p>Seu inventário está vazio</p>
                            <p style="font-size: 12px;">Compre itens na loja para equipá-los aqui!</p>
                        </div>
                    `}
                </div>
            </div>
        `;
        
        console.log('✅ Perfil renderizado com sucesso');
    } catch (error) {
        console.error('❌ Erro ao renderizar perfil:', error);
        container.innerHTML = '<p>Erro ao carregar perfil</p>';
    }
}

// ============================================================
// ATUALIZAR PERFIL PERIODICAMENTE
// ============================================================
function startProfileUpdateInterval() {
    setInterval(async () => {
        const activeTab = document.querySelector('[data-tab].active');
        if (activeTab && activeTab.getAttribute('data-tab') === 'profile') {
            await renderEnhancedProfile();
        }
    }, 10000); // Atualizar a cada 10 segundos se a aba estiver ativa
}
