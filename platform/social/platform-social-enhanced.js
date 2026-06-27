/**
 * PLATFORM SOCIAL ENHANCED v2.2
 * Aba Social da plataforma Core Games.
 * Usa as funções reais do TermoCore:
 *   loadFriends(userId)          → lista amigos + pendentes
 *   sendFriendRequest(userId, username)
 *   acceptFriendRequest(requestId)
 *   removeFriend(requestId)
 */

// ============================================================
// RENDERIZAR SOCIAL
// ============================================================
async function renderEnhancedSocial() {
    const container = document.querySelector('[data-tab="social"]');
    if (!container) return;

    try {
        const raw = localStorage.getItem('cg_current_user');
        if (!raw) {
            container.innerHTML = '<p style="color:#a0aec0;padding:20px;">Usuário não autenticado</p>';
            return;
        }
        const userData = JSON.parse(raw);

        // Carregar todas as relações de amizade
        const allRelations = typeof loadFriends === 'function'
            ? await loadFriends(userData.id)
            : [];

        // Separar amigos aceitos de convites pendentes recebidos
        const friends  = allRelations.filter(r =>
            r.status === 'accepted'
        );
        const requests = allRelations.filter(r =>
            r.status === 'pending' && r.user_id !== userData.id
        );

        // Montar dados de exibição de cada amigo
        const friendsDisplay = friends.map(r => {
            const isSender   = r.user_id === userData.id;
            const friendUser = isSender ? r.receiver : r.sender;
            return {
                id:       r.id,
                username: friendUser?.username || 'Usuário',
                userId:   isSender ? r.friend_id : r.user_id
            };
        });

        const requestsDisplay = requests.map(r => ({
            id:       r.id,
            username: r.sender?.username || 'Usuário',
            userId:   r.user_id
        }));

        container.innerHTML = `
        <div style="padding:20px;max-width:700px;margin:0 auto;">

            <!-- BOTÃO ADICIONAR AMIGO -->
            <div style="background:linear-gradient(135deg,rgba(0,212,255,.1),rgba(0,100,200,.1));padding:16px;border-radius:12px;border:1px solid rgba(0,212,255,.2);margin-bottom:20px;">
                <button onclick="showAddFriendModal()"
                    style="width:100%;padding:12px;background:linear-gradient(135deg,#00d4ff,#0099cc);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;font-size:14px;transition:all .2s;"
                    onmouseover="this.style.transform='scale(1.02)'"
                    onmouseout="this.style.transform='scale(1)'">
                    ➕ Adicionar Amigo
                </button>
            </div>

            <!-- ABAS -->
            <div style="display:flex;gap:12px;margin-bottom:20px;border-bottom:2px solid rgba(0,212,255,.1);">
                <button onclick="switchSocialTab('friends')" class="social-tab-btn" data-social-tab="friends"
                    style="padding:12px 20px;background:none;border:none;color:#00d4ff;font-weight:700;cursor:pointer;border-bottom:2px solid #00d4ff;transition:all .2s;">
                    👥 Amigos (${friendsDisplay.length})
                </button>
                <button onclick="switchSocialTab('requests')" class="social-tab-btn" data-social-tab="requests"
                    style="padding:12px 20px;background:none;border:none;color:#a0aec0;font-weight:700;cursor:pointer;border-bottom:2px solid transparent;transition:all .2s;">
                    📬 Convites ${requestsDisplay.length > 0 ? `<span style="background:#ef4444;color:#fff;border-radius:50%;padding:1px 6px;font-size:11px;margin-left:4px;">${requestsDisplay.length}</span>` : `(0)`}
                </button>
            </div>

            <!-- LISTA DE AMIGOS -->
            <div id="social-friends" style="display:block;">
                ${friendsDisplay.length > 0 ? `
                    <div style="display:grid;gap:12px;">
                        ${friendsDisplay.map(f => `
                            <div style="background:rgba(0,212,255,.05);padding:14px;border-radius:8px;border:1px solid rgba(0,212,255,.1);display:flex;justify-content:space-between;align-items:center;gap:12px;">
                                <div style="display:flex;align-items:center;gap:12px;">
                                    <div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#00d4ff,#0099cc);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">👤</div>
                                    <div>
                                        <div style="color:#cbd5e0;font-weight:700;">${f.username}</div>
                                        <div style="color:#718096;font-size:12px;">Amigo</div>
                                    </div>
                                </div>
                                <button onclick="removeFriendFromPlatform('${f.id}')"
                                    style="padding:7px 12px;background:rgba(239,68,68,.15);color:#ef4444;border:1px solid rgba(239,68,68,.3);border-radius:6px;cursor:pointer;font-size:12px;font-weight:700;transition:all .2s;"
                                    onmouseover="this.style.background='rgba(239,68,68,.3)'"
                                    onmouseout="this.style.background='rgba(239,68,68,.15)'">
                                    Remover
                                </button>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div style="text-align:center;color:#a0aec0;padding:40px 20px;background:rgba(0,0,0,.1);border-radius:8px;">
                        <div style="font-size:40px;margin-bottom:12px;">👥</div>
                        <p>Você ainda não tem amigos.</p>
                        <p style="font-size:12px;margin-top:6px;">Clique em "Adicionar Amigo" para começar!</p>
                    </div>
                `}
            </div>

            <!-- LISTA DE CONVITES PENDENTES -->
            <div id="social-requests" style="display:none;">
                ${requestsDisplay.length > 0 ? `
                    <div style="display:grid;gap:12px;">
                        ${requestsDisplay.map(r => `
                            <div style="background:rgba(0,212,255,.05);padding:14px;border-radius:8px;border:1px solid rgba(0,212,255,.1);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
                                <div style="display:flex;align-items:center;gap:12px;">
                                    <div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,#00d4ff,#0099cc);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">👤</div>
                                    <div>
                                        <div style="color:#cbd5e0;font-weight:700;">${r.username}</div>
                                        <div style="color:#a0aec0;font-size:12px;">Quer ser seu amigo</div>
                                    </div>
                                </div>
                                <div style="display:flex;gap:8px;">
                                    <button onclick="acceptFriendRequestFromPlatform('${r.id}')"
                                        style="padding:7px 12px;background:rgba(16,185,129,.15);color:#10b981;border:1px solid rgba(16,185,129,.3);border-radius:6px;cursor:pointer;font-size:12px;font-weight:700;transition:all .2s;"
                                        onmouseover="this.style.background='rgba(16,185,129,.3)'"
                                        onmouseout="this.style.background='rgba(16,185,129,.15)'">
                                        ✓ Aceitar
                                    </button>
                                    <button onclick="rejectFriendRequestFromPlatform('${r.id}')"
                                        style="padding:7px 12px;background:rgba(239,68,68,.15);color:#ef4444;border:1px solid rgba(239,68,68,.3);border-radius:6px;cursor:pointer;font-size:12px;font-weight:700;transition:all .2s;"
                                        onmouseover="this.style.background='rgba(239,68,68,.3)'"
                                        onmouseout="this.style.background='rgba(239,68,68,.15)'">
                                        ✕ Rejeitar
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div style="text-align:center;color:#a0aec0;padding:40px 20px;background:rgba(0,0,0,.1);border-radius:8px;">
                        <div style="font-size:40px;margin-bottom:12px;">📬</div>
                        <p>Nenhum convite pendente.</p>
                    </div>
                `}
            </div>
        </div>

        <!-- MODAL ADICIONAR AMIGO -->
        <div id="add-friend-modal"
             style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.75);z-index:10000;align-items:center;justify-content:center;">
            <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:28px;border-radius:12px;border:1px solid rgba(0,212,255,.25);max-width:400px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,.5);">
                <div style="font-weight:700;color:#00d4ff;margin-bottom:16px;font-size:16px;">➕ Adicionar Amigo</div>
                <input type="text" id="friend-username-input"
                       placeholder="Digite o nome de usuário"
                       style="width:100%;padding:10px;background:rgba(0,212,255,.05);border:1px solid rgba(0,212,255,.2);border-radius:6px;color:#cbd5e0;margin-bottom:16px;box-sizing:border-box;font-size:14px;"
                       onkeydown="if(event.key==='Enter') sendFriendRequestFromPlatform()"/>
                <div style="display:flex;gap:12px;">
                    <button onclick="sendFriendRequestFromPlatform()"
                        style="flex:1;padding:10px;background:linear-gradient(135deg,#00d4ff,#0099cc);color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;font-size:14px;">
                        Enviar Convite
                    </button>
                    <button onclick="closeAddFriendModal()"
                        style="flex:1;padding:10px;background:rgba(0,212,255,.1);color:#00d4ff;border:1px solid rgba(0,212,255,.2);border-radius:6px;font-weight:700;cursor:pointer;font-size:14px;">
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
        `;

        console.log('✅ [Social] Social renderizado');
    } catch (err) {
        console.error('❌ [Social] renderEnhancedSocial:', err);
        container.innerHTML = '<p style="color:#ef4444;padding:20px;">Erro ao carregar social. Tente novamente.</p>';
    }
}

// ============================================================
// TROCA DE ABAS SOCIAL
// ============================================================
function switchSocialTab(tabName) {
    ['friends','requests'].forEach(t => {
        const el = document.getElementById(`social-${t}`);
        if (el) el.style.display = t === tabName ? 'block' : 'none';
    });
    document.querySelectorAll('.social-tab-btn').forEach(btn => {
        const isActive = btn.getAttribute('data-social-tab') === tabName;
        btn.style.color       = isActive ? '#00d4ff' : '#a0aec0';
        btn.style.borderBottom = isActive ? '2px solid #00d4ff' : '2px solid transparent';
    });
}

// ============================================================
// MODAL
// ============================================================
function showAddFriendModal() {
    const modal = document.getElementById('add-friend-modal');
    if (modal) modal.style.display = 'flex';
}

function closeAddFriendModal() {
    const modal = document.getElementById('add-friend-modal');
    if (modal) modal.style.display = 'none';
    const input = document.getElementById('friend-username-input');
    if (input) input.value = '';
}

// ============================================================
// AÇÕES DE AMIZADE (usam funções reais do TermoCore)
// ============================================================
async function sendFriendRequestFromPlatform() {
    const input = document.getElementById('friend-username-input');
    const username = input?.value?.trim();
    if (!username) { showToast('Digite um nome de usuário', 'warning'); return; }

    const raw = localStorage.getItem('cg_current_user');
    if (!raw) return;
    const userData = JSON.parse(raw);

    if (typeof sendFriendRequest !== 'function') {
        showToast('Função de amigos não disponível', 'error');
        return;
    }

    const result = await sendFriendRequest(userData.id, username);
    if (result?.success) {
        showToast(`✅ Convite enviado para ${username}!`, 'success');
        closeAddFriendModal();
        setTimeout(() => renderEnhancedSocial(), 500);
    } else {
        showToast(result?.error || 'Erro ao enviar convite', 'error');
    }
}

async function acceptFriendRequestFromPlatform(requestId) {
    if (typeof acceptFriendRequest !== 'function') return;
    const ok = await acceptFriendRequest(requestId);
    if (ok) {
        showToast('✅ Convite aceito!', 'success');
        setTimeout(() => renderEnhancedSocial(), 500);
    } else {
        showToast('Erro ao aceitar convite', 'error');
    }
}

async function rejectFriendRequestFromPlatform(requestId) {
    // Rejeitar = deletar o registro de solicitação pendente
    if (typeof removeFriend !== 'function') return;
    const ok = await removeFriend(requestId);
    if (ok) {
        showToast('Convite rejeitado.', 'info');
        setTimeout(() => renderEnhancedSocial(), 500);
    } else {
        showToast('Erro ao rejeitar convite', 'error');
    }
}

async function removeFriendFromPlatform(requestId) {
    if (typeof removeFriend !== 'function') return;
    const ok = await removeFriend(requestId);
    if (ok) {
        showToast('Amigo removido.', 'info');
        setTimeout(() => renderEnhancedSocial(), 500);
    } else {
        showToast('Erro ao remover amigo', 'error');
    }
}

console.log('✅ platform-social-enhanced.js v2.2 carregado');
