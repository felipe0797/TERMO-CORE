/**
 * GAME SELECTOR - Core Games Platform
 * Seletor de jogos estilo Netflix
 */

class GameSelector {
    constructor() {
        this.currentTab = 'games'; // games, profile, social, achievements, shop
        this.currentUser = null;
        this.userStats = null;
    }

    /**
     * Renderizar Game Selector
     */
    async renderGameSelector() {
        const screen = document.getElementById('screen-games-selector');
        if (!screen) return;

        // Obter dados do usuário
        this.currentUser = authManager.getCurrentUsername();
        
        screen.innerHTML = `
            <div class="games-selector-container">
                <!-- HEADER -->
                <header class="games-header">
                    <div class="games-header-left">
                        <div class="games-logo">
                            <span class="logo-core">CORE</span>
                            <span class="logo-games">GAMES</span>
                        </div>
                    </div>
                    <div class="games-header-right">
                        <div class="user-info">
                            <span class="user-name">${this.currentUser}</span>
                            ${authManager.isGuestUser() ? '<span class="guest-badge">👤 Visitante</span>' : ''}
                        </div>
                        <button onclick="gameSelector.handleLogout()" class="btn-logout">SAIR</button>
                    </div>
                </header>

                <!-- TABS -->
                <nav class="games-tabs">
                    <button 
                        class="tab-btn active" 
                        onclick="gameSelector.switchTab('games')"
                        data-tab="games"
                    >
                        🎮 Jogos
                    </button>
                    <button 
                        class="tab-btn" 
                        onclick="gameSelector.switchTab('profile')"
                        data-tab="profile"
                    >
                        👤 Perfil
                    </button>
                    <button 
                        class="tab-btn" 
                        onclick="gameSelector.switchTab('social')"
                        data-tab="social"
                    >
                        👥 Social
                    </button>
                    <button 
                        class="tab-btn" 
                        onclick="gameSelector.switchTab('achievements')"
                        data-tab="achievements"
                    >
                        🏆 Conquistas
                    </button>
                    <button 
                        class="tab-btn" 
                        onclick="gameSelector.switchTab('shop')"
                        data-tab="shop"
                    >
                        🛒 Loja
                    </button>
                </nav>

                <!-- CONTENT -->
                <main class="games-content">
                    <!-- TAB: GAMES -->
                    <div id="tab-games" class="tab-content active">
                        <div class="games-grid">
                            ${this.renderGameCards()}
                        </div>
                    </div>

                    <!-- TAB: PROFILE -->
                    <div id="tab-profile" class="tab-content">
                        ${this.renderProfileTab()}
                    </div>

                    <!-- TAB: SOCIAL -->
                    <div id="tab-social" class="tab-content">
                        ${this.renderSocialTab()}
                    </div>

                    <!-- TAB: ACHIEVEMENTS -->
                    <div id="tab-achievements" class="tab-content">
                        ${this.renderAchievementsTab()}
                    </div>

                    <!-- TAB: SHOP -->
                    <div id="tab-shop" class="tab-content">
                        ${this.renderShopTab()}
                    </div>
                </main>
            </div>
        `;
    }

    /**
     * Renderizar cards de jogos
     */
    renderGameCards() {
        return GAMES_CATALOG.map(game => `
            <div class="game-card" style="--game-color: ${game.color}">
                <div class="game-card-image">
                    <div class="game-icon">${game.icon}</div>
                </div>
                <div class="game-card-content">
                    <h3 class="game-name">${game.name}</h3>
                    <p class="game-description">${game.description}</p>
                    <div class="game-card-footer">
                        <span class="game-version">${game.version}</span>
                        <button 
                            onclick="gameSelector.playGame('${game.id}')" 
                            class="btn-play"
                        >
                            JOGAR
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Renderizar aba Perfil (design apenas)
     */
    renderProfileTab() {
        return `
            <div class="profile-tab">
                <div class="profile-header">
                    <div class="profile-avatar">👤</div>
                    <div class="profile-info">
                        <h2>${this.currentUser}</h2>
                        <p class="profile-status">Nível 1</p>
                    </div>
                </div>

                <div class="profile-stats">
                    <div class="stat-card">
                        <div class="stat-label">XP Total</div>
                        <div class="stat-value">0</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Moedas</div>
                        <div class="stat-value">0</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Partidas</div>
                        <div class="stat-value">0</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-label">Taxa de Vitória</div>
                        <div class="stat-value">0%</div>
                    </div>
                </div>

                <div class="profile-section">
                    <h3>Sobre</h3>
                    <p class="text-muted">Dados de perfil compartilhados entre todos os jogos da plataforma.</p>
                </div>
            </div>
        `;
    }

    /**
     * Renderizar aba Social (design apenas)
     */
    renderSocialTab() {
        return `
            <div class="social-tab">
                <div class="social-header">
                    <h2>Social</h2>
                    <p class="text-muted">Conecte-se com outros jogadores</p>
                </div>

                <div class="social-sections">
                    <div class="social-section">
                        <h3>👥 Amigos</h3>
                        <div class="friends-list">
                            <div class="empty-state">
                                <p>Você ainda não tem amigos.</p>
                                <button class="btn-secondary">Adicionar Amigos</button>
                            </div>
                        </div>
                    </div>

                    <div class="social-section">
                        <h3>💬 Mensagens</h3>
                        <div class="messages-list">
                            <div class="empty-state">
                                <p>Nenhuma mensagem ainda.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Renderizar aba Conquistas (design apenas)
     */
    renderAchievementsTab() {
        return `
            <div class="achievements-tab">
                <div class="achievements-header">
                    <h2>Conquistas</h2>
                    <p class="text-muted">Desbloqueie troféus jogando</p>
                </div>

                <div class="achievements-grid">
                    <div class="achievement-card locked">
                        <div class="achievement-icon">🎯</div>
                        <div class="achievement-name">Primeira Vitória</div>
                        <div class="achievement-desc">Vença sua primeira partida</div>
                    </div>
                    <div class="achievement-card locked">
                        <div class="achievement-icon">💎</div>
                        <div class="achievement-name">Perfeição</div>
                        <div class="achievement-desc">Complete sem erros</div>
                    </div>
                    <div class="achievement-card locked">
                        <div class="achievement-icon">🏔️</div>
                        <div class="achievement-name">Escalador</div>
                        <div class="achievement-desc">Chegue à fase 10</div>
                    </div>
                    <div class="achievement-card locked">
                        <div class="achievement-icon">⭐</div>
                        <div class="achievement-name">Veterano</div>
                        <div class="achievement-desc">Alcance nível 10</div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Renderizar aba Loja (design apenas)
     */
    renderShopTab() {
        return `
            <div class="shop-tab">
                <div class="shop-header">
                    <h2>Loja</h2>
                    <p class="text-muted">Compre cosméticos e itens especiais</p>
                </div>

                <div class="shop-categories">
                    <div class="shop-category">
                        <h3>🎨 Temas</h3>
                        <div class="shop-items">
                            <div class="shop-item">
                                <div class="item-preview">🌀</div>
                                <div class="item-name">Neon Night</div>
                                <div class="item-price">5000 💰</div>
                                <button class="btn-secondary">Comprar</button>
                            </div>
                            <div class="shop-item">
                                <div class="item-preview">🌅</div>
                                <div class="item-name">Sunset Horizon</div>
                                <div class="item-price">6000 💰</div>
                                <button class="btn-secondary">Comprar</button>
                            </div>
                        </div>
                    </div>

                    <div class="shop-category">
                        <h3>👤 Avatares</h3>
                        <div class="shop-items">
                            <div class="shop-item">
                                <div class="item-preview">🎭</div>
                                <div class="item-name">Avatar 1</div>
                                <div class="item-price">200 💰</div>
                                <button class="btn-secondary">Comprar</button>
                            </div>
                            <div class="shop-item">
                                <div class="item-preview">🤖</div>
                                <div class="item-name">Avatar 2</div>
                                <div class="item-price">250 💰</div>
                                <button class="btn-secondary">Comprar</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Alternar aba
     */
    switchTab(tabName) {
        // Remover active de todas as abas
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Adicionar active à aba selecionada
        const tabContent = document.getElementById(`tab-${tabName}`);
        const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);

        if (tabContent) tabContent.classList.add('active');
        if (tabBtn) tabBtn.classList.add('active');

        this.currentTab = tabName;
    }

    /**
     * Jogar um jogo
     */
    playGame(gameId) {
        const game = getGameInfo(gameId);
        if (!game) {
            showToast('Jogo não encontrado', 'error');
            return;
        }

        console.log(`🎮 Abrindo jogo: ${game.name}`);
        
        // Salvar jogo atual no localStorage
        saveToLocalStorage(STORAGE_KEYS.CURRENT_GAME, gameId);
        
        // Redirecionar para o jogo
        window.location.href = game.url;
    }

    /**
     * Fazer logout
     */
    async handleLogout() {
        if (!confirm('Tem certeza que deseja sair?')) {
            return;
        }

        const result = await authManager.logoutUser();

        if (result.error) {
            showToast(result.error, 'error');
            return;
        }

        showToast('Logout realizado com sucesso!', 'success');
        
        // Limpar localStorage
        clearLocalStorage();
        
        // Voltar para login
        await delay(500);
        showScreen('screen-login');
        authUI.renderLoginScreen();
    }
}

// Instância global
const gameSelector = new GameSelector();
