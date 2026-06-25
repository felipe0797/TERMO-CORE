/**
 * PLATFORM ROULETTE UI - Core Games Platform
 * Interface da roleta da plataforma
 */

class PlatformRouletteUI {
    constructor() {
        this.rouletteManager = null;
        this.wheelElement = null;
        this.isAnimating = false;
    }

    async init(rouletteManager) {
        this.rouletteManager = rouletteManager;
        console.log('✅ PlatformRouletteUI inicializado');
    }

    // ============================================================
    // RENDERIZAR ROLETA
    // ============================================================
    async renderRoulette() {
        const container = document.querySelector('[data-tab="roulette"]') || 
                         document.getElementById('roulette-container');
        if (!container) return;

        const ticketsRequired = this.rouletteManager.getTicketsRequired();
        const userTickets = globalProfileManager.getGlobalTickets();

        container.innerHTML = `
            <div class="roulette-container">
                <!-- HEADER -->
                <div class="roulette-header">
                    <h2>🎡 Roleta Core Games</h2>
                    <p class="roulette-description">Gire a roleta e ganhe prêmios incríveis!</p>
                </div>

                <!-- TICKETS INFO -->
                <div class="tickets-info">
                    <span class="tickets-icon">🎫</span>
                    <span class="tickets-text">Fichas: <strong>${userTickets}</strong> / ${ticketsRequired} necessária</span>
                </div>

                <!-- ROULETTE WHEEL -->
                <div class="roulette-wheel-container">
                    <div class="roulette-pointer"></div>
                    <div id="roulette-wheel" class="roulette-wheel">
                        ${this.generateWheelSegments()}
                    </div>
                </div>

                <!-- SPIN BUTTON -->
                <div class="spin-button-container">
                    <button 
                        id="spin-btn" 
                        class="btn-spin"
                        onclick="platformRouletteUI.spin()"
                        ${userTickets < ticketsRequired ? 'disabled' : ''}
                    >
                        🎯 Girar Roleta
                    </button>
                </div>

                <!-- REWARDS LIST -->
                <div class="rewards-section">
                    <h3>🏆 Prêmios Possíveis</h3>
                    <div class="rewards-list">
                        ${this.generateRewardsList()}
                    </div>
                </div>

                <!-- LAST SPINS -->
                <div class="last-spins-section">
                    <h3>📊 Últimos Giros</h3>
                    <div id="last-spins" class="last-spins-list">
                        <p class="loading">Carregando histórico...</p>
                    </div>
                </div>
            </div>
        `;

        this.wheelElement = document.getElementById('roulette-wheel');
    }

    // ============================================================
    // GERAR SEGMENTOS DA RODA
    // ============================================================
    generateWheelSegments() {
        const config = this.rouletteManager.getRouletteConfig();
        if (!config) return '';

        const rewards = config.rewards;
        const segmentAngle = 360 / rewards.length;

        return rewards.map((reward, index) => {
            const angle = index * segmentAngle;
            const emoji = this.getRewardEmoji(reward);
            const label = this.getRewardLabel(reward);

            return `
                <div 
                    class="wheel-segment" 
                    style="transform: rotate(${angle}deg); --segment-angle: ${segmentAngle}deg;"
                >
                    <div class="segment-content">
                        <span class="segment-emoji">${emoji}</span>
                        <span class="segment-label">${label}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ============================================================
    // GERAR LISTA DE PRÊMIOS
    // ============================================================
    generateRewardsList() {
        const config = this.rouletteManager.getRouletteConfig();
        if (!config) return '';

        return config.rewards.map(reward => {
            const emoji = this.getRewardEmoji(reward);
            const label = this.getRewardLabel(reward);
            const percentage = Math.round(reward.chance * 100);

            return `
                <div class="reward-item">
                    <span class="reward-emoji">${emoji}</span>
                    <span class="reward-text">${label}</span>
                    <span class="reward-chance">${percentage}%</span>
                </div>
            `;
        }).join('');
    }

    // ============================================================
    // GIRAR ROLETA
    // ============================================================
    async spin() {
        if (this.isAnimating) return;

        const spinBtn = document.getElementById('spin-btn');
        if (spinBtn.disabled) {
            showToast('🎫 Fichas insuficientes!', 'error');
            return;
        }

        this.isAnimating = true;
        spinBtn.disabled = true;

        try {
            // Girar roleta
            const reward = await this.rouletteManager.spinRoulette();

            if (reward) {
                // Animação de rotação
                const randomRotation = Math.random() * 360 + 720; // Mínimo 2 voltas
                this.wheelElement.style.transform = `rotate(${randomRotation}deg)`;

                // Aguardar animação
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Atualizar interface
                await this.renderRoulette();
            }
        } catch (error) {
            console.error('❌ Erro ao girar:', error);
        } finally {
            this.isAnimating = false;
        }
    }

    // ============================================================
    // UTILITÁRIOS
    // ============================================================
    getRewardEmoji(reward) {
        if (reward.type === 'coins') return '💰';
        if (reward.type === 'xp') return '⭐';
        if (reward.type === 'tickets') return '🎫';
        if (reward.type === 'item') return '🎁';
        return '🎯';
    }

    getRewardLabel(reward) {
        if (reward.type === 'coins') return `${reward.amount} Moedas`;
        if (reward.type === 'xp') return `${reward.amount} XP`;
        if (reward.type === 'tickets') return `${reward.amount} Ficha`;
        if (reward.type === 'item') {
            const item = universalShopManager.getItemInfo(reward.itemId);
            return item ? item.name : 'Item';
        }
        return 'Prêmio';
    }
}

// Instância global
const platformRouletteUI = new PlatformRouletteUI();
