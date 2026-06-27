/**
 * PLATFORM ROULETTE MANAGER v2.2
 * Gerencia a roleta de prêmios da plataforma Core Games.
 * Usa game_stats (spin_tickets, coins, xp) — sem dependência de global_* ou universal_*.
 */

class PlatformRouletteManager {
    constructor() {
        this.isSpinning = false;
        this.prizes = [
            { id: 'coins_50',   label: '50 Moedas',    icon: '💰', type: 'coins',   value: 50,  weight: 30 },
            { id: 'coins_100',  label: '100 Moedas',   icon: '💰', type: 'coins',   value: 100, weight: 20 },
            { id: 'coins_250',  label: '250 Moedas',   icon: '💰', type: 'coins',   value: 250, weight: 10 },
            { id: 'xp_100',     label: '100 XP',       icon: '⭐', type: 'xp',     value: 100, weight: 25 },
            { id: 'xp_250',     label: '250 XP',       icon: '⭐', type: 'xp',     value: 250, weight: 10 },
            { id: 'ticket_1',   label: '+1 Ficha',     icon: '🎟️', type: 'ticket', value: 1,   weight: 4 },
            { id: 'coins_500',  label: '500 Moedas',   icon: '💎', type: 'coins',   value: 500, weight: 1 }
        ];
    }

    // Sortear prêmio com base nos pesos
    rollPrize() {
        const total = this.prizes.reduce((sum, p) => sum + p.weight, 0);
        let rand = Math.random() * total;
        for (const prize of this.prizes) {
            rand -= prize.weight;
            if (rand <= 0) return prize;
        }
        return this.prizes[0];
    }

    // Girar a roleta
    async spinRoulette() {
        if (this.isSpinning) { showToast('Aguarde o fim da rotação', 'warning'); return null; }

        const raw = localStorage.getItem('cg_current_user');
        if (!raw) { showToast('Usuário não autenticado', 'error'); return null; }
        const userData = JSON.parse(raw);
        const userId = userData.id;

        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        if (!client) { showToast('Erro de conexão', 'error'); return null; }

        try {
            this.isSpinning = true;

            // Verificar fichas
            const { data: stats, error: statsErr } = await client
                .from('game_stats')
                .select('spin_tickets, coins, xp')
                .eq('user_id', userId)
                .single();

            if (statsErr || !stats) {
                showToast('Erro ao carregar dados', 'error');
                this.isSpinning = false;
                return null;
            }

            if ((stats.spin_tickets || 0) < 1) {
                showToast('🎟️ Fichas insuficientes! Jogue TermoCore para ganhar fichas.', 'error');
                this.isSpinning = false;
                return null;
            }

            // Sortear prêmio
            const prize = this.rollPrize();

            // Calcular novos valores
            const updates = { spin_tickets: (stats.spin_tickets || 0) - 1 };
            if (prize.type === 'coins')  updates.coins = (stats.coins || 0) + prize.value;
            if (prize.type === 'xp')     updates.xp    = (stats.xp    || 0) + prize.value;
            if (prize.type === 'ticket') updates.spin_tickets = (stats.spin_tickets || 0) - 1 + prize.value;

            // Salvar no banco
            const { error: updateErr } = await client
                .from('game_stats')
                .update(updates)
                .eq('user_id', userId);

            if (updateErr) {
                showToast('Erro ao salvar prêmio', 'error');
                this.isSpinning = false;
                return null;
            }

            // Atualizar localStorage
            if (prize.type === 'coins')  userData.coins       = updates.coins;
            if (prize.type === 'ticket') userData.spinTickets = updates.spin_tickets;
            userData.spinTickets = updates.spin_tickets;
            localStorage.setItem('cg_current_user', JSON.stringify(userData));

            // Atualizar header
            const coinsEl   = document.getElementById('header-coins');
            const ticketsEl = document.getElementById('header-tickets');
            if (coinsEl && updates.coins !== undefined)
                coinsEl.textContent = updates.coins.toLocaleString('pt-BR');
            if (ticketsEl)
                ticketsEl.textContent = updates.spin_tickets.toLocaleString('pt-BR');

            this.isSpinning = false;
            return prize;
        } catch (err) {
            console.error('❌ [Roulette] spinRoulette:', err);
            this.isSpinning = false;
            showToast('Erro inesperado', 'error');
            return null;
        }
    }

    async getTickets(userId) {
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        if (!client) return 0;
        try {
            const { data } = await client
                .from('game_stats')
                .select('spin_tickets')
                .eq('user_id', userId)
                .single();
            return data?.spin_tickets || 0;
        } catch { return 0; }
    }

    getTicketsRequired() { return 1; }
    isSpinningNow()      { return this.isSpinning; }
}

// Instância global
const platformRouletteManager = new PlatformRouletteManager();
console.log('✅ platform-roulette-manager.js v2.2 carregado');
