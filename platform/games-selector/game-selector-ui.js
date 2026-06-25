/**
 * GAME SELECTOR UI - Core Games Platform
 * Interface de seleção de jogos estilo Netflix
 */

class GameSelectorUI {
    constructor() {
        this.games = [];
    }

    // ============================================================
    // INICIALIZAR CATÁLOGO DE JOGOS
    // ============================================================
    initializeGamesCatalog() {
        this.games = [
            {
                id: 'termocore',
                name: 'TermoCore',
                description: 'Descubra palavras secretas em 3 modos de jogo emocionantes',
                image: '📝',
                color: '#6366f1',
                status: 'available',
                rating: 4.8,
                players: '1.2M+',
                tags: ['Palavras', 'Puzzle', 'Desafio'],
                path: 'games/termocore/index.html'
            },
            {
                id: 'coming_soon_1',
                name: 'Jogo 2',
                description: 'Em breve...',
                image: '🎮',
                color: '#8b5cf6',
                status: 'coming_soon',
                rating: 0,
                players: '0',
                tags: ['Em Breve'],
                path: null
            },
            {
                id: 'coming_soon_2',
                name: 'Jogo 3',
                description: 'Em breve...',
                image: '🎯',
                color: '#a78bfa',
                status: 'coming_soon',
                rating: 0,
                players: '0',
                tags: ['Em Breve'],
                path: null
            }
        ];
    }

    // ============================================================
    // RENDERIZAR SELETOR DE JOGOS
    // ============================================================
    async renderGameSelector() {
        const container = document.getElementById('games-selector-container') ||
                         document.querySelector('[data-section="games"]');
        if (!container) return;

        this.initializeGamesCatalog();

        container.innerHTML = `
            <div class="games-selector">
                <!-- HEADER -->
                <div class="selector-header">
                    <h1>🎮 Biblioteca de Jogos</h1>
                    <p class="selector-subtitle">Escolha um jogo e comece a jogar</p>
                </div>

                <!-- FEATURED GAME -->
                <div class="featured-game">
                    ${this.renderFeaturedGame(this.games[0])}
                </div>

                <!-- GAMES GRID -->
                <div class="games-grid">
                    ${this.games.map(game => this.renderGameCard(game)).join('')}
                </div>
            </div>
        `;

        // Adicionar event listeners
        this.attachEventListeners();
    }

    // ============================================================
    // RENDERIZAR JOGO EM DESTAQUE
    // ============================================================
    renderFeaturedGame(game) {
        return `
            <div class="featured-card" style="background: linear-gradient(135deg, ${game.color} 0%, rgba(99, 102, 241, 0.1) 100%)">
                <div class="featured-content">
                    <div class="featured-image">${game.image}</div>
                    <div class="featured-info">
                        <h2>${game.name}</h2>
                        <p>${game.description}</p>
                        <div class="featured-stats">
                            <span class="stat">⭐ ${game.rating}</span>
                            <span class="stat">👥 ${game.players} jogadores</span>
                        </div>
                        <div class="featured-tags">
                            ${game.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                        <button 
                            class="btn-play" 
                            onclick="gameSelectorUI.playGame('${game.id}')"
                            ${game.status === 'coming_soon' ? 'disabled' : ''}
                        >
                            ${game.status === 'available' ? '▶️ Jogar Agora' : '⏳ Em Breve'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================================
    // RENDERIZAR CARD DE JOGO
    // ============================================================
    renderGameCard(game) {
        return `
            <div class="game-card ${game.status}" style="--game-color: ${game.color}">
                <div class="card-image">${game.image}</div>
                <div class="card-overlay">
                    <div class="card-info">
                        <h3>${game.name}</h3>
                        <p>${game.description}</p>
                        <div class="card-stats">
                            ${game.rating > 0 ? `<span>⭐ ${game.rating}</span>` : ''}
                            ${game.players !== '0' ? `<span>👥 ${game.players}</span>` : ''}
                        </div>
                        <button 
                            class="btn-card-play" 
                            onclick="gameSelectorUI.playGame('${game.id}')"
                            ${game.status === 'coming_soon' ? 'disabled' : ''}
                        >
                            ${game.status === 'available' ? '▶️ Jogar' : '⏳ Em Breve'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ============================================================
    // JOGAR JOGO
    // ============================================================
    async playGame(gameId) {
        const game = this.games.find(g => g.id === gameId);
        if (!game || game.status !== 'available') {
            showToast('Jogo não disponível', 'warning');
            return;
        }

        try {
            // Registrar que está jogando este jogo
            await globalProfileManager.addGamePlayed(gameId);

            // Salvar no localStorage
            localStorage.setItem(STORAGE_KEYS.CURRENT_GAME, gameId);

            // Redirecionar para o jogo
            window.location.href = game.path;
        } catch (error) {
            console.error('❌ Erro ao iniciar jogo:', error);
            showToast('Erro ao iniciar jogo', 'error');
        }
    }

    // ============================================================
    // ANEXAR EVENT LISTENERS
    // ============================================================
    attachEventListeners() {
        // Hover effects
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }
}

// Instância global
const gameSelectorUI = new GameSelectorUI();
