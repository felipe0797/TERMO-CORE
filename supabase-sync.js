/**
 * SUPABASE SYNC
 * Funções para sincronizar dados do jogo com Supabase
 */

/**
 * Carregar estatísticas do usuário do Supabase
 */
async function loadUserStatsFromSupabase(userId) {
    const client = getSupabaseClient();
    if (!client) {
        console.warn('Supabase não inicializado, usando localStorage');
        return null;
    }

    try {
        const { data, error } = await client
            .from('game_stats')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Erro ao carregar stats:', error);
            return null;
        }

        // Converter dados do banco para formato do jogo
        return {
            xp: data.xp || 0,
            coins: data.coins || 0,
            totalGames: data.total_games || 0,
            winStreak: data.win_streak || 0,
            unlockedTrophies: [],
            ownedItems: [],
            activeTheme: 'theme_dark',
            activeAvatar: null,
            '5_LETTERS': { 
                wins: data.five_letters_wins || 0, 
                losses: data.five_letters_losses || 0 
            },
            '7_LETTERS': { 
                wins: data.seven_letters_wins || 0, 
                losses: data.seven_letters_losses || 0 
            },
            'SURVIVAL': { 
                wins: data.survival_wins || 0, 
                losses: data.survival_losses || 0 
            },
            'AVALANCHE': { 
                wins: data.avalanche_wins || 0, 
                losses: data.avalanche_losses || 0 
            },
            perfectGames5L: data.perfect_games_5l || 0,
            perfectGames7L: data.perfect_games_7l || 0,
            bestSurvivalRound: data.best_survival_round || 0,
            bestAvalanchePhase: data.best_avalanche_phase || 0,
            survivalLivesBought: data.survival_lives_bought || 0
        };
    } catch (error) {
        console.error('Erro inesperado ao carregar stats:', error);
        return null;
    }
}

/**
 * Salvar estatísticas do usuário no Supabase
 */
async function saveUserStatsToSupabase(userId, stats) {
    const client = getSupabaseClient();
    if (!client) {
        console.warn('Supabase não inicializado, não salvando');
        return false;
    }

    try {
        const { error } = await client
            .from('game_stats')
            .update({
                xp: stats.xp || 0,
                coins: stats.coins || 0,
                total_games: stats.totalGames || 0,
                win_streak: stats.winStreak || 0,
                five_letters_wins: stats['5_LETTERS'].wins || 0,
                five_letters_losses: stats['5_LETTERS'].losses || 0,
                perfect_games_5l: stats.perfectGames5L || 0,
                seven_letters_wins: stats['7_LETTERS'].wins || 0,
                seven_letters_losses: stats['7_LETTERS'].losses || 0,
                perfect_games_7l: stats.perfectGames7L || 0,
                survival_wins: stats['SURVIVAL'].wins || 0,
                survival_losses: stats['SURVIVAL'].losses || 0,
                best_survival_round: stats.bestSurvivalRound || 0,
                survival_lives_bought: stats.survivalLivesBought || 0,
                avalanche_wins: stats['AVALANCHE'].wins || 0,
                avalanche_losses: stats['AVALANCHE'].losses || 0,
                best_avalanche_phase: stats.bestAvalanchePhase || 0,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);

        if (error) {
            console.error('Erro ao salvar stats:', error);
            return false;
        }

        console.log('✅ Stats salvos no Supabase');
        return true;
    } catch (error) {
        console.error('Erro inesperado ao salvar stats:', error);
        return false;
    }
}

/**
 * Carregar conquistas do usuário
 */
async function loadAchievementsFromSupabase(userId) {
    const client = getSupabaseClient();
    if (!client) return [];

    try {
        const { data, error } = await client
            .from('achievements')
            .select('achievement_id')
            .eq('user_id', userId);

        if (error) {
            console.error('Erro ao carregar conquistas:', error);
            return [];
        }

        return data.map(row => row.achievement_id);
    } catch (error) {
        console.error('Erro inesperado ao carregar conquistas:', error);
        return [];
    }
}

/**
 * Salvar conquista do usuário
 */
async function saveAchievementToSupabase(userId, achievementId) {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
        const { error } = await client
            .from('achievements')
            .insert([
                {
                    user_id: userId,
                    achievement_id: achievementId
                }
            ]);

        if (error && error.code !== '23505') { // 23505 = unique constraint violation
            console.error('Erro ao salvar conquista:', error);
            return false;
        }

        console.log('✅ Conquista salva no Supabase');
        return true;
    } catch (error) {
        console.error('Erro inesperado ao salvar conquista:', error);
        return false;
    }
}

/**
 * Carregar itens da loja do usuário
 */
async function loadShopItemsFromSupabase(userId) {
    const client = getSupabaseClient();
    if (!client) return [];

    try {
        const { data, error } = await client
            .from('shop_items')
            .select('item_id, is_active')
            .eq('user_id', userId);

        if (error) {
            console.error('Erro ao carregar itens da loja:', error);
            return [];
        }

        return data.map(row => row.item_id);
    } catch (error) {
        console.error('Erro inesperado ao carregar itens da loja:', error);
        return [];
    }
}

/**
 * Salvar item da loja do usuário
 */
async function saveShopItemToSupabase(userId, itemId, isActive = false) {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
        const { error } = await client
            .from('shop_items')
            .insert([
                {
                    user_id: userId,
                    item_id: itemId,
                    is_active: isActive
                }
            ]);

        if (error && error.code !== '23505') {
            console.error('Erro ao salvar item da loja:', error);
            return false;
        }

        console.log('✅ Item da loja salvo no Supabase');
        return true;
    } catch (error) {
        console.error('Erro inesperado ao salvar item da loja:', error);
        return false;
    }
}

/**
 * Atualizar item ativo da loja
 */
async function updateActiveShopItemToSupabase(userId, itemId, isActive) {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
        const { error } = await client
            .from('shop_items')
            .update({ is_active: isActive })
            .eq('user_id', userId)
            .eq('item_id', itemId);

        if (error) {
            console.error('Erro ao atualizar item ativo:', error);
            return false;
        }

        console.log('✅ Item ativo atualizado no Supabase');
        return true;
    } catch (error) {
        console.error('Erro inesperado ao atualizar item ativo:', error);
        return false;
    }
}

/**
 * Carregar progresso da jornada do usuário
 */
async function loadJourneyProgressFromSupabase(userId, journeyId) {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
        const { data, error } = await client
            .from('journey_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('journey_id', journeyId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
            console.error('Erro ao carregar progresso da jornada:', error);
            return null;
        }

        if (!data) return null;

        return {
            currentPhase: data.current_phase || 1,
            completedPhases: data.completed_phases || [],
            stars: data.stars || {},
            claimedChests: data.claimed_chests || {},
            introSeen: data.intro_seen || false
        };
    } catch (error) {
        console.error('Erro inesperado ao carregar progresso da jornada:', error);
        return null;
    }
}

/**
 * Salvar progresso da jornada do usuário
 */
async function saveJourneyProgressToSupabase(userId, journeyId, progress) {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
        const { error } = await client
            .from('journey_progress')
            .upsert([
                {
                    user_id: userId,
                    journey_id: journeyId,
                    current_phase: progress.currentPhase || 1,
                    completed_phases: progress.completedPhases || [],
                    stars: progress.stars || {},
                    claimed_chests: progress.claimedChests || {},
                    intro_seen: progress.introSeen || false,
                    updated_at: new Date().toISOString()
                }
            ]);

        if (error) {
            console.error('Erro ao salvar progresso da jornada:', error);
            return false;
        }

        console.log('✅ Progresso da jornada salvo no Supabase');
        return true;
    } catch (error) {
        console.error('Erro inesperado ao salvar progresso da jornada:', error);
        return false;
    }
}

/**
 * Carregar ranking global
 */
async function loadGlobalRankingFromSupabase(limit = 100) {
    const client = getSupabaseClient();
    if (!client) return [];

    try {
        const { data, error } = await client
            .from('game_stats')
            .select(`
                user_id,
                xp,
                coins,
                five_letters_wins,
                seven_letters_wins,
                survival_wins,
                avalanche_wins,
                users(username)
            `)
            .order('xp', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Erro ao carregar ranking:', error);
            return [];
        }

        return data.map((row, index) => ({
            rank: index + 1,
            username: row.users?.username || 'Anônimo',
            xp: row.xp || 0,
            coins: row.coins || 0,
            totalWins: (row.five_letters_wins || 0) + (row.seven_letters_wins || 0) + (row.survival_wins || 0) + (row.avalanche_wins || 0)
        }));
    } catch (error) {
        console.error('Erro inesperado ao carregar ranking:', error);
        return [];
    }
}

console.log('✅ supabase-sync.js carregado');
