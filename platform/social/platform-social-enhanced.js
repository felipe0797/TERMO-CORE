/**
 * PLATFORM SOCIAL ENHANCED
 * Social melhorado com sistema de amigos funcional
 */

// ============================================================
// RENDERIZAR SOCIAL MELHORADO
// ============================================================
async function renderEnhancedSocial() {
    const container = document.querySelector('[data-tab="social"]');
    if (!container) return;
    
    try {
        const platformUser = localStorage.getItem('cg_current_user');
        if (!platformUser) {
            container.innerHTML = '<p>Usuário não autenticado</p>';
            return;
        }
        
        const userData = JSON.parse(platformUser);
        
        // Carregar amigos e convites
        const friends = await loadUserFriends(userData.id);
        const requests = await loadFriendRequests(userData.id);
        
        container.innerHTML = `
            <div style="padding: 20px;">
                <!-- BOTÃO ADICIONAR AMIGO -->
                <div style="background: linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 100, 200, 0.1) 100%); padding: 16px; border-radius: 12px; border: 1px solid rgba(0, 212, 255, 0.2); margin-bottom: 20px;">
                    <button onclick="showAddFriendModal()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); color: #000; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; transition: all 0.3s ease; font-size: 14px;" onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
                        ➕ Adicionar Amigo
                    </button>
                </div>
                
                <!-- ABAS -->
                <div style="display: flex; gap: 12px; margin-bottom: 20px; border-bottom: 2px solid rgba(0, 212, 255, 0.1);">
                    <button onclick="switchSocialTab('friends')" class="social-tab-btn" data-tab="friends" style="padding: 12px 20px; background: none; border: none; color: #00d4ff; font-weight: 700; cursor: pointer; border-bottom: 2px solid #00d4ff;">
                        👥 Amigos (${friends.length})
                    </button>
                    <button onclick="switchSocialTab('requests')" class="social-tab-btn" data-tab="requests" style="padding: 12px 20px; background: none; border: none; color: #a0aec0; font-weight: 700; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.3s ease;">
                        📬 Convites (${requests.length})
                    </button>
                </div>
                
                <!-- CONTEÚDO DAS ABAS -->
                <div id="social-friends" style="display: block;">
                    ${friends.length > 0 ? `
                        <div style="display: grid; gap: 12px;">
                            ${friends.map(friend => `
                                <div style="background: rgba(0, 212, 255, 0.05); padding: 12px; border-radius: 8px; border: 1px solid rgba(0, 212, 255, 0.1); display: flex; justify-content: space-between; align-items: center;">
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); display: flex; align-items: center; justify-content: center; font-size: 20px;">👤</div>
                                        <div>
                                            <div style="color: #cbd5e0; font-weight: 700;">${friend.username}</div>
                                            <div style="color: #a0aec0; font-size: 12px;">Nível ${friend.level || 1}</div>
                                        </div>
                                    </div>
                                    <button onclick="removeFriendFromPlatform('${friend.id}')" style="padding: 8px 12px; background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 700; transition: all 0.3s ease;" onmouseover="this.style.background='rgba(239, 68, 68, 0.3)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.2)'">
                                        Remover
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div style="text-align: center; color: #a0aec0; padding: 40px 20px;">
                            <p>Você ainda não tem amigos</p>
                            <p style="font-size: 12px;">Clique em "Adicionar Amigo" para começar!</p>
                        </div>
                    `}
                </div>
                
                <div id="social-requests" style="display: none;">
                    ${requests.length > 0 ? `
                        <div style="display: grid; gap: 12px;">
                            ${requests.map(request => `
                                <div style="background: rgba(0, 212, 255, 0.05); padding: 12px; border-radius: 8px; border: 1px solid rgba(0, 212, 255, 0.1); display: flex; justify-content: space-between; align-items: center;">
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); display: flex; align-items: center; justify-content: center; font-size: 20px;">👤</div>
                                        <div>
                                            <div style="color: #cbd5e0; font-weight: 700;">${request.username}</div>
                                            <div style="color: #a0aec0; font-size: 12px;">Quer ser seu amigo</div>
                                        </div>
                                    </div>
                                    <div style="display: flex; gap: 8px;">
                                        <button onclick="acceptFriendRequestFromPlatform('${request.id}')" style="padding: 8px 12px; background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 700; transition: all 0.3s ease;" onmouseover="this.style.background='rgba(16, 185, 129, 0.3)'" onmouseout="this.style.background='rgba(16, 185, 129, 0.2)'">
                                            ✓ Aceitar
                                        </button>
                                        <button onclick="rejectFriendRequestFromPlatform('${request.id}')" style="padding: 8px 12px; background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 700; transition: all 0.3s ease;" onmouseover="this.style.background='rgba(239, 68, 68, 0.3)'" onmouseout="this.style.background='rgba(239, 68, 68, 0.2)'">
                                            ✕ Rejeitar
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div style="text-align: center; color: #a0aec0; padding: 40px 20px;">
                            <p>Nenhum convite pendente</p>
                        </div>
                    `}
                </div>
            </div>
            
            <!-- MODAL ADICIONAR AMIGO -->
            <div id="add-friend-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); z-index: 10000; align-items: center; justify-content: center;">
                <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 24px; border-radius: 12px; border: 1px solid rgba(0, 212, 255, 0.2); max-width: 400px; width: 90%;">
                    <div style="font-weight: 700; color: #00d4ff; margin-bottom: 16px; font-size: 16px;">➕ Adicionar Amigo</div>
                    <input type="text" id="friend-username-input" placeholder="Digite o nome de usuário" style="width: 100%; padding: 10px; background: rgba(0, 212, 255, 0.05); border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 6px; color: #cbd5e0; margin-bottom: 16px; box-sizing: border-box;" />
                    <div style="display: flex; gap: 12px;">
                        <button onclick="sendFriendRequestFromPlatform()" style="flex: 1; padding: 10px; background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%); color: #000; border: none; border-radius: 6px; font-weight: 700; cursor: pointer;">
                            Enviar Convite
                        </button>
                        <button onclick="closeAddFriendModal()" style="flex: 1; padding: 10px; background: rgba(0, 212, 255, 0.1); color: #00d4ff; border: 1px solid rgba(0, 212, 255, 0.2); border-radius: 6px; font-weight: 700; cursor: pointer;">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        console.log('✅ Social renderizado com sucesso');
    } catch (error) {
        console.error('❌ Erro ao renderizar social:', error);
        container.innerHTML = '<p>Erro ao carregar social</p>';
    }
}

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================
function switchSocialTab(tabName) {
    document.querySelectorAll('[id^="social-"]').forEach(tab => {
        tab.style.display = 'none';
    });
    document.getElementById(`social-${tabName}`).style.display = 'block';
    
    document.querySelectorAll('.social-tab-btn').forEach(btn => {
        btn.style.color = '#a0aec0';
        btn.style.borderBottom = '2px solid transparent';
    });
    document.querySelector(`[data-tab="${tabName}"]`).style.color = '#00d4ff';
    document.querySelector(`[data-tab="${tabName}"]`).style.borderBottom = '2px solid #00d4ff';
}

function showAddFriendModal() {
    document.getElementById('add-friend-modal').style.display = 'flex';
}

function closeAddFriendModal() {
    document.getElementById('add-friend-modal').style.display = 'none';
    document.getElementById('friend-username-input').value = '';
}

async function sendFriendRequestFromPlatform() {
    const username = document.getElementById('friend-username-input').value.trim();
    if (!username) {
        showToast('Digite um nome de usuário', 'warning');
        return;
    }
    
    try {
        const platformUser = localStorage.getItem('cg_current_user');
        if (!platformUser) return;
        
        const userData = JSON.parse(platformUser);
        
        // Chamar função do TermoCore se existir
        if (typeof sendFriendRequest === 'function') {
            await sendFriendRequest(userData.id, username);
            showToast(`✅ Convite enviado para ${username}!`, 'success');
            closeAddFriendModal();
            setTimeout(() => renderEnhancedSocial(), 500);
        } else {
            showToast('Função de amigos não disponível', 'error');
        }
    } catch (error) {
        console.error('❌ Erro ao enviar convite:', error);
        showToast('Erro ao enviar convite', 'error');
    }
}

async function loadUserFriends(userId) {
    try {
        if (typeof getFriendsList === 'function') {
            return await getFriendsList(userId);
        }
        return [];
    } catch (error) {
        console.error('❌ Erro ao carregar amigos:', error);
        return [];
    }
}

async function loadFriendRequests(userId) {
    try {
        if (typeof getFriendRequests === 'function') {
            return await getFriendRequests(userId);
        }
        return [];
    } catch (error) {
        console.error('❌ Erro ao carregar convites:', error);
        return [];
    }
}

async function acceptFriendRequestFromPlatform(friendId) {
    try {
        if (typeof acceptFriendRequest === 'function') {
            await acceptFriendRequest(friendId);
            showToast('✅ Convite aceito!', 'success');
            setTimeout(() => renderEnhancedSocial(), 500);
        }
    } catch (error) {
        console.error('❌ Erro ao aceitar convite:', error);
        showToast('Erro ao aceitar convite', 'error');
    }
}

async function rejectFriendRequestFromPlatform(friendId) {
    try {
        if (typeof rejectFriendRequest === 'function') {
            await rejectFriendRequest(friendId);
            showToast('✅ Convite rejeitado', 'success');
            setTimeout(() => renderEnhancedSocial(), 500);
        }
    } catch (error) {
        console.error('❌ Erro ao rejeitar convite:', error);
        showToast('Erro ao rejeitar convite', 'error');
    }
}

async function removeFriendFromPlatform(friendId) {
    try {
        if (typeof removeFriend === 'function') {
            await removeFriend(friendId);
            showToast('✅ Amigo removido', 'success');
            setTimeout(() => renderEnhancedSocial(), 500);
        }
    } catch (error) {
        console.error('❌ Erro ao remover amigo:', error);
        showToast('Erro ao remover amigo', 'error');
    }
}
