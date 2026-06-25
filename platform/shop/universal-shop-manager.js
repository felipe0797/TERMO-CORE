/**
 * UNIVERSAL SHOP MANAGER - Core Games Platform
 * Gerencia loja universal (temas globais) e lojas específicas por jogo
 */

class UniversalShopManager {
    constructor() {
        this.supabase = null;
        this.currentUserId = null;
        this.shopItems = [];
        this.userPurchases = [];
    }

    // ============================================================
    // INICIALIZAÇÃO
    // ============================================================
    async init(supabaseClient) {
        this.supabase = supabaseClient;
        console.log('✅ UniversalShopManager inicializado');
    }

    async setCurrentUser(userId) {
        this.currentUserId = userId;
        await this.loadShopData();
    }

    // ============================================================
    // CARREGAR DADOS DA LOJA
    // ============================================================
    async loadShopData() {
        if (!this.currentUserId || !this.supabase) return;

        try {
            // Carregar catálogo de itens
            const { data: itemsData } = await this.supabase
                .from('shop_items_catalog')
                .select('*');

            this.shopItems = itemsData || [];

            // Carregar compras do usuário
            const { data: purchasesData } = await this.supabase
                .from('user_shop_purchases')
                .select('*')
                .eq('user_id', this.currentUserId);

            this.userPurchases = purchasesData || [];

            console.log('✅ Dados da loja carregados');
        } catch (error) {
            console.error('❌ Erro ao carregar dados da loja:', error);
        }
    }

    // ============================================================
    // OBTER ITENS POR ESCOPO
    // ============================================================
    getGlobalShopItems() {
        return this.shopItems.filter(item => item.scope === 'global');
    }

    getGameShopItems(gameId) {
        return this.shopItems.filter(item => item.scope === 'game' && item.game_id === gameId);
    }

    getItemsByType(type, gameId = null) {
        let items = this.shopItems.filter(item => item.item_type === type);
        if (gameId) {
            items = items.filter(item => item.game_id === gameId || item.scope === 'global');
        }
        return items;
    }

    // ============================================================
    // COMPRAR ITEM
    // ============================================================
    async buyItem(itemId) {
        if (!this.currentUserId || !this.supabase) return false;

        try {
            // Buscar item
            const item = this.shopItems.find(i => i.id === itemId);
            if (!item) {
                showToast('Item não encontrado', 'error');
                return false;
            }

            // Verificar se já foi comprado
            const alreadyBought = this.userPurchases.some(p => p.item_id === itemId);
            if (alreadyBought) {
                showToast('Você já possui este item', 'warning');
                return false;
            }

            // Verificar moedas
            const userCoins = globalProfileManager.getGlobalCoins();
            if (userCoins < item.price) {
                showToast('💰 Moedas insuficientes!', 'error');
                return false;
            }

            // Descontar moedas
            const success = await globalProfileManager.removeGlobalCoins(item.price);
            if (!success) return false;

            // Registrar compra
            const { error } = await this.supabase
                .from('user_shop_purchases')
                .insert([{
                    user_id: this.currentUserId,
                    item_id: itemId,
                    purchased_at: new Date().toISOString()
                }]);

            if (error) throw error;

            // Adicionar ao inventário
            await globalProfileManager.addToInventory(itemId, item.game_id || 'global', item.item_type);

            // Atualizar lista local
            this.userPurchases.push({
                item_id: itemId,
                purchased_at: new Date().toISOString()
            });

            showToast(`✅ Você comprou ${item.name}!`, 'success');
            await this.loadShopData();
            return true;
        } catch (error) {
            console.error('❌ Erro ao comprar item:', error);
            showToast('Erro ao comprar item', 'error');
            return false;
        }
    }

    // ============================================================
    // VERIFICAR POSSE
    // ============================================================
    hasItem(itemId) {
        return this.userPurchases.some(p => p.item_id === itemId);
    }

    // ============================================================
    // INICIALIZAR ITENS PADRÃO
    // ============================================================
    async initializeDefaultItems() {
        if (!this.supabase) return;

        const defaultItems = [
            // TEMAS GLOBAIS (Plataforma)
            {
                id: 'theme_dark',
                name: 'Tema Escuro',
                description: 'Tema escuro padrão',
                item_type: 'theme',
                scope: 'global',
                price: 0,
                icon: '🌙',
                is_default: true
            },
            {
                id: 'theme_neon',
                name: 'Tema Neon',
                description: 'Tema neon brilhante',
                item_type: 'theme',
                scope: 'global',
                price: 500,
                icon: '💡'
            },
            {
                id: 'theme_sunset',
                name: 'Tema Sunset',
                description: 'Cores quentes do pôr do sol',
                item_type: 'theme',
                scope: 'global',
                price: 500,
                icon: '🌅'
            },
            {
                id: 'theme_forest',
                name: 'Tema Floresta',
                description: 'Cores naturais da floresta',
                item_type: 'theme',
                scope: 'global',
                price: 500,
                icon: '🌲'
            },
            // MOLDURAS GLOBAIS
            {
                id: 'frame_gold',
                name: 'Moldura Dourada',
                description: 'Moldura elegante em ouro',
                item_type: 'frame',
                scope: 'global',
                price: 300,
                icon: '✨'
            },
            {
                id: 'frame_diamond',
                name: 'Moldura Diamante',
                description: 'Moldura de diamante brilhante',
                item_type: 'frame',
                scope: 'global',
                price: 500,
                icon: '💎'
            },
            // TEMAS TERMOCORE
            {
                id: 'termocore_theme_cyberpunk',
                name: 'Tema Cyberpunk',
                description: 'Tema futurista do TermoCore',
                item_type: 'theme',
                scope: 'game',
                game_id: 'termocore',
                price: 400,
                icon: '🤖'
            },
            {
                id: 'termocore_theme_retro',
                name: 'Tema Retrô',
                description: 'Tema retrô dos anos 80',
                item_type: 'theme',
                scope: 'game',
                game_id: 'termocore',
                price: 400,
                icon: '📼'
            },
            // AVATARES TERMOCORE
            {
                id: 'termocore_avatar_robot',
                name: 'Avatar Robô',
                description: 'Avatar robô futurista',
                item_type: 'avatar',
                scope: 'game',
                game_id: 'termocore',
                price: 300,
                icon: '🤖'
            },
            {
                id: 'termocore_avatar_alien',
                name: 'Avatar Alienígena',
                description: 'Avatar alienígena misterioso',
                item_type: 'avatar',
                scope: 'game',
                game_id: 'termocore',
                price: 300,
                icon: '👽'
            }
        ];

        try {
            // Verificar quais já existem
            const { data: existing } = await this.supabase
                .from('shop_items_catalog')
                .select('id');

            const existingIds = existing?.map(i => i.id) || [];

            // Inserir apenas os novos
            const toInsert = defaultItems.filter(i => !existingIds.includes(i.id));

            if (toInsert.length > 0) {
                await this.supabase
                    .from('shop_items_catalog')
                    .insert(toInsert);

                console.log(`✅ ${toInsert.length} itens padrão criados`);
            }
        } catch (error) {
            console.error('❌ Erro ao inicializar itens padrão:', error);
        }
    }

    // ============================================================
    // GETTERS
    // ============================================================
    getItemInfo(itemId) {
        return this.shopItems.find(i => i.id === itemId);
    }

    getPurchasedItems() {
        return this.userPurchases;
    }

    getPurchasedCount() {
        return this.userPurchases.length;
    }
}

// Instância global
const universalShopManager = new UniversalShopManager();
