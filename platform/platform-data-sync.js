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
    // Fórmula: Cada nível requer 100 * nível de XP
    // Nível 1: 0-99 XP
    // Nível 2: 100-299 XP
    // Nível 3: 300-599 XP
    let level = 1;
    let totalXpRequired = 0;
    
    while (true) {
        const xpForNextLevel = 100 * level;
        if (totalXpRequired + xpForNextLevel > xp) {
            break;
        }
        totalXpRequired += xpForNextLevel;
        level++;
    }
    
    const xpInCurrentLevel = xp - totalXpRequired;
    const xpNeededForNextLevel = 100 * level;
    
    return {
        level,
        currentXP: xpInCurrentLevel,
        totalXP: xp,
        xpForNextLevel: xpNeededForNextLevel,
        progressPercent: Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100)
    };
}

// ============================================================
// OBTER AVATAR DO USUÁRIO
// ============================================================
async function getUserAvatar(userId) {
    try {
        const client = getSupabaseClient();
        if (!client) return '👤';
        
        // Buscar avatar ativo do usuário
        const { data, error } = await client
            .from('shop_items')
            .select('item_id')
            .eq('user_id', userId)
            .eq('is_active', true)
            .like('item_id', 'avatar_%')
            .single();
        
        if (error || !data) {
            console.log('ℹ️ Usando avatar padrão');
            return '👤';
        }
        
        // Mapear item_id para emoji
        const avatarMap = {
            'avatar_hero': '🦸',
            'avatar_wizard': '🧙',
            'avatar_pirate': '🏴‍☠️',
            'avatar_astronaut': '🧑‍🚀',
            'avatar_robot': '🤖',
            'avatar_alien': '👽'
        };
        
        return avatarMap[data.item_id] || '👤';
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
        
        // Mapear itens para formato amigável
        return data.map(item => ({
            id: item.item_id,
            name: formatItemName(item.item_id),
            type: getItemType(item.item_id),
            isActive: item.is_active,
            icon: getItemIcon(item.item_id)
        }));
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
    if (itemId.startsWith('frame_')) return 'frame';
    if (itemId.startsWith('cosmetic_')) return 'cosmetic';
    return 'other';
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
                    userData.spinTickets = stats.spinTickets;
                    
                    localStorage.setItem('cg_current_user', JSON.stringify(userData));
                    console.log('🔄 Dados sincronizados com sucesso');
                }
            } catch (error) {
                console.error('❌ Erro ao sincronizar dados:', error);
            }
        }
    }, 30000);
}
