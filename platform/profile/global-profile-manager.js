/**
 * GLOBAL PROFILE MANAGER - Core Games Platform
 * Gerencia perfil global do usuário (Nível, Moedas, Fichas, Inventário)
 */

class GlobalProfileManager {
    constructor() {
        this.supabase = null;
        this.currentUserId = null;
        this.globalStats = null;
    }

    // ============================================================
    // INICIALIZAÇÃO
    // ============================================================
    async init(supabaseClient) {
        this.supabase = supabaseClient;
        console.log('✅ GlobalProfileManager inicializado');
    }

    async setCurrentUser(userId) {
        this.currentUserId = userId;
        await this.loadGlobalStats();
    }

    // ============================================================
    // CARREGAR DADOS GLOBAIS
    // ============================================================
    async loadGlobalStats() {
        if (!this.currentUserId || !this.supabase) return null;

        try {
            const { data, error } = await this.supabase
                .from('global_user_stats')
                .select('*')
                .eq('user_id', this.currentUserId)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (!data) {
                // Criar novo perfil global
                this.globalStats = await this.createGlobalProfile();
            } else {
                this.globalStats = data;
            }

            return this.globalStats;
        } catch (error) {
            console.error('❌ Erro ao carregar stats globais:', error);
            return null;
        }
    }

    // ============================================================
    // CRIAR PERFIL GLOBAL
    // ============================================================
    async createGlobalProfile() {
        if (!this.currentUserId || !this.supabase) return null;

        try {
            const newProfile = {
                user_id: this.currentUserId,
                global_level: 1,
                global_xp: 0,
                global_xp_next_level: 100,
                global_coins: 0,
                global_tickets: 0,
                games_played: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('global_user_stats')
                .insert([newProfile])
                .select()
                .single();

            if (error) throw error;

            this.globalStats = data;
            return data;
        } catch (error) {
            console.error('❌ Erro ao criar perfil global:', error);
            return null;
        }
    }

    // ============================================================
    // ADICIONAR XP GLOBAL
    // ============================================================
    async addGlobalXP(amount) {
        if (!this.globalStats) return false;

        try {
            let newXP = this.globalStats.global_xp + amount;
            let newLevel = this.globalStats.global_level;
            let newXPNextLevel = this.globalStats.global_xp_next_level;

            // Verificar level up
            while (newXP >= newXPNextLevel) {
                newXP -= newXPNextLevel;
                newLevel += 1;
                newXPNextLevel = Math.floor(newXPNextLevel * 1.1); // 10% de aumento por nível
            }

            const { data, error } = await this.supabase
                .from('global_user_stats')
                .update({
                    global_xp: newXP,
                    global_level: newLevel,
                    global_xp_next_level: newXPNextLevel,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', this.currentUserId)
                .select()
                .single();

            if (error) throw error;

            this.globalStats = data;

            // Notificar se houve level up
            if (newLevel > this.globalStats.global_level) {
                showToast(`🎉 Level Up! Você atingiu o nível ${newLevel}!`, 'success');
            }

            return true;
        } catch (error) {
            console.error('❌ Erro ao adicionar XP global:', error);
            return false;
        }
    }

    // ============================================================
    // ADICIONAR MOEDAS GLOBAIS
    // ============================================================
    async addGlobalCoins(amount) {
        if (!this.globalStats) return false;

        try {
            const newCoins = this.globalStats.global_coins + amount;

            const { data, error } = await this.supabase
                .from('global_user_stats')
                .update({
                    global_coins: newCoins,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', this.currentUserId)
                .select()
                .single();

            if (error) throw error;

            this.globalStats = data;
            return true;
        } catch (error) {
            console.error('❌ Erro ao adicionar moedas:', error);
            return false;
        }
    }

    // ============================================================
    // REMOVER MOEDAS GLOBAIS
    // ============================================================
    async removeGlobalCoins(amount) {
        if (!this.globalStats || this.globalStats.global_coins < amount) {
            showToast('💰 Moedas insuficientes!', 'error');
            return false;
        }

        try {
            const newCoins = this.globalStats.global_coins - amount;

            const { data, error } = await this.supabase
                .from('global_user_stats')
                .update({
                    global_coins: newCoins,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', this.currentUserId)
                .select()
                .single();

            if (error) throw error;

            this.globalStats = data;
            return true;
        } catch (error) {
            console.error('❌ Erro ao remover moedas:', error);
            return false;
        }
    }

    // ============================================================
    // ADICIONAR FICHAS GLOBAIS
    // ============================================================
    async addGlobalTickets(amount) {
        if (!this.globalStats) return false;

        try {
            const newTickets = this.globalStats.global_tickets + amount;

            const { data, error } = await this.supabase
                .from('global_user_stats')
                .update({
                    global_tickets: newTickets,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', this.currentUserId)
                .select()
                .single();

            if (error) throw error;

            this.globalStats = data;
            return true;
        } catch (error) {
            console.error('❌ Erro ao adicionar fichas:', error);
            return false;
        }
    }

    // ============================================================
    // REMOVER FICHAS GLOBAIS
    // ============================================================
    async removeGlobalTickets(amount) {
        if (!this.globalStats || this.globalStats.global_tickets < amount) {
            showToast('🎫 Fichas insuficientes!', 'error');
            return false;
        }

        try {
            const newTickets = this.globalStats.global_tickets - amount;

            const { data, error } = await this.supabase
                .from('global_user_stats')
                .update({
                    global_tickets: newTickets,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', this.currentUserId)
                .select()
                .single();

            if (error) throw error;

            this.globalStats = data;
            return true;
        } catch (error) {
            console.error('❌ Erro ao remover fichas:', error);
            return false;
        }
    }

    // ============================================================
    // ADICIONAR JOGO JOGADO
    // ============================================================
    async addGamePlayed(gameId) {
        if (!this.currentUserId || !this.supabase) return false;

        try {
            // Verificar se já jogou este jogo
            const { data: existing } = await this.supabase
                .from('global_games_played')
                .select('*')
                .eq('user_id', this.currentUserId)
                .eq('game_id', gameId)
                .single();

            if (!existing) {
                // Primeira vez jogando este jogo
                await this.supabase
                    .from('global_games_played')
                    .insert([{
                        user_id: this.currentUserId,
                        game_id: gameId,
                        first_play_at: new Date().toISOString()
                    }]);

                // Incrementar contador de jogos jogados
                const newGamesPlayed = this.globalStats.games_played + 1;

                const { data, error } = await this.supabase
                    .from('global_user_stats')
                    .update({
                        games_played: newGamesPlayed,
                        updated_at: new Date().toISOString()
                    })
                    .eq('user_id', this.currentUserId)
                    .select()
                    .single();

                if (error) throw error;

                this.globalStats = data;
            }

            return true;
        } catch (error) {
            console.error('❌ Erro ao adicionar jogo jogado:', error);
            return false;
        }
    }

    // ============================================================
    // GERENCIAR INVENTÁRIO GLOBAL
    // ============================================================
    async addToInventory(itemId, gameId, itemType) {
        if (!this.currentUserId || !this.supabase) return false;

        try {
            const { data, error } = await this.supabase
                .from('global_inventory')
                .insert([{
                    user_id: this.currentUserId,
                    item_id: itemId,
                    game_id: gameId,
                    item_type: itemType,
                    equipped: false,
                    acquired_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('❌ Erro ao adicionar item ao inventário:', error);
            return false;
        }
    }

    async equipItem(itemId) {
        if (!this.currentUserId || !this.supabase) return false;

        try {
            // Desativar item equipado da mesma categoria
            const { data: item } = await this.supabase
                .from('global_inventory')
                .select('item_type')
                .eq('item_id', itemId)
                .single();

            if (item) {
                await this.supabase
                    .from('global_inventory')
                    .update({ equipped: false })
                    .eq('user_id', this.currentUserId)
                    .eq('item_type', item.item_type)
                    .eq('equipped', true);
            }

            // Equipar novo item
            const { data, error } = await this.supabase
                .from('global_inventory')
                .update({ equipped: true })
                .eq('item_id', itemId)
                .eq('user_id', this.currentUserId)
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('❌ Erro ao equipar item:', error);
            return false;
        }
    }

    async getInventory(gameId = null) {
        if (!this.currentUserId || !this.supabase) return [];

        try {
            let query = this.supabase
                .from('global_inventory')
                .select('*')
                .eq('user_id', this.currentUserId);

            if (gameId) {
                query = query.eq('game_id', gameId);
            }

            const { data, error } = await query;

            if (error) throw error;

            return data || [];
        } catch (error) {
            console.error('❌ Erro ao obter inventário:', error);
            return [];
        }
    }

    // ============================================================
    // GETTERS
    // ============================================================
    getGlobalLevel() {
        return this.globalStats?.global_level || 0;
    }

    getGlobalXP() {
        return this.globalStats?.global_xp || 0;
    }

    getGlobalXPNextLevel() {
        return this.globalStats?.global_xp_next_level || 100;
    }

    getGlobalCoins() {
        return this.globalStats?.global_coins || 0;
    }

    getGlobalTickets() {
        return this.globalStats?.global_tickets || 0;
    }

    getGamesPlayed() {
        return this.globalStats?.games_played || 0;
    }

    getXPProgress() {
        const current = this.getGlobalXP();
        const next = this.getGlobalXPNextLevel();
        return Math.round((current / next) * 100);
    }
}

// Instância global
const globalProfileManager = new GlobalProfileManager();
