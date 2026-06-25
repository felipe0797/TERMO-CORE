/**
 * UNIVERSAL SHOP UI - Core Games Platform
 * Interface da loja universal com filtro por jogo e tipo
 */

class UniversalShopUI {
    constructor() {
        this.shopManager = null;
        this.currentFilter = 'global';
        this.currentType = 'all';
    }

    async init(shopManager) {
        this.shopManager = shopManager;
        console.log('✅ UniversalShopUI inicializado');
    }

    // ============================================================
    // RENDERIZAR LOJA
    // ============================================================
    async renderUniversalShop() {
        const container = document.querySelector('[data-tab="shop"]');
        if (!container) return;

        container.innerHTML = `
            <div class="shop-container">
                <!-- HEADER -->
                <div class="shop-header">
                    <h2>🛒 Loja</h2>
                    <div class="coins-display">
                        <span class="coins-icon">💰</span>
                        <span class="coins-value" id="shop-coins">0</span>
                    </div>
                </div>

                <!-- FILTROS -->
                <div class="shop-filters">
                    <div class="filter-group">
                        <label>Escopo:</label>
                        <div class="filter-buttons">
                            <button class="filter-btn active" onclick="universalShopUI.switchFilter('global')">
                                🌍 Global
                            </button>
                            <button class="filter-btn" onclick="universalShopUI.switchFilter('termocore')">
                                📝 TermoCore
                            </button>
                        </div>
                    </div>

                    <div class="filter-group">
                        <label>Tipo:</label>
                        <div class="filter-buttons">
                            <button class="filter-btn active" onclick="universalShopUI.switchType('all')">
                                Todos
                            </button>
                            <button class="filter-btn" onclick="universalShopUI.switchType('theme')">
                                🎨 Temas
                            </button>
                            <button class="filter-btn" onclick="universalShopUI.switchType('avatar')">
                                👤 Avatares
                            </button>
                            <button class="filter-btn" onclick="universalShopUI.switchType('frame')">
                                ✨ Molduras
                            </button>
                        </div>
                    </div>
                </div>

                <!-- GRID DE ITENS -->
                <div id="shop-grid" class="shop-grid">
                    <p class="loading">Carregando itens...</p>
                </div>
            </div>
        `;

        // Atualizar moedas
        this.updateCoinsDisplay();

        // Carregar itens
        await this.loadShopItems('global', 'all');
    }

    // ============================================================
    // CARREGAR ITENS DA LOJA
    // ============================================================
    async loadShopItems(scope, type) {
        const container = document.getElementById('shop-grid');
        if (!container) return;

        container.innerHTML = '<p class="loading">Carregando...</p>';

        try {
            let items;

            if (scope === 'global') {
                items = this.shopManager.getGlobalShopItems();
            } else if (scope === 'termocore') {
                items = this.shopManager.getGameShopItems('termocore');
            } else {
                items = [];
            }

            // Filtrar por tipo
            if (type !== 'all') {
                items = items.filter(item => item.item_type === type);
            }

            if (items.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <p>Nenhum item disponível</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = items.map(item => {
                const hasItem = this.shopManager.hasItem(item.id);
                const isDefault = item.is_default || false;

                return `
                    <div class="shop-item-card ${hasItem ? 'owned' : ''}">
                        <div class="item-preview">${item.icon}</div>
                        <div class="item-header">
                            <h4>${item.name}</h4>
                            ${hasItem ? '<span class="owned-badge">✓ Possuído</span>' : ''}
                        </div>
                        <p class="item-description">${item.description}</p>
                        <div class="item-footer">
                            ${!isDefault ? `
                                <span class="item-price">
                                    <span class="price-icon">💰</span>
                                    ${item.price}
                                </span>
                            ` : '<span class="item-price default">Padrão</span>'}
                            <button 
                                class="btn-buy" 
                                onclick="universalShopUI.buyItem('${item.id}')"
                                ${hasItem ? 'disabled' : ''}
                            >
                                ${hasItem ? '✓ Possuído' : 'Comprar'}
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('❌ Erro ao carregar itens:', error);
            container.innerHTML = '<p class="error">Erro ao carregar itens</p>';
        }
    }

    // ============================================================
    // ALTERNAR FILTRO DE ESCOPO
    // ============================================================
    switchFilter(scope) {
        this.currentFilter = scope;

        // Atualizar botões de filtro
        document.querySelectorAll('.filter-group:first-child .filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // Carregar itens
        this.loadShopItems(scope, this.currentType);
    }

    // ============================================================
    // ALTERNAR FILTRO DE TIPO
    // ============================================================
    switchType(type) {
        this.currentType = type;

        // Atualizar botões de tipo
        document.querySelectorAll('.filter-group:last-child .filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        // Carregar itens
        this.loadShopItems(this.currentFilter, type);
    }

    // ============================================================
    // COMPRAR ITEM
    // ============================================================
    async buyItem(itemId) {
        const success = await this.shopManager.buyItem(itemId);
        if (success) {
            this.updateCoinsDisplay();
            await this.loadShopItems(this.currentFilter, this.currentType);
        }
    }

    // ============================================================
    // ATUALIZAR EXIBIÇÃO DE MOEDAS
    // ============================================================
    updateCoinsDisplay() {
        const coinsEl = document.getElementById('shop-coins');
        if (coinsEl) {
            const coins = globalProfileManager.getGlobalCoins();
            coinsEl.textContent = coins;
        }
    }
}

// Instância global
const universalShopUI = new UniversalShopUI();
