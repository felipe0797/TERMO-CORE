/**
 * PLATFORM SHOP ENHANCED
 * Loja melhorada com temas equipáveis e sistema de compra funcional
 */

// ============================================================
// RENDERIZAR LOJA MELHORADA
// ============================================================
async function renderEnhancedShop() {
    const container = document.querySelector('[data-tab="shop"]');
    if (!container) return;
    
    try {
        const platformUser = localStorage.getItem('cg_current_user');
        if (!platformUser) {
            container.innerHTML = '<p>Usuário não autenticado</p>';
            return;
        }
        
        const userData = JSON.parse(platformUser);
        const stats = await loadUserDataFromTermoCore(userData.id);
        const inventory = await getUserInventory(userData.id);
        const currentTheme = await getUserActiveTheme(userData.id);
        
        // Temas disponíveis
        const themes = [
            {
                id: 'theme_default',
                name: 'Padrão',
                description: 'Tema clássico da plataforma',
                price: 0,
                icon: '🎨',
                colors: '#00d4ff'
            },
            {
                id: 'theme_neon',
                name: 'Neon',
                description: 'Tema futurista com cores neon',
                price: 500,
                icon: '⚡',
                colors: '#ff00ff'
            },
            {
                id: 'theme_sunset',
                name: 'Sunset',
                description: 'Tema quente com cores do pôr do sol',
                price: 500,
                icon: '🌅',
                colors: '#ff6b6b'
            }
        ];
        
        // Renderizar loja
        container.innerHTML = `
            <div style="padding: 20px;">
                <!-- HEADER COM MOEDAS -->
                <div style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 100, 200, 0.1) 100%); padding: 16px; border-radius: 12px; border: 1px solid rgba(0, 212, 255, 0.2); margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
                    <div style="font-weight: 700; color: #00d4ff; font-size: 16px;">🛒 Loja da Plataforma</div>
                    <div style="color: #00d4ff; font-weight: 700;">💰 ${stats?.coins || 0} Moedas</div>
                </div>
                
                <!-- TEMAS -->
                <div style="margin-bottom: 20px;">
                    <div style="font-weight: 700; color: #00d4ff; margin-bottom: 16px; font-size: 14px;">🎨 Temas</div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                        ${themes.map(theme => {
                            const isOwned = inventory.some(item => item.id === theme.id);
                            const isActive = currentTheme === theme.id;
                            
                            return `
                                <div style="background: rgba(0, 212, 255, 0.05); padding: 16px; border-radius: 8px; border: 2px solid ${isActive ? 'rgba(0, 212, 255, 0.5)' : 'rgba(0, 212, 255, 0.1)'}; transition: all 0.3s ease;">
                                    <div style="font-size: 32px; margin-bottom: 8px; text-align: center;">${theme.icon}</div>
                                    <div style="font-weight: 700; color: #cbd5e0; margin-bottom: 4px;">${theme.name}</div>
                                    <div style="color: #a0aec0; font-size: 12px; margin-bottom: 12px;">${theme.description}</div>
                                    
                                    ${isActive ? `
                                        <div style="width: 100%; padding: 10px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border: none; border-radius: 6px; font-weight: 700; cursor: default; text-align: center;">
                                            ✓ ATIVO
                                        </div>
                                    ` : isOwned ? `
                                        <button onclick="equipThemeOnPlatform('${userData.id}', '${theme.id}')" style="width: 100%; padding: 10px; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); color: #000; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                            EQUIPAR
                                        </button>
                                    ` : `
                                        <button onclick="buyThemeFromShop('${userData.id}', '${theme.id}', ${theme.price})" style="width: 100%; padding: 10px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                                            💰 ${theme.price} Moedas
                                        </button>
                                    `}
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <!-- AVISO -->
                <div style="background: rgba(0, 212, 255, 0.05); padding: 16px; border-radius: 8px; border: 1px solid rgba(0, 212, 255, 0.1); text-align: center;">
                    <p style="color: #a0aec0; font-size: 12px;">Mais itens em breve! Jogue TermoCore para ganhar moedas.</p>
                </div>
            </div>
        `;
        
        console.log('✅ Loja renderizada com sucesso');
    } catch (error) {
        console.error('❌ Erro ao renderizar loja:', error);
        container.innerHTML = '<p>Erro ao carregar loja</p>';
    }
}

// ============================================================
// COMPRAR TEMA
// ============================================================
async function buyThemeFromShop(userId, themeId, price) {
    try {
        const platformUser = localStorage.getItem('cg_current_user');
        if (!platformUser) {
            showToast('Usuário não autenticado', 'error');
            return;
        }
        
        const userData = JSON.parse(platformUser);
        const stats = await loadUserDataFromTermoCore(userId);
        
        // Verificar se tem moedas suficientes
        if (!stats || stats.coins < price) {
            showToast(`❌ Moedas insuficientes! Você tem ${stats?.coins || 0}, precisa de ${price}`, 'error');
            return;
        }
        
        // Chamar função para comprar
        const client = getSupabaseClient();
        if (!client) {
            showToast('Erro ao conectar com banco de dados', 'error');
            return;
        }
        
        // Debitar moedas
        const newCoins = stats.coins - price;
        const { error: updateError } = await client
            .from('game_stats')
            .update({ coins: newCoins })
            .eq('user_id', userId);
        
        if (updateError) {
            showToast('Erro ao processar compra', 'error');
            return;
        }
        
        // Adicionar item ao inventário
        const { error: insertError } = await client
            .from('shop_items')
            .insert({
                user_id: userId,
                item_id: themeId,
                is_active: false
            });
        
        if (insertError) {
            showToast('Erro ao adicionar item ao inventário', 'error');
            return;
        }
        
        // Atualizar localStorage
        userData.coins = newCoins;
        localStorage.setItem('cg_current_user', JSON.stringify(userData));
        
        showToast(`✅ Tema "${themeId}" comprado com sucesso!`, 'success');
        
        // Recarregar loja
        setTimeout(() => {
            renderEnhancedShop();
        }, 500);
    } catch (error) {
        console.error('❌ Erro ao comprar tema:', error);
        showToast('Erro ao comprar tema', 'error');
    }
}

// ============================================================
// ATUALIZAR LOJA PERIODICAMENTE
// ============================================================
function startShopUpdateInterval() {
    setInterval(async () => {
        const activeTab = document.querySelector('[data-tab].active');
        if (activeTab && activeTab.getAttribute('data-tab') === 'shop') {
            await renderEnhancedShop();
        }
    }, 10000);
}
