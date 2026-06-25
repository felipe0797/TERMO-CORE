/**
 * SUPABASE SYNC
 * Funções para sincronizar dados do jogo com Supabase
 */

/**
 * Carregar estatísticas do usuário do Supabase (incluindo conquistas e itens da loja)
 */
async function loadUserStatsFromSupabase(userId) {
    const client = getSupabaseClient();
    if (!client) {
        console.warn('Supabase não inicializado, usando localStorage');
        return null;
    }

    try {
        // Buscar game_stats, conquistas e itens da loja em paralelo
        const [statsResult, achievementsResult, shopResult] = await Promise.all([
            client.from('game_stats').select('*').eq('user_id', userId).single(),
            client.from('achievements').select('achievement_id').eq('user_id', userId),
            client.from('shop_items').select('item_id, is_active').eq('user_id', userId)
        ]);

        if (statsResult.error) {
            console.error('Erro ao carregar stats:', statsResult.error);
            return null;
        }

        const data = statsResult.data;

        // Montar lista de conquistas desbloqueadas
        const unlockedTrophies = (achievementsResult.data || []).map(r => r.achievement_id);

        // Montar lista de itens possuídos e detectar itens ativos
        const shopItems = shopResult.data || [];
        const ownedItems = shopItems.map(r => r.item_id);

        // Detectar tema, avatar e cosméticos ativos a partir da tabela shop_items
        // MELHORIA v1.1.1: Tentar carregar tema do game_stats primeiro, fallback para shop_items
        let activeTheme = data.active_theme || 'theme_default';
        let activeAvatar = null;
        let activeAvatarVariant = null;
        let activeCosmetics = {};
        shopItems.forEach(r => {
            if (r.is_active) {
                if (r.item_id.startsWith('theme_')) activeTheme = r.item_id;
                if (r.item_id.startsWith('avatar_variant_')) activeAvatarVariant = r.item_id; // Suporte para o novo formato
                if (r.item_id.startsWith('avatar_')) {
                    // Consideramos qualquer item que comece com avatar_ como uma variante ativa
                    activeAvatarVariant = r.item_id;
                    activeAvatar = r.item_id;
                }
                if (r.item_id.startsWith('var_')) activeAvatarVariant = r.item_id;
                // Cosméticos por categoria (v1.0.7)
                if (r.item_id.startsWith('cosmetic_face_')) activeCosmetics.face = r.item_id;
                if (r.item_id.startsWith('cosmetic_acc_')) activeCosmetics.accessory = r.item_id;
                if (r.item_id.startsWith('cosmetic_bg_')) activeCosmetics.background = r.item_id;
                if (r.item_id.startsWith('cosmetic_frame_')) activeCosmetics.frame = r.item_id;
            }
        });

        // Converter dados do banco para formato do jogo
        return {
            xp: data.xp || 0,
            coins: data.coins || 0,
            totalGames: data.total_games || 0,
            winStreak: data.win_streak || 0,
            maxWinStreak: data.max_win_streak || 0,          // Melhoria 3
            unlockedTrophies,
            ownedItems,
            activeTheme,
            activeAvatar,
            activeAvatarVariant,
            activeCosmetics,                                  // Melhoria 6
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
            bestSurvivalScore: data.best_survival_score || 0, // Melhoria 3
            bestAvalanchePhase: data.best_avalanche_phase || 0,
            bestAvalancheScore: data.best_avalanche_score || 0, // Melhoria 3
            survivalLivesBought: data.survival_lives_bought || 0,
            spinTickets: data.spin_tickets || 0,                    // v1.0.6 Roleta
            lastDailyTicket: data.last_daily_ticket || null         // v1.0.6 Roleta
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
                max_win_streak: stats.maxWinStreak || 0,           // Melhoria 3
                five_letters_wins: stats['5_LETTERS'].wins || 0,
                five_letters_losses: stats['5_LETTERS'].losses || 0,
                perfect_games_5l: stats.perfectGames5L || 0,
                seven_letters_wins: stats['7_LETTERS'].wins || 0,
                seven_letters_losses: stats['7_LETTERS'].losses || 0,
                perfect_games_7l: stats.perfectGames7L || 0,
                survival_wins: stats['SURVIVAL'].wins || 0,
                survival_losses: stats['SURVIVAL'].losses || 0,
                best_survival_round: stats.bestSurvivalRound || 0,
                best_survival_score: stats.bestSurvivalScore || 0, // Melhoria 3
                survival_lives_bought: stats.survivalLivesBought || 0,
                avalanche_wins: stats['AVALANCHE'].wins || 0,
                avalanche_losses: stats['AVALANCHE'].losses || 0,
                best_avalanche_phase: stats.bestAvalanchePhase || 0,
                best_avalanche_score: stats.bestAvalancheScore || 0, // Melhoria 3
                spin_tickets: stats.spinTickets || 0,               // v1.0.6 Roleta
                last_daily_ticket: stats.lastDailyTicket || null,   // v1.0.6 Roleta
                active_theme: stats.activeTheme || 'theme_default', // MELHORIA v1.1.1: Persistência de tema
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
 * Carregar ranking global (com todos os campos necessários para filtros por modo)
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
                survival_losses,
                avalanche_wins,
                best_survival_round,
                best_avalanche_phase,
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
            fiveLettersWins:  row.five_letters_wins  || 0,
            sevenLettersWins: row.seven_letters_wins || 0,
            survivalWins:     row.survival_wins      || 0,
            avalancheWins:    row.avalanche_wins     || 0,
            bestSurvival:     row.best_survival_round   || 0,
            bestAvalanche:    row.best_avalanche_phase  || 0,
            totalWins: (row.five_letters_wins || 0) + (row.seven_letters_wins || 0) + (row.survival_wins || 0) + (row.avalanche_wins || 0)
        }));
    } catch (error) {
        console.error('Erro inesperado ao carregar ranking:', error);
        return [];
    }
}

/**
 * Salvar partida no histórico (para ranking temporal - Melhoria 4)
 */
async function saveMatchToHistory(userId, matchData) {
    const client = getSupabaseClient();
    if (!client || !userId) return false;

    try {
        const { error } = await client
            .from('match_history')
            .insert({
                user_id: userId,
                mode: matchData.mode,
                score: matchData.score || 0,
                xp_gained: matchData.xpGained || 0,
                coins_gained: matchData.coinsGained || 0,
                won: matchData.won || false,
                perfect: matchData.perfect || false,
                rounds: matchData.rounds || 0,
                played_at: new Date().toISOString()
            });

        if (error) {
            console.error('Erro ao salvar partida no histórico:', error);
            return false;
        }
        return true;
    } catch (error) {
        console.error('Erro inesperado ao salvar histórico:', error);
        return false;
    }
}

/**
 * Carregar ranking por período (Melhoria 4)
 * period: 'all' | 'weekly' | 'monthly'
 */
async function loadRankingByPeriod(period = 'all', limit = 100) {
    const client = getSupabaseClient();
    if (!client) return [];

    // Para 'all', usa o ranking global padrão
    if (period === 'all') {
        return loadGlobalRankingFromSupabase(limit);
    }

    try {
        // Calcular data de corte
        const now = new Date();
        let cutoff;
        if (period === 'weekly') {
            cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (period === 'monthly') {
            cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
        }

        const { data, error } = await client
            .from('match_history')
            .select(`
                user_id,
                score,
                xp_gained,
                won,
                mode,
                played_at,
                users(username)
            `)
            .gte('played_at', cutoff.toISOString())
            .order('played_at', { ascending: false });

        if (error) {
            console.error('Erro ao carregar ranking por período:', error);
            return [];
        }

        // Agregar por usuário
        const aggregated = {};
        (data || []).forEach(row => {
            const uid = row.user_id;
            if (!aggregated[uid]) {
                aggregated[uid] = {
                    username: row.users?.username || 'Anônimo',
                    totalXP: 0,
                    totalScore: 0,
                    totalWins: 0,
                    totalGames: 0,
                    fiveLettersWins: 0,
                    sevenLettersWins: 0,
                    survivalWins: 0,
                    avalancheWins: 0
                };
            }
            aggregated[uid].totalXP    += row.xp_gained || 0;
            aggregated[uid].totalScore += row.score || 0;
            aggregated[uid].totalGames++;
            if (row.won) {
                aggregated[uid].totalWins++;
                if (row.mode === '5_LETTERS')  aggregated[uid].fiveLettersWins++;
                if (row.mode === '7_LETTERS')  aggregated[uid].sevenLettersWins++;
                if (row.mode === 'SURVIVAL')   aggregated[uid].survivalWins++;
                if (row.mode === 'AVALANCHE')  aggregated[uid].avalancheWins++;
            }
        });

        // Converter para array e ordenar por XP ganho no período
        return Object.values(aggregated)
            .sort((a, b) => b.totalXP - a.totalXP)
            .slice(0, limit)
            .map((entry, index) => ({
                rank: index + 1,
                username: entry.username,
                xp: entry.totalXP,
                coins: 0,
                fiveLettersWins:  entry.fiveLettersWins,
                sevenLettersWins: entry.sevenLettersWins,
                survivalWins:     entry.survivalWins,
                avalancheWins:    entry.avalancheWins,
                bestSurvival:     0,
                bestAvalanche:    0,
                totalWins:        entry.totalWins
            }));
    } catch (error) {
        console.error('Erro inesperado ao carregar ranking por período:', error);
        return [];
    }
}

console.log('✅ supabase-sync.js carregado');

/**
 * SISTEMA DE AMIGOS (v1.1.0)
 */

async function sendFriendRequest(userId, friendUsername) {
    const client = getSupabaseClient();
    if (!client) return { error: 'Supabase não inicializado' };

    try {
        // 1. Normalizar username para lowercase (FIX #2: busca case-insensitive)
        const normalizedFriendUsername = friendUsername.toLowerCase();

        // 2. Buscar ID do amigo pelo username normalizado
        const { data: friendData, error: friendError } = await client
            .from('users')
            .select('id')
            .eq('username', normalizedFriendUsername)
            .single();

        if (friendError || !friendData) return { error: 'Usuário não encontrado' };
        if (friendData.id === userId) return { error: 'Você não pode adicionar a si mesmo' };

        const friendId = friendData.id;

        // 3. Verificar se já existe qualquer vínculo (pendente ou aceito) (FIX #1: previne duplicatas)
        const { data: existing, error: checkError } = await client
            .from('friends')
            .select('id, status, user_id')
            .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
            .maybeSingle();

        if (existing) {
            if (existing.status === 'accepted') return { error: 'Vocês já são amigos!' };
            if (existing.user_id === userId) return { error: 'Você já enviou uma solicitação para este usuário.' };
            return { error: 'Este usuário já te enviou uma solicitação! Verifique sua aba Pendentes.' };
        }

        // 3. Inserir na tabela friends
        const { error: insertError } = await client
            .from('friends')
            .insert({ user_id: userId, friend_id: friendId, status: 'pending' });

        if (insertError) {
            return { error: 'Erro ao enviar solicitação. Tente novamente.' };
        }

        return { success: true };
    } catch (e) {
        return { error: e.message };
    }
}

async function loadFriends(userId) {
    const client = getSupabaseClient();
    if (!client) return [];

    try {
        // Buscar amizades básicas primeiro (users)
        const { data, error } = await client
            .from('friends')
            .select(`
                id,
                status,
                user_id,
                friend_id,
                sender:users!friends_user_id_fkey(id, username),
                receiver:users!friends_friend_id_fkey(id, username)
            `)
            .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

        if (error) throw error;

        // Para cada amizade, buscar os stats separadamente para evitar erros de join complexos
        const friendsWithStats = await Promise.all(data.map(async (friend) => {
            const friendId = friend.user_id === userId ? friend.friend_id : friend.user_id;
            
            const { data: stats } = await client
                .from('game_stats')
                .select('active_cosmetics')
                .eq('user_id', friendId)
                .single();

            // Buscar também se tem algum avatar_variant ativo na shop_items
            const { data: activeAvatar } = await client
                .from('shop_items')
                .select('item_id')
                .eq('user_id', friendId)
                .eq('is_active', true)
                .like('item_id', 'avatar_%')
                .limit(1)
                .maybeSingle();

            const friendStats = {
                active_avatar_variant: activeAvatar ? activeAvatar.item_id : null,
                active_cosmetics: stats ? stats.active_cosmetics : {}
            };

            if (friend.user_id === userId) {
                friend.receiver_stats = friendStats;
            } else {
                friend.sender_stats = friendStats;
            }
            
            return friend;
        }));

        return friendsWithStats;
    } catch (e) {
        console.error('Erro ao carregar amigos:', e);
        return [];
    }
}

async function acceptFriendRequest(requestId) {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
        const { error } = await client
            .from('friends')
            .update({ status: 'accepted' })
            .eq('id', requestId);

        return !error;
    } catch (e) {
        return false;
    }
}

async function removeFriend(requestId) {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
        const { error } = await client
            .from('friends')
            .delete()
            .eq('id', requestId);

        return !error;
    } catch (e) {
        return false;
    }
}

async function getFriendStats(friendId) {
    const client = getSupabaseClient();
    if (!client) return null;

    try {
        // FIX #4 (v2): Buscar stats e avatar ativo em paralelo
        // game_stats nao possui active_avatar_variant; esse dado fica em shop_items
        const [statsResult, avatarResult] = await Promise.all([
            client.from('game_stats').select('*').eq('user_id', friendId).single(),
            client.from('shop_items')
                .select('item_id')
                .eq('user_id', friendId)
                .eq('is_active', true)
                .or('item_id.like.avatar_%,item_id.like.var_%')
                .limit(1)
                .maybeSingle()
        ]);

        if (statsResult.error) throw statsResult.error;

        // Retornar stats + active_avatar_variant resolvido (null explicito se nao tiver)
        return {
            ...statsResult.data,
            active_avatar_variant: avatarResult.data?.item_id ?? null
        };
    } catch (e) {
        return null;
    }
}
