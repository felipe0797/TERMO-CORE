/**
 * GLOBAL PROFILE UI - Core Games Platform
 * Interface de perfil global do usuário
 */

class GlobalProfileUI {
    constructor() {
        this.profileManager = null;
    }

    async init(profileManager) {
        this.profileManager = profileManager;
        console.log('✅ GlobalProfileUI inicializado');
    }

    // ============================================================
    // RENDERIZAR PERFIL GLOBAL
    // ============================================================
    async renderGlobalProfile() {
        const container = document.querySelector('[data-tab="profile"]');
        if (!container) return;

        const stats = this.profileManager.globalStats;
        if (!stats) return;

        container.innerHTML = `
            <div class="profile-container">
                <!-- HEADER -->
                <div class="profile-header">
                    <div class="profile-avatar-large">
                        <span class="profile-avatar-emoji">👤</span>
                    </div>
                    <div class="profile-info">
                        <h2 id="profile-username">Carregando...</h2>
                        <p class="profile-status">Membro desde ${this.formatDate(stats.created_at)}</p>
                    </div>
                </div>

                <!-- STATS PRINCIPAIS -->
                <div class="profile-stats-grid">
                    <!-- NÍVEL -->
                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-icon">⭐</span>
                            <span class="stat-label">Nível CG</span>
                        </div>
                        <div class="stat-value">${stats.global_level}</div>
                        <div class="stat-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${this.profileManager.getXPProgress()}%"></div>
                            </div>
                            <span class="progress-text">${stats.global_xp} / ${stats.global_xp_next_level} XP</span>
                        </div>
                    </div>

                    <!-- MOEDAS -->
                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-icon">💰</span>
                            <span class="stat-label">Moedas CG</span>
                        </div>
                        <div class="stat-value">${stats.global_coins}</div>
                        <p class="stat-description">Moedas universais</p>
                    </div>

                    <!-- FICHAS -->
                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-icon">🎫</span>
                            <span class="stat-label">Fichas CG</span>
                        </div>
                        <div class="stat-value">${stats.global_tickets}</div>
                        <p class="stat-description">Para usar na roleta</p>
                    </div>

                    <!-- JOGOS JOGADOS -->
                    <div class="stat-card">
                        <div class="stat-header">
                            <span class="stat-icon">🎮</span>
                            <span class="stat-label">Jogos Jogados</span>
                        </div>
                        <div class="stat-value">${stats.games_played}</div>
                        <p class="stat-description">Diferentes jogos</p>
                    </div>
                </div>

                <!-- INVENTÁRIO -->
                <div class="profile-section">
                    <div class="section-header">
                        <h3>📦 Inventário</h3>
                        <div class="filter-buttons">
                            <button class="filter-btn active" onclick="globalProfileUI.filterInventory('all')">Todos</button>
                            <button class="filter-btn" onclick="globalProfileUI.filterInventory('avatar')">Avatares</button>
                            <button class="filter-btn" onclick="globalProfileUI.filterInventory('theme')">Temas</button>
                            <button class="filter-btn" onclick="globalProfileUI.filterInventory('frame')">Molduras</button>
                        </div>
                    </div>
                    <div id="inventory-container" class="inventory-grid">
                        <p class="loading">Carregando inventário...</p>
                    </div>
                </div>
            </div>
        `;

        // Carregar username
        const user = await authManager.getCurrentUser();
        if (user) {
            const usernameEl = document.getElementById('profile-username');
            if (usernameEl) {
                usernameEl.textContent = user.email.split('@')[0];
            }
        }

        // Carregar inventário
        await this.loadInventory('all');
    }

    // ============================================================
    // CARREGAR INVENTÁRIO
    // ============================================================
    async loadInventory(filter = 'all') {
        const container = document.getElementById('inventory-container');
        if (!container) return;

        container.innerHTML = '<p class="loading">Carregando...</p>';

        try {
            const inventory = await this.profileManager.getInventory();
            
            let filtered = inventory;
            if (filter !== 'all') {
                filtered = inventory.filter(item => item.item_type === filter);
            }

            if (filtered.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <p>Nenhum item encontrado</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = filtered.map(item => `
                <div class="inventory-item ${item.equipped ? 'equipped' : ''}">
                    <div class="item-preview">📦</div>
                    <div class="item-info">
                        <p class="item-name">${item.item_id}</p>
                        <p class="item-game">${item.game_id}</p>
                        ${item.equipped ? '<span class="equipped-badge">Equipado</span>' : ''}
                    </div>
                    <button class="btn-equip" onclick="globalProfileUI.equipItem('${item.item_id}')">
                        ${item.equipped ? '✓ Equipado' : 'Equipar'}
                    </button>
                </div>
            `).join('');
        } catch (error) {
            console.error('❌ Erro ao carregar inventário:', error);
            container.innerHTML = '<p class="error">Erro ao carregar inventário</p>';
        }
    }

    // ============================================================
    // FILTRAR INVENTÁRIO
    // ============================================================
    filterInventory(type) {
        // Atualizar botões
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // Carregar inventário filtrado
        this.loadInventory(type);
    }

    // ============================================================
    // EQUIPAR ITEM
    // ============================================================
    async equipItem(itemId) {
        const success = await this.profileManager.equipItem(itemId);
        if (success) {
            showToast('✅ Item equipado!', 'success');
            await this.loadInventory('all');
        }
    }

    // ============================================================
    // UTILIDADES
    // ============================================================
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // ============================================================
    // ATUALIZAR SIDEBAR COM STATS GLOBAIS
    // ============================================================
    async updateGlobalStatsDisplay() {
        const stats = this.profileManager.globalStats;
        if (!stats) return;

        // Atualizar elementos de stats globais
        const levelEl = document.getElementById('global-level');
        const coinsEl = document.getElementById('global-coins');
        const ticketsEl = document.getElementById('global-tickets');
        const xpEl = document.getElementById('global-xp');

        if (levelEl) levelEl.textContent = stats.global_level;
        if (coinsEl) coinsEl.textContent = stats.global_coins;
        if (ticketsEl) ticketsEl.textContent = stats.global_tickets;
        if (xpEl) {
            xpEl.textContent = `${stats.global_xp} / ${stats.global_xp_next_level}`;
        }
    }
}

// Instância global
const globalProfileUI = new GlobalProfileUI();
