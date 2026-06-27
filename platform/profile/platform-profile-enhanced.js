/**
 * PLATFORM PROFILE ENHANCED v2.2
 * Perfil global da plataforma Core Games.
 * - Stats reais (XP, Moedas, Fichas, Nível) do TermoCore
 * - Avatar real (item ativo em shop_items)
 * - Inventário global por categoria: Avatares, Cosméticos, Temas (plataforma)
 * - Filtro de avatares por jogo
 * - Equipar/desequipar itens diretamente do inventário
 */

// ============================================================
// RENDERIZAR PERFIL COMPLETO
// ============================================================
async function renderEnhancedProfile() {
    const container = document.querySelector('[data-tab="profile"]');
    if (!container) return;

    try {
        const raw = localStorage.getItem('cg_current_user');
        if (!raw) {
            container.innerHTML = '<p style="color:#a0aec0;padding:20px;">Usuário não autenticado</p>';
            return;
        }
        const userData = JSON.parse(raw);

        // Carregar dados em paralelo
        const [stats, avatarHTML, inventory] = await Promise.all([
            loadUserDataFromTermoCore(userData.id),
            getUserAvatar(userData.id),
            getUserInventory(userData.id)
        ]);

        // Atualizar localStorage com dados reais
        if (stats) {
            userData.xp          = stats.xp;
            userData.coins       = stats.coins;
            userData.spinTickets = stats.spinTickets;
            localStorage.setItem('cg_current_user', JSON.stringify(userData));
        }

        const levelInfo = calculateLevelFromXP(stats?.xp || 0);

        // Estado dos filtros (persistência na sessão)
        if (window._invTab  === undefined) window._invTab  = 'avatar';
        if (window._invGame === undefined) window._invGame = 'all';

        // Filtrar inventário pela aba e jogo ativos
        const filtered = inventory.filter(item => {
            if (item.type !== window._invTab) return false;
            if (window._invTab === 'avatar' && window._invGame !== 'all') {
                if (item.gameId !== window._invGame) return false;
            }
            return true;
        });

        // Jogos únicos que têm avatares no inventário
        const gamesWithAvatars = [...new Set(
            inventory.filter(i => i.type === 'avatar').map(i => i.gameId)
        )];

        const gameLabels = {
            termocore: 'TermoCore',
            platform:  'Plataforma'
        };

        // Data de cadastro
        const joinDate = userData.created_at
            ? new Date(userData.created_at).toLocaleDateString('pt-BR')
            : 'Desconhecida';

        container.innerHTML = `
        <div style="padding:20px;max-width:900px;margin:0 auto;">

            <!-- CARD DE IDENTIDADE -->
            <div style="background:linear-gradient(135deg,rgba(0,212,255,.1),rgba(0,100,200,.1));padding:24px;border-radius:12px;border:1px solid rgba(0,212,255,.2);margin-bottom:20px;">
                <div style="display:flex;align-items:center;gap:20px;margin-bottom:20px;flex-wrap:wrap;">
                    <!-- AVATAR -->
                    <div style="width:100px;height:100px;border-radius:50%;background:linear-gradient(135deg,#00d4ff,#0099cc);display:flex;align-items:center;justify-content:center;border:3px solid rgba(0,212,255,.4);overflow:hidden;flex-shrink:0;">
                        ${avatarHTML}
                    </div>
                    <!-- NOME E NÍVEL -->
                    <div>
                        <div style="font-size:26px;font-weight:700;color:#00d4ff;">${userData.username || 'Jogador'}</div>
                        <div style="color:#a0aec0;font-size:14px;margin-top:2px;">Nível ${levelInfo.level}</div>
                        <div style="color:#718096;font-size:12px;margin-top:6px;">Jogador desde: ${joinDate}</div>
                    </div>
                </div>

                <!-- BARRA DE XP -->
                <div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                        <span style="color:#a0aec0;font-size:12px;">Experiência</span>
                        <span style="color:#00d4ff;font-weight:700;font-size:12px;">${(stats?.xp||0).toLocaleString('pt-BR')} / ${levelInfo.xpForNextLevel.toLocaleString('pt-BR')} XP</span>
                    </div>
                    <div style="width:100%;height:8px;background:rgba(0,212,255,.1);border-radius:4px;overflow:hidden;">
                        <div style="width:${levelInfo.progressPercent}%;height:100%;background:linear-gradient(90deg,#00d4ff,#0099cc);transition:width .4s ease;"></div>
                    </div>
                </div>
            </div>

            <!-- STATS -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:14px;margin-bottom:20px;">
                ${[
                    { icon:'⭐', label:'XP Total',     value:(stats?.xp||0).toLocaleString('pt-BR') },
                    { icon:'💰', label:'Moedas',        value:(stats?.coins||0).toLocaleString('pt-BR') },
                    { icon:'🎟️', label:'Fichas',        value:(stats?.spinTickets||0).toLocaleString('pt-BR') },
                    { icon:'🎮', label:'Partidas',      value:(stats?.totalGames||0).toLocaleString('pt-BR') }
                ].map(s => `
                    <div style="background:rgba(0,212,255,.05);padding:16px;border-radius:8px;border:1px solid rgba(0,212,255,.1);text-align:center;">
                        <div style="font-size:22px;margin-bottom:6px;">${s.icon}</div>
                        <div style="color:#a0aec0;font-size:11px;margin-bottom:4px;">${s.label}</div>
                        <div style="color:#00d4ff;font-weight:700;font-size:18px;">${s.value}</div>
                    </div>
                `).join('')}
            </div>

            <!-- INVENTÁRIO GLOBAL -->
            <div style="background:linear-gradient(135deg,rgba(0,212,255,.1),rgba(0,100,200,.1));padding:24px;border-radius:12px;border:1px solid rgba(0,212,255,.2);">

                <!-- TÍTULO + ABAS DE CATEGORIA -->
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
                    <div style="font-weight:700;color:#00d4ff;font-size:17px;">📦 Inventário Global</div>
                    <div style="display:flex;gap:6px;background:rgba(0,0,0,.25);padding:4px;border-radius:8px;">
                        ${['avatar','cosmetic','theme'].map(tab => {
                            const labels = { avatar:'Avatares', cosmetic:'Cosméticos', theme:'Temas' };
                            const active = window._invTab === tab;
                            return `<button
                                onclick="window._invTab='${tab}';window._invGame='all';renderEnhancedProfile()"
                                style="padding:6px 12px;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;transition:all .2s;
                                       background:${active?'#00d4ff':'transparent'};
                                       color:${active?'#000':'#a0aec0'};">
                                ${labels[tab]}
                            </button>`;
                        }).join('')}
                    </div>
                </div>

                <!-- FILTRO POR JOGO (só para Avatares) -->
                ${window._invTab === 'avatar' && gamesWithAvatars.length > 1 ? `
                    <div style="margin-bottom:14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                        <span style="color:#a0aec0;font-size:12px;">Filtrar por jogo:</span>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;">
                            ${['all',...gamesWithAvatars].map(g => {
                                const active = window._invGame === g;
                                const label  = g === 'all' ? 'Todos' : (gameLabels[g] || g.charAt(0).toUpperCase()+g.slice(1));
                                return `<button
                                    onclick="window._invGame='${g}';renderEnhancedProfile()"
                                    style="padding:4px 10px;border:1px solid ${active?'#00d4ff':'rgba(0,212,255,.2)'};border-radius:4px;cursor:pointer;font-size:11px;
                                           background:${active?'rgba(0,212,255,.15)':'transparent'};
                                           color:${active?'#00d4ff':'#a0aec0'};">
                                    ${label}
                                </button>`;
                            }).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- NOTA SOBRE TEMAS -->
                ${window._invTab === 'theme' ? `
                    <div style="background:rgba(0,212,255,.05);border:1px solid rgba(0,212,255,.15);border-radius:6px;padding:10px 14px;margin-bottom:14px;font-size:12px;color:#a0aec0;">
                        💡 Aqui aparecem apenas os <strong style="color:#00d4ff;">temas da plataforma</strong> Core Games.
                        Os temas dos jogos (ex.: TermoCore) ficam no inventário de cada jogo.
                    </div>
                ` : ''}

                <!-- GRID DE ITENS -->
                ${filtered.length > 0 ? `
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:12px;">
                        ${filtered.map(item => `
                            <div style="background:rgba(0,212,255,.05);padding:12px;border-radius:8px;
                                        border:2px solid ${item.isActive?'rgba(0,212,255,.6)':'rgba(0,212,255,.1)'};
                                        text-align:center;cursor:pointer;transition:all .2s;position:relative;"
                                 onmouseover="this.style.transform='scale(1.04)';this.style.borderColor='rgba(0,212,255,.4)'"
                                 onmouseout="this.style.transform='scale(1)';this.style.borderColor='${item.isActive?'rgba(0,212,255,.6)':'rgba(0,212,255,.1)'}'"
                                 onclick="handleInventoryItemClick('${item.id}','${item.isActive}')">

                                <!-- ÍCONE / IMAGEM -->
                                <div style="width:60px;height:60px;margin:0 auto 8px;display:flex;align-items:center;justify-content:center;font-size:30px;background:rgba(0,0,0,.2);border-radius:8px;overflow:hidden;">
                                    ${item.avatarUrl
                                        ? `<img src="${item.avatarUrl}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.innerHTML='${item.icon}'">`
                                        : item.icon}
                                </div>

                                <!-- NOME -->
                                <div style="color:#cbd5e0;font-size:11px;font-weight:600;word-break:break-word;margin-bottom:2px;">${item.name}</div>

                                <!-- JOGO -->
                                <div style="color:#718096;font-size:9px;text-transform:uppercase;letter-spacing:.8px;">${gameLabels[item.gameId]||item.gameId}</div>

                                <!-- STATUS EQUIPADO -->
                                ${item.isActive
                                    ? `<div style="color:#10b981;font-size:10px;margin-top:6px;font-weight:700;">✓ EQUIPADO</div>`
                                    : `<div style="color:#4a5568;font-size:10px;margin-top:6px;">Clique p/ equipar</div>`}
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div style="text-align:center;color:#a0aec0;padding:40px 20px;background:rgba(0,0,0,.1);border-radius:8px;">
                        <div style="font-size:40px;margin-bottom:12px;">📦</div>
                        <p>Nenhum item encontrado nesta categoria.</p>
                        ${window._invTab==='theme'
                            ? '<p style="font-size:11px;margin-top:8px;">Compre temas na Loja da plataforma!</p>'
                            : '<p style="font-size:11px;margin-top:8px;">Jogue TermoCore e visite a loja para obter itens!</p>'}
                    </div>
                `}
            </div>
        </div>
        `;

        // Atualizar header com dados reais
        const coinsEl   = document.getElementById('header-coins');
        const ticketsEl = document.getElementById('header-tickets');
        if (coinsEl)   coinsEl.textContent   = (stats?.coins||0).toLocaleString('pt-BR');
        if (ticketsEl) ticketsEl.textContent  = (stats?.spinTickets||0).toLocaleString('pt-BR');

        console.log('✅ [Profile] Perfil renderizado');
    } catch (err) {
        console.error('❌ [Profile] renderEnhancedProfile:', err);
        container.innerHTML = '<p style="color:#ef4444;padding:20px;">Erro ao carregar perfil. Tente novamente.</p>';
    }
}

// ============================================================
// HANDLER DE CLIQUE NO INVENTÁRIO
// ============================================================
async function handleInventoryItemClick(itemId, isActiveStr) {
    const raw = localStorage.getItem('cg_current_user');
    if (!raw) return;
    const userData = JSON.parse(raw);
    const isActive = isActiveStr === 'true';

    if (isActive) {
        // Desequipar
        const ok = await unequipItemFromPlatform(userData.id, itemId);
        if (ok) setTimeout(() => renderEnhancedProfile(), 400);
    } else {
        // Equipar
        const ok = await equipItemFromPlatform(userData.id, itemId);
        if (ok) setTimeout(() => renderEnhancedProfile(), 400);
    }
}

// ============================================================
// ATUALIZAÇÃO PERIÓDICA (quando a aba perfil está ativa)
// ============================================================
function startProfileUpdateInterval() {
    setInterval(async () => {
        const activeBtn = document.querySelector('.nav-btn.active');
        if (activeBtn?.getAttribute('data-nav-btn') === 'profile') {
            await renderEnhancedProfile();
        }
    }, 15000);
}

console.log('✅ platform-profile-enhanced.js v2.2 carregado');
