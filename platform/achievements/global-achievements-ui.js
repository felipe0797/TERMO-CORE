/**
 * GLOBAL ACHIEVEMENTS UI - Core Games Platform
 * Interface de conquistas globais com filtro por jogo
 */

class GlobalAchievementsUI {
    constructor() {
        this.achievementsManager = null;
        this.currentFilter = 'global';
    }

    async init(achievementsManager) {
        this.achievementsManager = achievementsManager;
        console.log('✅ GlobalAchievementsUI inicializado');
    }

    // ============================================================
    // RENDERIZAR CONQUISTAS
    // ============================================================
    async renderGlobalAchievements() {
        const container = document.querySelector('[data-tab="achievements"]');
        if (!container) return;

        const unlockedCount = this.achievementsManager.getUnlockedCount();
        const totalCount = this.achievementsManager.getTotalCount();
        const progressPercentage = this.achievementsManager.getProgressPercentage();

        container.innerHTML = `
            <div class="achievements-container">
                <!-- HEADER -->
                <div class="achievements-header">
                    <h2>🏆 Conquistas</h2>
                    <div class="achievements-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                        </div>
                        <p class="progress-text">${unlockedCount} / ${totalCount} Desbloqueadas</p>
                    </div>
                </div>

                <!-- FILTROS -->
                <div class="achievements-filters">
                    <button class="filter-btn active" onclick="globalAchievementsUI.switchFilter('global')">
                        🌍 Globais
                    </button>
                    <button class="filter-btn" onclick="globalAchievementsUI.switchFilter('termocore')">
                        📝 TermoCore
                    </button>
                </div>

                <!-- GRID DE CONQUISTAS -->
                <div id="achievements-grid" class="achievements-grid">
                    <p class="loading">Carregando conquistas...</p>
                </div>
            </div>
        `;

        // Carregar conquistas
        await this.loadAchievements('global');
    }

    // ============================================================
    // CARREGAR CONQUISTAS
    // ============================================================
    async loadAchievements(filter) {
        const container = document.getElementById('achievements-grid');
        if (!container) return;

        container.innerHTML = '<p class="loading">Carregando...</p>';

        try {
            let achievements;

            if (filter === 'global') {
                achievements = this.achievementsManager.getAchievementsByType('global');
            } else if (filter === 'termocore') {
                achievements = this.achievementsManager.getAchievementsByGame('termocore');
            } else {
                achievements = [];
            }

            if (achievements.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <p>Nenhuma conquista disponível</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = achievements.map(achievement => {
                const isUnlocked = this.achievementsManager.isAchievementUnlocked(achievement.id);

                return `
                    <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
                        <div class="achievement-icon">${achievement.icon}</div>
                        <div class="achievement-info">
                            <h4>${achievement.name}</h4>
                            <p>${achievement.description}</p>
                        </div>
                        <div class="achievement-rewards">
                            ${achievement.reward_xp ? `<span class="reward-xp">+${achievement.reward_xp} XP</span>` : ''}
                            ${achievement.reward_coins ? `<span class="reward-coins">+${achievement.reward_coins} 💰</span>` : ''}
                        </div>
                        ${!isUnlocked ? '<div class="locked-overlay">🔒</div>' : '<div class="unlocked-badge">✓</div>'}
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('❌ Erro ao carregar conquistas:', error);
            container.innerHTML = '<p class="error">Erro ao carregar conquistas</p>';
        }
    }

    // ============================================================
    // ALTERNAR FILTRO
    // ============================================================
    switchFilter(filter) {
        this.currentFilter = filter;

        // Atualizar botões
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // Carregar conquistas filtradas
        this.loadAchievements(filter);
    }
}

// Instância global
const globalAchievementsUI = new GlobalAchievementsUI();
