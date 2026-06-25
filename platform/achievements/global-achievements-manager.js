/**
 * GLOBAL ACHIEVEMENTS MANAGER - Core Games Platform
 * Gerencia conquistas globais e específicas por jogo
 */

class GlobalAchievementsManager {
    constructor() {
        this.supabase = null;
        this.currentUserId = null;
        this.achievements = [];
        this.userAchievements = [];
    }

    // ============================================================
    // INICIALIZAÇÃO
    // ============================================================
    async init(supabaseClient) {
        this.supabase = supabaseClient;
        console.log('✅ GlobalAchievementsManager inicializado');
    }

    async setCurrentUser(userId) {
        this.currentUserId = userId;
        await this.loadAchievements();
    }

    // ============================================================
    // CARREGAR CONQUISTAS
    // ============================================================
    async loadAchievements() {
        if (!this.currentUserId || !this.supabase) return;

        try {
            // Carregar catálogo de conquistas
            const { data: catalogData } = await this.supabase
                .from('global_achievements_catalog')
                .select('*');

            this.achievements = catalogData || [];

            // Carregar conquistas desbloqueadas do usuário
            const { data: userAchievementsData } = await this.supabase
                .from('user_achievements')
                .select('achievement_id, unlocked_at')
                .eq('user_id', this.currentUserId);

            this.userAchievements = userAchievementsData || [];

            console.log('✅ Conquistas carregadas');
        } catch (error) {
            console.error('❌ Erro ao carregar conquistas:', error);
        }
    }

    // ============================================================
    // DESBLOQUEAR CONQUISTA
    // ============================================================
    async unlockAchievement(achievementId) {
        if (!this.currentUserId || !this.supabase) return false;

        try {
            // Verificar se já foi desbloqueada
            const alreadyUnlocked = this.userAchievements.some(
                ua => ua.achievement_id === achievementId
            );

            if (alreadyUnlocked) {
                return false; // Já foi desbloqueada
            }

            // Desbloquear conquista
            const { error } = await this.supabase
                .from('user_achievements')
                .insert([{
                    user_id: this.currentUserId,
                    achievement_id: achievementId,
                    unlocked_at: new Date().toISOString()
                }]);

            if (error) throw error;

            // Adicionar à lista local
            this.userAchievements.push({
                achievement_id: achievementId,
                unlocked_at: new Date().toISOString()
            });

            // Buscar informações da conquista
            const achievement = this.achievements.find(a => a.id === achievementId);
            if (achievement) {
                showToast(`🏆 Conquista Desbloqueada: ${achievement.name}!`, 'success');

                // Adicionar recompensas
                if (achievement.reward_xp) {
                    await globalProfileManager.addGlobalXP(achievement.reward_xp);
                }
                if (achievement.reward_coins) {
                    await globalProfileManager.addGlobalCoins(achievement.reward_coins);
                }
            }

            return true;
        } catch (error) {
            console.error('❌ Erro ao desbloquear conquista:', error);
            return false;
        }
    }

    // ============================================================
    // OBTER CONQUISTAS POR TIPO
    // ============================================================
    getAchievementsByType(type = 'global') {
        return this.achievements.filter(a => a.type === type);
    }

    getAchievementsByGame(gameId) {
        return this.achievements.filter(a => a.game_id === gameId);
    }

    // ============================================================
    // OBTER STATUS DE CONQUISTA
    // ============================================================
    isAchievementUnlocked(achievementId) {
        return this.userAchievements.some(ua => ua.achievement_id === achievementId);
    }

    getUnlockedAchievements() {
        return this.userAchievements;
    }

    getUnlockedCount() {
        return this.userAchievements.length;
    }

    getTotalCount() {
        return this.achievements.length;
    }

    getProgressPercentage() {
        if (this.achievements.length === 0) return 0;
        return Math.round((this.userAchievements.length / this.achievements.length) * 100);
    }

    // ============================================================
    // OBTER INFORMAÇÕES DE CONQUISTA
    // ============================================================
    getAchievementInfo(achievementId) {
        return this.achievements.find(a => a.id === achievementId);
    }

    // ============================================================
    // CONQUISTAS PREDEFINIDAS
    // ============================================================
    async initializeDefaultAchievements() {
        if (!this.supabase) return;

        const defaultAchievements = [
            // GLOBAIS
            {
                id: 'first_login',
                name: 'Primeiro Passo',
                description: 'Faça login pela primeira vez',
                type: 'global',
                icon: '👣',
                reward_xp: 50,
                reward_coins: 10
            },
            {
                id: 'level_5',
                name: 'Ascensão',
                description: 'Atinja o nível 5',
                type: 'global',
                icon: '⭐',
                reward_xp: 100,
                reward_coins: 50
            },
            {
                id: 'level_10',
                name: 'Veterano',
                description: 'Atinja o nível 10',
                type: 'global',
                icon: '🌟',
                reward_xp: 200,
                reward_coins: 100
            },
            {
                id: 'coins_100',
                name: 'Colecionador',
                description: 'Acumule 100 moedas',
                type: 'global',
                icon: '💰',
                reward_xp: 75,
                reward_coins: 0
            },
            {
                id: 'first_friend',
                name: 'Socializador',
                description: 'Adicione seu primeiro amigo',
                type: 'global',
                icon: '👥',
                reward_xp: 50,
                reward_coins: 25
            },
            // TERMOCORE
            {
                id: 'termocore_first_game',
                name: 'Primeiro Jogo',
                description: 'Jogue TermoCore pela primeira vez',
                type: 'termocore',
                game_id: 'termocore',
                icon: '📝',
                reward_xp: 50,
                reward_coins: 10
            },
            {
                id: 'termocore_win_5',
                name: 'Vencedor',
                description: 'Vença 5 jogos no TermoCore',
                type: 'termocore',
                game_id: 'termocore',
                icon: '🏆',
                reward_xp: 100,
                reward_coins: 50
            },
            {
                id: 'termocore_hard_mode',
                name: 'Desafiador',
                description: 'Vença um jogo no modo Difícil',
                type: 'termocore',
                game_id: 'termocore',
                icon: '🔴',
                reward_xp: 150,
                reward_coins: 75
            }
        ];

        try {
            // Verificar quais já existem
            const { data: existing } = await this.supabase
                .from('global_achievements_catalog')
                .select('id');

            const existingIds = existing?.map(a => a.id) || [];

            // Inserir apenas as novas
            const toInsert = defaultAchievements.filter(a => !existingIds.includes(a.id));

            if (toInsert.length > 0) {
                await this.supabase
                    .from('global_achievements_catalog')
                    .insert(toInsert);

                console.log(`✅ ${toInsert.length} conquistas padrão criadas`);
            }
        } catch (error) {
            console.error('❌ Erro ao inicializar conquistas padrão:', error);
        }
    }
}

// Instância global
const globalAchievementsManager = new GlobalAchievementsManager();
