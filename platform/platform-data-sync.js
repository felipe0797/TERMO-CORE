/**
 * PLATFORM DATA SYNC
 * Sincroniza dados reais do TermoCore com a plataforma
 * Garante que XP, Moedas, Fichas, Avatar e Tema apareçam corretamente
 */

// ============================================================
// CARREGAR DADOS REAIS DO USUÁRIO DO TERMOCORE
// ============================================================
async function loadUserDataFromTermoCore(userId) {
    try {
        console.log('📊 Carregando dados do usuário do TermoCore...');
        
        // Chamar a função do TermoCore para carregar stats
        if (typeof loadUserStatsFromSupabase === 'function') {
            const stats = await loadUserStatsFromSupabase(userId);
            if (stats) {
                console.log('✅ Dados carregados do TermoCore:', stats);
                return stats;
            }
        }
        
        console.warn('⚠️ Não conseguiu carregar dados do TermoCore');
        return null;
    } catch (error) {
        console.error('❌ Erro ao carregar dados do TermoCore:', error);
        return null;
    }
}

// ============================================================
// CALCULAR NÍVEL A PARTIR DO XP
// ============================================================
function calculateLevelFromXP(xp) {
    // Sincronizado com TermoCore (script.js:556)
    const level = Math.floor(Math.pow(xp / 100, 1/1.5)) || 1;
    const currentLevelXP = Math.round(100 * Math.pow(level, 1.5));
    const nextLevelXP    = Math.round(100 * Math.pow(level + 1, 1.5));
    const progressXP     = xp - currentLevelXP;
    const neededXP       = nextLevelXP - currentLevelXP;
    
    return {
        level: level,
        currentXP: xp,
        xpForNextLevel: nextLevelXP,
        progressPercent: Math.min(100, (progressXP / neededXP) * 100)
    };
}

// ============================================================
// OBTER AVATAR DO USUÁRIO
// ============================================================
async function getUserAvatar(userId) {
    try {
        // Se estivermos no contexto da plataforma, tentar usar a lógica do TermoCore
        if (typeof getAvatarDisplay === 'function') {
            const platformUser = localStorage.getItem('cg_current_user');
            let username = 'Usuário';
            if (platformUser) {
                const userData = JSON.parse(platformUser);
                username = userData.username || userData.email.split('@')[0];
            }
            
            // Garantir que os stats do usuário estejam carregados para o getAvatarDisplay
            if (typeof loadUserStatsFromSupabase === 'function') {
                const stats = await loadUserStatsFromSupabase(userId);
                if (stats) {
                    // Temporariamente injetar no escopo global se necessário, 
                    // ou passar como override se a função permitir
                    return getAvatarDisplay(username, {
                        activeAvatarVariant: stats.activeAvatarVariant,
                        activeCosmetics: stats.activeCosmetics
                    });
                }
            }
            return getAvatarDisplay(username);
        }

        // Fallback simplificado se a função do TermoCore não estiver disponível
        return '<div style="font-size: 50px;">👤</div>';
    } catch (error) {
        console.error('❌ Erro ao obter avatar:', error);
        return '👤';
    }
}

// ============================================================
// OBTER TEMA ATIVO DO USUÁRIO
// ============================================================
async function getUserActiveTheme(userId) {
    try {
        const client = getSupabaseClient();
        if (!client) return 'theme_default';
        
        // Buscar tema ativo
        const { data, error } = await client
            .from('game_stats')
            .select('active_theme')
            .eq('user_id', userId)
            .single();
        
        if (error || !data) {
            return 'theme_default';
        }
        
        return data.active_theme || 'theme_default';
    } catch (error) {
        console.error('❌ Erro ao obter tema:', error);
        return 'theme_default';
    }
}

// ============================================================
// EQUIPAR TEMA NA PLATAFORMA
// ============================================================
async function equipThemeOnPlatform(userId, themeId) {
    try {
        const client = getSupabaseClient();
        if (!client) {
            showToast('Erro ao equipar tema', 'error');
            return false;
        }
        
        // Atualizar tema ativo
        const { error } = await client
            .from('game_stats')
            .update({ active_theme: themeId })
            .eq('user_id', userId);
        
        if (error) {
            console.error('❌ Erro ao equipar tema:', error);
            showToast('Erro ao equipar tema', 'error');
            return false;
        }
        
        // Aplicar tema visualmente
        applyThemeToDOM(themeId);
        showToast('✅ Tema equipado com sucesso!', 'success');
        return true;
    } catch (error) {
        console.error('❌ Erro ao equipar tema:', error);
        showToast('Erro ao equipar tema', 'error');
        return false;
    }
}

// ============================================================
// APLICAR TEMA AO DOM
// ============================================================
function applyThemeToDOM(themeId) {
    const themes = {
        'theme_default': {
            primary: '#00d4ff',
            secondary: '#0099cc',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
        },
        'theme_neon': {
            primary: '#ff00ff',
            secondary: '#00ffff',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 100%)'
        },
        'theme_sunset': {
            primary: '#ff6b6b',
            secondary: '#ffa500',
            background: 'linear-gradient(135deg, #2c1810 0%, #4a2c1a 100%)'
        }
    };
    
    const theme = themes[themeId] || themes['theme_default'];
    
    // Aplicar variáveis CSS
    document.documentElement.style.setProperty('--primary-color', theme.primary);
    document.documentElement.style.setProperty('--secondary-color', theme.secondary);
    
    // Atualizar background se necessário
    const body = document.body;
    if (body) {
        body.style.background = theme.background;
    }
    
    console.log('✅ Tema aplicado:', themeId);
}

// ============================================================
// OBTER INVENTÁRIO DO USUÁRIO
// ============================================================
async function getUserInventory(userId) {
    try {
        const client = getSupabaseClient();
        if (!client) return [];
        
        // Buscar todos os itens possuídos pelo usuário
        const { data, error } = await client
            .from('shop_items')
            .select('item_id, is_active')
            .eq('user_id', userId);
        
        if (error || !data) {
            console.log('ℹ️ Nenhum item no inventário');
            return [];
        }
        
        // Mapear itens para formato amigável com suporte a metadados de jogo
        return data.map(item => {
            const type = getItemType(item.item_id);
            const gameId = getItemGameId(item.item_id);
            
            // Tentar obter dados ricos do SHOP_ITEMS se disponível
            let richData = {};
            if (typeof SHOP_ITEMS !== 'undefined') {
                const shopItem = SHOP_ITEMS.find(i => i.id === item.item_id);
                if (shopItem) {
                    richData = {
                        name: shopItem.name,
                        icon: shopItem.icon,
                        avatarUrl: shopItem.avatarUrl,
                        category: shopItem.category
                    };
                }
            }

            return {
                id: item.item_id,
                name: richData.name || formatItemName(item.item_id),
                type: type,
                gameId: gameId,
                isActive: item.is_active,
                icon: richData.icon || getItemIcon(item.item_id),
                avatarUrl: richData.avatarUrl,
                category: richData.category || type
            };
        });
    } catch (error) {
        console.error('❌ Erro ao obter inventário:', error);
        return [];
    }
}

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================
function formatItemName(itemId) {
    return itemId
        .replace(/_/g, ' ')
        .replace(/^[a-z]/, char => char.toUpperCase())
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function getItemType(itemId) {
    if (itemId.startsWith('theme_')) return 'theme';
    if (itemId.startsWith('avatar_')) return 'avatar';
    if (itemId.startsWith('frame_')) return 'cosmetic'; // Frames são cosméticos
    if (itemId.startsWith('cosmetic_')) return 'cosmetic';
    if (itemId.startsWith('var_')) return 'avatar';
    return 'other';
}

function getItemGameId(itemId) {
    // Por enquanto, quase tudo vem do TermoCore
    // Temas da plataforma começam com theme_ mas são específicos
    const platformThemes = ['theme_default', 'theme_neon', 'theme_sunset'];
    if (platformThemes.includes(itemId)) return 'platform';
    
    // Itens do TermoCore (baseado no catálogo conhecido)
    const termocorePrefixes = ['avatar_toon_', 'avatar_croo_', 'avatar_ears_', 'avatar_boots_', 'cosmetic_frame_'];
    if (termocorePrefixes.some(p => itemId.startsWith(p))) return 'termocore';
    
    // Fallback: se for tema e não for da plataforma, provavelmente é de um jogo (mas o usuário disse que temas de jogos não aparecem)
    if (itemId.startsWith('theme_')) return 'termocore';
    
    return 'termocore'; // Default para o jogo atual
}

function getItemIcon(itemId) {
    const iconMap = {
        'theme_': '🎨',
        'avatar_': '👤',
        'frame_': '🖼️',
        'cosmetic_': '✨'
    };
    
    for (const [prefix, icon] of Object.entries(iconMap)) {
        if (itemId.startsWith(prefix)) return icon;
    }
    
    return '📦';
}

// ============================================================
// SINCRONIZAR DADOS PERIODICAMENTE
// ============================================================
function startDataSyncInterval() {
    // Sincronizar dados a cada 30 segundos
    setInterval(async () => {
        const platformUser = localStorage.getItem('cg_current_user');
        if (platformUser) {
            try {
                const userData = JSON.parse(platformUser);
                const stats = await loadUserDataFromTermoCore(userData.id);
                
                if (stats) {
                    // Atualizar localStorage com dados reais
                    userData.xp = stats.xp;
                    userData.coins = stats.coins;
                    userData.spinTickets = stats.spinTickets || stats.spin_tickets || 0;
                    
                    localStorage.setItem('cg_current_user', JSON.stringify(userData));
                    
                    // Se estivermos na aba perfil, forçar re-render para mostrar dados novos
                    const activeTab = document.querySelector('.nav-btn.active')?.getAttribute('data-tab');
                    if (activeTab === 'profile' && typeof renderEnhancedProfile === 'function') {
                        renderEnhancedProfile();
                    }
                    
                    console.log('🔄 Dados sincronizados com sucesso');
                }
            } catch (error) {
                console.error('❌ Erro ao sincronizar dados:', error);
            }
        }
    }, 30000);
}
