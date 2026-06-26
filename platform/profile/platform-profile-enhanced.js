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
        
        // Estado dos filtros (usando variáveis globais simples para persistência na sessão)
        if (window.currentInventoryTab === undefined) window.currentInventoryTab = 'avatar';
        if (window.currentInventoryGameFilter === undefined) window.currentInventoryGameFilter = 'all';

        // Filtrar inventário
        const filteredInventory = inventory.filter(item => {
            // Regra 1: Temas de jogos não aparecem no inventário global (apenas temas da plataforma)
            if (item.type === 'theme' && item.gameId !== 'platform') return false;
            
            // Regra 2: Aba ativa
            if (item.type !== window.currentInventoryTab) return false;
            
            // Regra 3: Filtro por jogo (apenas para avatares)
            if (window.currentInventoryTab === 'avatar' && window.currentInventoryGameFilter !== 'all') {
                if (item.gameId !== window.currentInventoryGameFilter) return false;
            }
            
            return true;
        });

        // Obter lista de jogos únicos que possuem avatares no inventário
        const gamesWithAvatars = [...new Set(inventory.filter(i => i.type === 'avatar').map(i => i.gameId))];

        // Renderizar perfil
        container.innerHTML = `
            <div style="padding: 20px;">
                <!-- HEADER DO PERFIL -->
                <div style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 100, 200, 0.1) 100%); padding: 24px; border-radius: 12px; border: 1px solid rgba(0, 212, 255, 0.2); margin-bottom: 20px;">
                    
                    <!-- AVATAR E NOME -->
                    <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 20px;">
                        <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); display: flex; align-items: center; justify-content: center; font-size: 50px; border: 3px solid rgba(0, 212, 255, 0.3); overflow: hidden; position: relative;">
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
                
                <!-- INVENTÁRIO MELHORADO -->
                <div style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 100, 200, 0.1) 100%); padding: 24px; border-radius: 12px; border: 1px solid rgba(0, 212, 255, 0.2);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
                        <div style="font-weight: 700; color: #00d4ff; font-size: 18px;">📦 Inventário Global</div>
                        
                        <!-- CATEGORIAS -->
                        <div style="display: flex; gap: 8px; background: rgba(0,0,0,0.2); padding: 4px; border-radius: 8px;">
                            <button onclick="window.currentInventoryTab='avatar'; renderEnhancedProfile()" style="padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.3s ease; background: ${window.currentInventoryTab === 'avatar' ? '#00d4ff' : 'transparent'}; color: ${window.currentInventoryTab === 'avatar' ? '#000' : '#a0aec0'};">Avatares</button>
                            <button onclick="window.currentInventoryTab='cosmetic'; renderEnhancedProfile()" style="padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.3s ease; background: ${window.currentInventoryTab === 'cosmetic' ? '#00d4ff' : 'transparent'}; color: ${window.currentInventoryTab === 'cosmetic' ? '#000' : '#a0aec0'};">Cosméticos</button>
                            <button onclick="window.currentInventoryTab='theme'; renderEnhancedProfile()" style="padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: all 0.3s ease; background: ${window.currentInventoryTab === 'theme' ? '#00d4ff' : 'transparent'}; color: ${window.currentInventoryTab === 'theme' ? '#000' : '#a0aec0'};">Temas</button>
                        </div>
                    </div>

                    <!-- FILTRO POR JOGO (Apenas para Avatares) -->
                    ${window.currentInventoryTab === 'avatar' && gamesWithAvatars.length > 0 ? `
                        <div style="margin-bottom: 20px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                            <span style="color: #a0aec0; font-size: 12px;">Filtrar por jogo:</span>
                            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                                <button onclick="window.currentInventoryGameFilter='all'; renderEnhancedProfile()" style="padding: 4px 10px; border: 1px solid ${window.currentInventoryGameFilter === 'all' ? '#00d4ff' : 'rgba(0, 212, 255, 0.2)'}; border-radius: 4px; cursor: pointer; font-size: 11px; background: ${window.currentInventoryGameFilter === 'all' ? 'rgba(0, 212, 255, 0.1)' : 'transparent'}; color: ${window.currentInventoryGameFilter === 'all' ? '#00d4ff' : '#a0aec0'};">Todos</button>
                                ${gamesWithAvatars.map(game => `
                                    <button onclick="window.currentInventoryGameFilter='${game}'; renderEnhancedProfile()" style="padding: 4px 10px; border: 1px solid ${window.currentInventoryGameFilter === game ? '#00d4ff' : 'rgba(0, 212, 255, 0.2)'}; border-radius: 4px; cursor: pointer; font-size: 11px; background: ${window.currentInventoryGameFilter === game ? 'rgba(0, 212, 255, 0.1)' : 'transparent'}; color: ${window.currentInventoryGameFilter === game ? '#00d4ff' : '#a0aec0'};">${game.charAt(0).toUpperCase() + game.slice(1)}</button>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    ${filteredInventory.length > 0 ? `
                        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 12px;">
                            ${filteredInventory.map(item => `
                                <div style="background: rgba(0, 212, 255, 0.05); padding: 12px; border-radius: 8px; border: 2px solid ${item.isActive ? 'rgba(0, 212, 255, 0.5)' : 'rgba(0, 212, 255, 0.1)'}; text-align: center; cursor: pointer; transition: all 0.3s ease; position: relative;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                    <div style="width: 60px; height: 60px; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; font-size: 32px; background: rgba(0,0,0,0.2); border-radius: 8px; overflow: hidden;">
                                        ${item.avatarUrl ? `<img src="${item.avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;">` : item.icon}
                                    </div>
                                    <div style="color: #cbd5e0; font-size: 11px; font-weight: 600; word-break: break-word; margin-bottom: 2px;">${item.name}</div>
                                    <div style="color: #a0aec0; font-size: 9px; text-transform: uppercase; letter-spacing: 1px;">${item.gameId}</div>
                                    ${item.isActive ? '<div style="color: #10b981; font-size: 10px; margin-top: 6px; font-weight: 700;">✓ EQUIPADO</div>' : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div style="text-align: center; color: #a0aec0; padding: 40px; background: rgba(0,0,0,0.1); border-radius: 8px;">
                            <div style="font-size: 40px; margin-bottom: 12px;">📦</div>
                            <p>Nenhum item encontrado nesta categoria</p>
                            ${window.currentInventoryTab === 'theme' ? '<p style="font-size: 11px; margin-top: 8px;">Nota: Apenas temas da plataforma aparecem aqui.</p>' : ''}
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
