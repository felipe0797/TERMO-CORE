/**
 * PLATFORM DATA SYNC v2.2
 * Camada de dados central da plataforma Core Games.
 * Usa exclusivamente as tabelas reais do TermoCore (game_stats, shop_items, friends).
 * NÃO depende de tabelas global_* (que não existem).
 */

// ============================================================
// CATÁLOGO DE ITENS DA PLATAFORMA (temas exclusivos da plataforma)
// Prefixo obrigatório: pf_theme_
// Esses itens NÃO aparecem no inventário do TermoCore.
// ============================================================
const PLATFORM_SHOP_CATALOG = [
    {
        id: 'pf_theme_default',
        name: 'Padrão',
        description: 'Tema clássico da plataforma Core Games.',
        price: 0,
        icon: '🎨',
        isDefault: true,
        colors: { primary: '#00d4ff', secondary: '#0099cc', bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }
    },
    {
        id: 'pf_theme_neon',
        name: 'Neon',
        description: 'Tema futurista com cores neon vibrantes.',
        price: 500,
        icon: '⚡',
        colors: { primary: '#ff00ff', secondary: '#00ffff', bg: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 100%)' }
    },
    {
        id: 'pf_theme_sunset',
        name: 'Sunset',
        description: 'Tema quente com as cores do pôr do sol.',
        price: 500,
        icon: '🌅',
        colors: { primary: '#ff6b6b', secondary: '#ffa500', bg: 'linear-gradient(135deg, #2c1810 0%, #4a2c1a 100%)' }
    },
    {
        id: 'pf_theme_midnight',
        name: 'Midnight',
        description: 'Tema escuro e elegante, inspirado na meia-noite.',
        price: 800,
        icon: '🌙',
        colors: { primary: '#a78bfa', secondary: '#7c3aed', bg: 'linear-gradient(135deg, #0f0f1a 0%, #1a1030 100%)' }
    }
];

// ============================================================
// CARREGAR DADOS REAIS DO USUÁRIO (game_stats)
// Retorna: { xp, coins, spinTickets, totalGames, activeTheme,
//            activeAvatarVariant, activeCosmetics }
// ============================================================
async function loadUserDataFromTermoCore(userId) {
    try {
        // Preferir a função completa do TermoCore (carrega tudo de uma vez)
        if (typeof loadUserStatsFromSupabase === 'function') {
            const stats = await loadUserStatsFromSupabase(userId);
            if (stats) return stats;
        }

        // Fallback direto ao Supabase
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        if (!client) return null;

        const { data, error } = await client
            .from('game_stats')
            .select('xp, coins, spin_tickets, total_games, active_theme, active_cosmetics')
            .eq('user_id', userId)
            .single();

        if (error || !data) return null;

        // Buscar avatar ativo em shop_items
        const { data: avatarRow } = await client
            .from('shop_items')
            .select('item_id')
            .eq('user_id', userId)
            .eq('is_active', true)
            .or('item_id.like.avatar_%,item_id.like.var_%')
            .limit(1)
            .maybeSingle();

        return {
            xp: data.xp || 0,
            coins: data.coins || 0,
            spinTickets: data.spin_tickets || 0,
            totalGames: data.total_games || 0,
            activeTheme: data.active_theme || 'theme_default',
            activeAvatarVariant: avatarRow?.item_id || null,
            activeCosmetics: data.active_cosmetics || {}
        };
    } catch (err) {
        console.error('❌ [DataSync] loadUserDataFromTermoCore:', err);
        return null;
    }
}

// ============================================================
// CALCULAR NÍVEL A PARTIR DO XP
// Sincronizado com TermoCore (script.js getLevelInfo)
// ============================================================
function calculateLevelFromXP(xp) {
    const level = Math.floor(Math.pow((xp || 0) / 100, 1 / 1.5)) || 1;
    const currentLevelXP = Math.round(100 * Math.pow(level, 1.5));
    const nextLevelXP    = Math.round(100 * Math.pow(level + 1, 1.5));
    const progressXP     = (xp || 0) - currentLevelXP;
    const neededXP       = nextLevelXP - currentLevelXP;
    return {
        level,
        currentXP: xp || 0,
        xpForNextLevel: nextLevelXP,
        progressPercent: Math.min(100, Math.max(0, (progressXP / neededXP) * 100))
    };
}

// ============================================================
// OBTER HTML DO AVATAR DO USUÁRIO
// Prioridade: avatarUrlFromDB → catálogo JS → padrão dicebear
// ============================================================
function buildAvatarHTML(activeAvatarVariantId, avatarUrlFromDB, activeCosmetics) {
    // Tentar catálogo JS do TermoCore (disponível apenas quando o jogo está carregado)
    const catalog = typeof SHOP_ITEMS !== 'undefined' ? SHOP_ITEMS : [];

    // Moldura ativa
    const frameId   = activeCosmetics?.frame || null;
    const frameItem = frameId ? catalog.find(i => i.id === frameId) : null;
    const frameClass = frameItem?.frameClass || '';

    // Resolver URL do avatar:
    // 1. URL salva no banco (avatar_url) — mais confiável na plataforma
    // 2. URL do catálogo JS (só disponível dentro do TermoCore)
    // 3. Fallback padrão
    let imgSrc = 'https://api.dicebear.com/10.x/bottts-neutral/svg?seed=tdunppc5';

    if (avatarUrlFromDB) {
        imgSrc = avatarUrlFromDB;
    } else if (activeAvatarVariantId) {
        const variantItem = catalog.find(i => i.id === activeAvatarVariantId);
        if (variantItem?.avatarUrl) imgSrc = variantItem.avatarUrl;
    }

    return `
        <div class="profile-avatar-wrapper" style="position:relative;display:inline-block;">
            <div class="avatar-composite" style="width:100%;height:100%;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;">
                <img src="${imgSrc}"
                     style="width:100%;height:100%;object-fit:cover;"
                     alt="Avatar"
                     onerror="this.src='https://api.dicebear.com/10.x/bottts-neutral/svg?seed=default'">
            </div>
            ${frameClass ? `<div class="profile-frame ${frameClass}" style="position:absolute;inset:0;border-radius:50%;pointer-events:none;"></div>` : ''}
        </div>
    `;
}

async function getUserAvatar(userId) {
    try {
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        if (!client) return buildAvatarHTML(null, null, {});

        // Buscar avatar ativo (item_id + avatar_url salva no banco) e cosméticos
        const [avatarRes, cosmeticsRes] = await Promise.all([
            client.from('shop_items')
                .select('item_id, avatar_url')
                .eq('user_id', userId)
                .eq('is_active', true)
                .or('item_id.like.avatar_%,item_id.like.var_%')
                .limit(1)
                .maybeSingle(),
            client.from('game_stats')
                .select('active_cosmetics')
                .eq('user_id', userId)
                .single()
        ]);

        const activeAvatarVariant = avatarRes.data?.item_id || null;
        const avatarUrlFromDB      = avatarRes.data?.avatar_url || null;
        const activeCosmetics      = cosmeticsRes.data?.active_cosmetics || {};

        return buildAvatarHTML(activeAvatarVariant, avatarUrlFromDB, activeCosmetics);
    } catch (err) {
        console.error('❌ [DataSync] getUserAvatar:', err);
        return buildAvatarHTML(null, null, {});
    }
}

// ============================================================
// OBTER TEMA ATIVO DA PLATAFORMA
// Lê active_theme de game_stats (coluna adicionada na migration v2.2)
// ============================================================
async function getUserActiveTheme(userId) {
    try {
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        if (!client) return 'pf_theme_default';

        const { data, error } = await client
            .from('game_stats')
            .select('active_theme')
            .eq('user_id', userId)
            .single();

        if (error || !data?.active_theme) return 'pf_theme_default';

        // Normalizar: se o tema salvo for o antigo 'theme_default', mapear para o novo
        if (data.active_theme === 'theme_default') return 'pf_theme_default';
        return data.active_theme;
    } catch (err) {
        return 'pf_theme_default';
    }
}

// ============================================================
// EQUIPAR TEMA NA PLATAFORMA
// Salva em game_stats.active_theme e aplica visualmente
// ============================================================
async function equipThemeOnPlatform(userId, themeId) {
    try {
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        if (!client) { showToast('Erro de conexão', 'error'); return false; }

        const { error } = await client
            .from('game_stats')
            .update({ active_theme: themeId })
            .eq('user_id', userId);

        if (error) {
            console.error('❌ [DataSync] equipThemeOnPlatform:', error);
            showToast('Erro ao equipar tema', 'error');
            return false;
        }

        applyThemeToDOM(themeId);
        showToast('✅ Tema equipado!', 'success');
        return true;
    } catch (err) {
        console.error('❌ [DataSync] equipThemeOnPlatform:', err);
        showToast('Erro ao equipar tema', 'error');
        return false;
    }
}

// ============================================================
// APLICAR TEMA AO DOM (variáveis CSS)
// ============================================================
function applyThemeToDOM(themeId) {
    // Temas da plataforma
    const platformTheme = PLATFORM_SHOP_CATALOG.find(t => t.id === themeId);
    if (platformTheme) {
        document.documentElement.style.setProperty('--primary-color', platformTheme.colors.primary);
        document.documentElement.style.setProperty('--secondary-color', platformTheme.colors.secondary);
        document.body.style.background = platformTheme.colors.bg;
        console.log('✅ [DataSync] Tema da plataforma aplicado:', themeId);
        return;
    }
    // Fallback: tema padrão
    document.documentElement.style.setProperty('--primary-color', '#00d4ff');
    document.documentElement.style.setProperty('--secondary-color', '#0099cc');
    document.body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
}

// ============================================================
// OBTER INVENTÁRIO GLOBAL DO USUÁRIO
// Regras:
//   - Avatares: todos os jogos aparecem (com campo gameSource para filtro)
//   - Cosméticos: todos os jogos aparecem
//   - Temas: APENAS temas da plataforma (prefixo pf_theme_)
//             Temas de jogos ficam no inventário do jogo, não aqui
// ============================================================
async function getUserInventory(userId) {
    try {
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        if (!client) return [];

        const { data, error } = await client
            .from('shop_items')
            .select('item_id, is_active, game_source, item_type, avatar_url')
            .eq('user_id', userId);

        if (error || !data) return [];

        const catalog = typeof SHOP_ITEMS !== 'undefined' ? SHOP_ITEMS : [];

        return data
            .map(row => {
                // Determinar tipo e jogo a partir das colunas novas (ou inferir pelo prefixo)
                const itemType   = row.item_type   || inferItemType(row.item_id);
                const gameSource = row.game_source || inferGameSource(row.item_id);

                // Dados ricos do catálogo JS (TermoCore ou plataforma)
                const catalogItem = catalog.find(i => i.id === row.item_id)
                    || PLATFORM_SHOP_CATALOG.find(i => i.id === row.item_id);

                return {
                    id:        row.item_id,
                    name:      catalogItem?.name || formatItemName(row.item_id),
                    type:      itemType,
                    gameId:    gameSource,
                    isActive:  row.is_active,
                    icon:      catalogItem?.icon || getItemIcon(itemType),
                    avatarUrl: row.avatar_url || catalogItem?.avatarUrl || null,
                    category:  catalogItem?.category || itemType
                };
            })
            .filter(item => {
                // Temas de jogos NÃO aparecem no inventário global da plataforma
                if (item.type === 'theme' && item.gameId !== 'platform') return false;
                return true;
            });
    } catch (err) {
        console.error('❌ [DataSync] getUserInventory:', err);
        return [];
    }
}

// ============================================================
// EQUIPAR ITEM DO INVENTÁRIO (avatar, cosmético, tema de plataforma)
// Chamado pelos cards do inventário na aba Perfil
// ============================================================
async function equipItemFromPlatform(userId, itemId) {
    try {
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        if (!client) { showToast('Erro de conexão', 'error'); return false; }

        const itemType = inferItemType(itemId);
        const catalog  = typeof SHOP_ITEMS !== 'undefined' ? SHOP_ITEMS : [];
        const item     = catalog.find(i => i.id === itemId)
            || PLATFORM_SHOP_CATALOG.find(i => i.id === itemId);

        if (itemType === 'theme') {
            // Temas da plataforma: salvar em game_stats.active_theme
            return await equipThemeOnPlatform(userId, itemId);
        }

        if (itemType === 'avatar') {
            // Desativar avatar anterior
            await client
                .from('shop_items')
                .update({ is_active: false })
                .eq('user_id', userId)
                .eq('is_active', true)
                .or('item_id.like.avatar_%,item_id.like.var_%');

            // Ativar novo avatar
            await client
                .from('shop_items')
                .update({ is_active: true })
                .eq('user_id', userId)
                .eq('item_id', itemId);

            showToast(`✅ Avatar equipado!`, 'success');
            return true;
        }

        if (itemType === 'cosmetic') {
            const category = item?.category || 'frame';

            // Desativar cosmético anterior da mesma categoria
            const { data: oldItems } = await client
                .from('shop_items')
                .select('item_id')
                .eq('user_id', userId)
                .eq('is_active', true)
                .like('item_id', `cosmetic_${category}_%`);

            if (oldItems?.length) {
                for (const old of oldItems) {
                    await client
                        .from('shop_items')
                        .update({ is_active: false })
                        .eq('user_id', userId)
                        .eq('item_id', old.item_id);
                }
            }

            // Ativar novo cosmético
            await client
                .from('shop_items')
                .update({ is_active: true })
                .eq('user_id', userId)
                .eq('item_id', itemId);

            showToast(`✅ Cosmético equipado!`, 'success');
            return true;
        }

        showToast('Tipo de item não reconhecido', 'warning');
        return false;
    } catch (err) {
        console.error('❌ [DataSync] equipItemFromPlatform:', err);
        showToast('Erro ao equipar item', 'error');
        return false;
    }
}

// ============================================================
// DESEQUIPAR ITEM DO INVENTÁRIO
// ============================================================
async function unequipItemFromPlatform(userId, itemId) {
    try {
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        if (!client) return false;

        const itemType = inferItemType(itemId);

        if (itemType === 'theme') {
            // Voltar ao tema padrão da plataforma
            await equipThemeOnPlatform(userId, 'pf_theme_default');
            return true;
        }

        await client
            .from('shop_items')
            .update({ is_active: false })
            .eq('user_id', userId)
            .eq('item_id', itemId);

        showToast('Item desequipado.', 'info');
        return true;
    } catch (err) {
        console.error('❌ [DataSync] unequipItemFromPlatform:', err);
        return false;
    }
}

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================
function inferItemType(itemId) {
    if (!itemId) return 'other';
    if (itemId.startsWith('pf_theme_'))   return 'theme';
    if (itemId.startsWith('theme_'))      return 'theme';
    if (itemId.startsWith('avatar_'))     return 'avatar';
    if (itemId.startsWith('var_'))        return 'avatar';
    if (itemId.startsWith('cosmetic_'))   return 'cosmetic';
    if (itemId.startsWith('frame_'))      return 'cosmetic';
    return 'other';
}

function inferGameSource(itemId) {
    if (!itemId) return 'termocore';
    if (itemId.startsWith('pf_'))         return 'platform';
    // Itens antigos de plataforma sem prefixo (legado)
    if (itemId === 'theme_dark')          return 'platform';
    return 'termocore';
}

function formatItemName(itemId) {
    if (!itemId) return 'Item';
    return itemId
        .replace(/^(pf_|avatar_|cosmetic_|theme_|var_)/, '')
        .replace(/_/g, ' ')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function getItemIcon(itemType) {
    const icons = { theme: '🎨', avatar: '👤', cosmetic: '✨', other: '📦' };
    return icons[itemType] || '📦';
}

// ============================================================
// SINCRONIZAÇÃO PERIÓDICA (header: moedas e fichas)
// ============================================================
function startDataSyncInterval() {
    setInterval(async () => {
        const raw = localStorage.getItem('cg_current_user');
        if (!raw) return;
        try {
            const userData = JSON.parse(raw);
            const stats = await loadUserDataFromTermoCore(userData.id);
            if (!stats) return;

            // Atualizar localStorage
            userData.xp          = stats.xp;
            userData.coins       = stats.coins;
            userData.spinTickets = stats.spinTickets;
            localStorage.setItem('cg_current_user', JSON.stringify(userData));

            // Re-renderizar perfil se estiver ativo
            const activeTab = document.querySelector('.nav-btn.active')?.getAttribute('data-nav-btn');
            if (activeTab === 'profile' && typeof renderEnhancedProfile === 'function') {
                renderEnhancedProfile();
            }
        } catch (err) {
            console.error('❌ [DataSync] sync interval:', err);
        }
    }, 30000);
}

console.log('✅ platform-data-sync.js v2.2 carregado');
