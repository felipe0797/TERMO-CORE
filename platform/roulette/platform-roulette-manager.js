/**
 * PLATFORM ROULETTE MANAGER - Core Games Platform
 * Gerencia roleta da plataforma Core Games
 */

class PlatformRouletteManager {
    constructor() {
        this.supabase = null;
        this.currentUserId = null;
        this.rouletteConfig = null;
        this.isSpinning = false;
    }

    // ============================================================
    // INICIALIZAÇÃO
    // ============================================================
    async init(supabaseClient) {
        this.supabase = supabaseClient;
        console.log('✅ PlatformRouletteManager inicializado');
    }

    async setCurrentUser(userId) {
        this.currentUserId = userId;
        await this.loadRouletteConfig();
    }

    // ============================================================
    // CARREGAR CONFIGURAÇÃO DA ROLETA
    // ============================================================
    async loadRouletteConfig() {
        if (!this.supabase) return;

        try {
            const { data, error } = await this.supabase
                .from('platform_roulette_config')
                .select('*')
                .eq('id', 'coregames_roulette')
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            if (!data) {
                // Criar configuração padrão
                this.rouletteConfig = await this.createDefaultConfig();
            } else {
                this.rouletteConfig = data;
            }

            console.log('✅ Configuração da roleta carregada');
        } catch (error) {
            console.error('❌ Erro ao carregar roleta:', error);
        }
    }

    // ============================================================
    // CRIAR CONFIGURAÇÃO PADRÃO
    // ============================================================
    async createDefaultConfig() {
        if (!this.supabase) return null;

        const defaultConfig = {
            id: 'coregames_roulette',
            name: 'Roleta Core Games',
            scope: 'global',
            tickets_required: 1,
            rewards: [
                { type: 'coins', amount: 50, chance: 0.25 },
                { type: 'coins', amount: 100, chance: 0.20 },
                { type: 'coins', amount: 200, chance: 0.15 },
                { type: 'xp', amount: 50, chance: 0.20 },
                { type: 'xp', amount: 100, chance: 0.10 },
                { type: 'tickets', amount: 1, chance: 0.05 },
                { type: 'item', itemId: 'theme_neon', chance: 0.03 },
                { type: 'item', itemId: 'frame_gold', chance: 0.02 }
            ]
        };

        try {
            const { data, error } = await this.supabase
                .from('platform_roulette_config')
                .insert([defaultConfig])
                .select()
                .single();

            if (error) throw error;

            return data;
        } catch (error) {
            console.error('❌ Erro ao criar configuração padrão:', error);
            return null;
        }
    }

    // ============================================================
    // GIRAR ROLETA
    // ============================================================
    async spinRoulette() {
        if (!this.currentUserId || !this.supabase || !this.rouletteConfig) {
            showToast('Erro ao girar roleta', 'error');
            return null;
        }

        if (this.isSpinning) {
            showToast('Aguarde o fim da rotação', 'warning');
            return null;
        }

        try {
            // Verificar fichas
            const tickets = globalProfileManager.getGlobalTickets();
            if (tickets < this.rouletteConfig.tickets_required) {
                showToast('🎫 Fichas insuficientes!', 'error');
                return null;
            }

            // Descontar fichas
            const success = await globalProfileManager.removeGlobalTickets(
                this.rouletteConfig.tickets_required
            );
            if (!success) return null;

            // Marcar como girando
            this.isSpinning = true;

            // Sortear prêmio
            const reward = this.selectReward();

            // Registrar giro
            await this.recordSpin(reward);

            // Processar prêmio
            await this.processReward(reward);

            this.isSpinning = false;

            return reward;
        } catch (error) {
            console.error('❌ Erro ao girar roleta:', error);
            this.isSpinning = false;
            showToast('Erro ao girar roleta', 'error');
            return null;
        }
    }

    // ============================================================
    // SELECIONAR PRÊMIO
    // ============================================================
    selectReward() {
        const random = Math.random();
        let accumulated = 0;

        for (const reward of this.rouletteConfig.rewards) {
            accumulated += reward.chance;
            if (random <= accumulated) {
                return reward;
            }
        }

        // Fallback (não deveria acontecer)
        return this.rouletteConfig.rewards[0];
    }

    // ============================================================
    // PROCESSAR PRÊMIO
    // ============================================================
    async processReward(reward) {
        try {
            let message = '';

            if (reward.type === 'coins') {
                await globalProfileManager.addGlobalCoins(reward.amount);
                message = `🎉 Você ganhou ${reward.amount} moedas!`;
            } else if (reward.type === 'xp') {
                await globalProfileManager.addGlobalXP(reward.amount);
                message = `🎉 Você ganhou ${reward.amount} XP!`;
            } else if (reward.type === 'tickets') {
                await globalProfileManager.addGlobalTickets(reward.amount);
                message = `🎉 Você ganhou ${reward.amount} fichas!`;
            } else if (reward.type === 'item') {
                const item = universalShopManager.getItemInfo(reward.itemId);
                if (item) {
                    await globalProfileManager.addToInventory(
                        reward.itemId,
                        item.game_id || 'global',
                        item.item_type
                    );
                    message = `🎉 Você ganhou: ${item.name}!`;
                }
            }

            showToast(message, 'success');
        } catch (error) {
            console.error('❌ Erro ao processar prêmio:', error);
        }
    }

    // ============================================================
    // REGISTRAR GIRO
    // ============================================================
    async recordSpin(reward) {
        if (!this.supabase) return;

        try {
            await this.supabase
                .from('platform_roulette_spins')
                .insert([{
                    user_id: this.currentUserId,
                    reward_type: reward.type,
                    reward_amount: reward.amount || reward.itemId,
                    spun_at: new Date().toISOString()
                }]);
        } catch (error) {
            console.error('❌ Erro ao registrar giro:', error);
        }
    }

    // ============================================================
    // GETTERS
    // ============================================================
    getRouletteConfig() {
        return this.rouletteConfig;
    }

    getTicketsRequired() {
        return this.rouletteConfig?.tickets_required || 1;
    }

    isSpinningNow() {
        return this.isSpinning;
    }
}

// Instância global
const platformRouletteManager = new PlatformRouletteManager();
