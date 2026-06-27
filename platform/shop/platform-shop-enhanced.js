/**
 * PLATFORM SHOP ENHANCED v2.2
 * Loja da plataforma Core Games.
 * Vende APENAS itens da plataforma (prefixo pf_theme_).
 * Itens dos jogos (TermoCore, etc.) são vendidos dentro de cada jogo.
 * Após compra: atualiza inventário, header e perfil.
 */

// ============================================================
// RENDERIZAR LOJA
// ============================================================
async function renderEnhancedShop() {
    const container = document.querySelector('[data-tab="shop"]');
    if (!container) return;

    try {
        const raw = localStorage.getItem('cg_current_user');
        if (!raw) {
            container.innerHTML = '<p style="color:#a0aec0;padding:20px;">Usuário não autenticado</p>';
            return;
        }
        const userData = JSON.parse(raw);

        // Carregar stats e itens já comprados em paralelo
        const [stats, ownedItems, currentTheme] = await Promise.all([
            loadUserDataFromTermoCore(userData.id),
            getOwnedPlatformItems(userData.id),
            getUserActiveTheme(userData.id)
        ]);

        const coins = stats?.coins || 0;

        // Catálogo vem de platform-data-sync.js (PLATFORM_SHOP_CATALOG)
        const catalog = typeof PLATFORM_SHOP_CATALOG !== 'undefined' ? PLATFORM_SHOP_CATALOG : [];
        const forSale = catalog.filter(item => !item.isDefault);

        container.innerHTML = `
        <div style="padding:20px;max-width:900px;margin:0 auto;">

            <!-- CABEÇALHO -->
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
                <div>
                    <div style="font-size:22px;font-weight:700;color:#00d4ff;">🛒 Loja da Plataforma</div>
                    <div style="color:#a0aec0;font-size:13px;margin-top:4px;">Itens exclusivos da plataforma Core Games</div>
                </div>
                <div style="background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.3);padding:10px 18px;border-radius:8px;display:flex;align-items:center;gap:8px;">
                    <span style="font-size:20px;">💰</span>
                    <span style="color:#fbbf24;font-weight:700;font-size:18px;" id="shop-coins-display">${coins.toLocaleString('pt-BR')}</span>
                    <span style="color:#a0aec0;font-size:12px;">moedas</span>
                </div>
            </div>

            <!-- AVISO SOBRE SEPARAÇÃO DE LOJAS -->
            <div style="background:rgba(0,212,255,.05);border:1px solid rgba(0,212,255,.15);border-radius:8px;padding:12px 16px;margin-bottom:20px;font-size:12px;color:#a0aec0;">
                💡 <strong style="color:#00d4ff;">Temas da plataforma</strong> personalizam o visual do lobby Core Games.
                Para avatares, cosméticos e temas do TermoCore, acesse a loja dentro do próprio jogo.
            </div>

            <!-- SEÇÃO: TEMAS DA PLATAFORMA -->
            <div style="margin-bottom:28px;">
                <div style="font-weight:700;color:#00d4ff;margin-bottom:14px;font-size:15px;">🎨 Temas da Plataforma</div>
                <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;">
                    ${forSale.map(item => {
                        const owned  = ownedItems.includes(item.id);
                        const active = currentTheme === item.id;
                        const canBuy = !owned && coins >= item.price;

                        return `
                        <div style="background:linear-gradient(135deg,rgba(0,212,255,.08),rgba(0,100,200,.08));padding:18px;border-radius:10px;
                                    border:2px solid ${active?'rgba(0,212,255,.5)':'rgba(0,212,255,.1)'};
                                    display:flex;flex-direction:column;gap:10px;transition:all .2s;"
                             onmouseover="this.style.transform='translateY(-2px)';this.style.borderColor='rgba(0,212,255,.35)'"
                             onmouseout="this.style.transform='translateY(0)';this.style.borderColor='${active?'rgba(0,212,255,.5)':'rgba(0,212,255,.1)'}'">

                            <!-- PREVIEW DE COR -->
                            <div style="height:50px;border-radius:6px;background:${item.colors.bg};display:flex;align-items:center;justify-content:center;font-size:22px;">
                                ${item.icon}
                            </div>

                            <div>
                                <div style="color:#cbd5e0;font-weight:700;font-size:14px;">${item.name}</div>
                                <div style="color:#718096;font-size:11px;margin-top:3px;">${item.description}</div>
                            </div>

                            ${active ? `
                                <div style="padding:8px;background:rgba(16,185,129,.15);color:#10b981;border:1px solid rgba(16,185,129,.3);border-radius:6px;font-size:12px;font-weight:700;text-align:center;">
                                    ✓ ATIVO
                                </div>
                            ` : owned ? `
                                <button onclick="equipThemeOnPlatform('${userData.id}','${item.id}')"
                                    style="padding:8px;background:rgba(0,212,255,.15);color:#00d4ff;border:1px solid rgba(0,212,255,.3);border-radius:6px;cursor:pointer;font-size:12px;font-weight:700;transition:all .2s;"
                                    onmouseover="this.style.background='rgba(0,212,255,.3)'"
                                    onmouseout="this.style.background='rgba(0,212,255,.15)'">
                                    ✓ Equipar
                                </button>
                            ` : `
                                <button onclick="buyPlatformItem('${userData.id}','${item.id}',${item.price})"
                                    ${!canBuy ? 'disabled' : ''}
                                    style="padding:8px;background:${canBuy?'linear-gradient(135deg,#00d4ff,#0099cc)':'rgba(100,100,100,.2)'};
                                           color:${canBuy?'#000':'#718096'};border:none;border-radius:6px;
                                           cursor:${canBuy?'pointer':'not-allowed'};font-size:12px;font-weight:700;transition:all .2s;">
                                    ${coins < item.price ? `❌ ${item.price.toLocaleString('pt-BR')} moedas` : `💰 ${item.price.toLocaleString('pt-BR')} moedas`}
                                </button>
                            `}
                        </div>
                        `;
                    }).join('')}
                </div>
            </div>

            <!-- LINK PARA LOJA DO TERMOCORE -->
            <div style="background:rgba(0,212,255,.05);border:1px solid rgba(0,212,255,.1);border-radius:10px;padding:18px;text-align:center;">
                <div style="font-size:20px;margin-bottom:8px;">🎮</div>
                <div style="color:#cbd5e0;font-weight:600;margin-bottom:6px;">Quer mais itens?</div>
                <div style="color:#a0aec0;font-size:13px;margin-bottom:14px;">Avatares, cosméticos e temas do TermoCore estão na loja dentro do jogo.</div>
                <button onclick="launchGame('termocore')"
                    style="padding:10px 24px;background:linear-gradient(135deg,#00d4ff,#0099cc);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;font-size:13px;">
                    Ir para TermoCore
                </button>
            </div>
        </div>
        `;

        console.log('✅ [Shop] Loja renderizada');
    } catch (err) {
        console.error('❌ [Shop] renderEnhancedShop:', err);
        container.innerHTML = '<p style="color:#ef4444;padding:20px;">Erro ao carregar loja. Tente novamente.</p>';
    }
}

// ============================================================
// OBTER ITENS DA PLATAFORMA JÁ COMPRADOS
// ============================================================
async function getOwnedPlatformItems(userId) {
    try {
        const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
        if (!client) return [];

        const { data, error } = await client
            .from('shop_items')
            .select('item_id')
            .eq('user_id', userId)
            .like('item_id', 'pf_%');

        if (error || !data) return [];
        return data.map(r => r.item_id);
    } catch (err) {
        console.error('❌ [Shop] getOwnedPlatformItems:', err);
        return [];
    }
}

// ============================================================
// COMPRAR ITEM DA PLATAFORMA
// ============================================================
async function buyPlatformItem(userId, itemId, price) {
    const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;
    if (!client) { showToast('Erro de conexão', 'error'); return; }

    try {
        // 1. Verificar saldo atual
        const { data: statsData, error: statsErr } = await client
            .from('game_stats')
            .select('coins')
            .eq('user_id', userId)
            .single();

        if (statsErr || !statsData) { showToast('Erro ao verificar saldo', 'error'); return; }
        if ((statsData.coins || 0) < price) {
            showToast(`❌ Moedas insuficientes! Você tem ${statsData.coins}, precisa de ${price}`, 'error');
            return;
        }

        // 2. Verificar se já possui o item
        const { data: existing } = await client
            .from('shop_items')
            .select('id')
            .eq('user_id', userId)
            .eq('item_id', itemId)
            .maybeSingle();

        if (existing) { showToast('Você já possui este item!', 'warning'); return; }

        // 3. Descontar moedas
        const newCoins = statsData.coins - price;
        const { error: updateErr } = await client
            .from('game_stats')
            .update({ coins: newCoins })
            .eq('user_id', userId);

        if (updateErr) { showToast('Erro ao processar compra', 'error'); return; }

        // 4. Registrar item com game_source e item_type corretos
        const { error: insertErr } = await client
            .from('shop_items')
            .insert({
                user_id:     userId,
                item_id:     itemId,
                is_active:   false,
                game_source: 'platform',
                item_type:   'theme'
            });

        if (insertErr) {
            // Reverter desconto se insert falhou
            await client.from('game_stats').update({ coins: statsData.coins }).eq('user_id', userId);
            showToast('Erro ao registrar item', 'error');
            return;
        }

        // 5. Atualizar localStorage
        const raw = localStorage.getItem('cg_current_user');
        if (raw) {
            const userData = JSON.parse(raw);
            userData.coins = newCoins;
            localStorage.setItem('cg_current_user', JSON.stringify(userData));
        }

        // 6. Atualizar header e display da loja
        const coinsEl = document.getElementById('header-coins');
        if (coinsEl) coinsEl.textContent = newCoins.toLocaleString('pt-BR');
        const shopCoinsEl = document.getElementById('shop-coins-display');
        if (shopCoinsEl) shopCoinsEl.textContent = newCoins.toLocaleString('pt-BR');

        showToast('✅ Item comprado com sucesso!', 'success');
        setTimeout(() => renderEnhancedShop(), 500);

    } catch (err) {
        console.error('❌ [Shop] buyPlatformItem:', err);
        showToast('Erro ao comprar item', 'error');
    }
}

// ============================================================
// ATUALIZAÇÃO PERIÓDICA (quando a aba loja está ativa)
// ============================================================
function startShopUpdateInterval() {
    setInterval(async () => {
        const activeBtn = document.querySelector('.nav-btn.active');
        if (activeBtn?.getAttribute('data-nav-btn') === 'shop') {
            await renderEnhancedShop();
        }
    }, 20000);
}

console.log('✅ platform-shop-enhanced.js v2.2 carregado');
